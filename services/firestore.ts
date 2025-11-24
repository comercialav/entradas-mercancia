import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    QueryDocumentSnapshot,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore';
import type { Delivery, DeliveryStatus, UserRole, IslandCode } from '../types';
import { db } from '../firebase';

export type FirestoreRole = 'compras' | 'almacen' | 'admin';

export interface FirestoreUserProfile {
    uid: string;
    displayName: string;
    role: FirestoreRole;
    email?: string;
    island?: IslandCode;
}

const timestampToISO = (value?: Timestamp | null): string | null => {
    if (!value) return null;
    return value.toDate().toISOString();
};

const mapFirestoreStatusToDelivery = (status?: string): DeliveryStatus => {
    switch (status) {
        case 'ARRIVED':
        case 'DELIVERED':
            return 'En almacén';
        case 'REGISTERED':
            return 'Dado de alta';
        case 'PLANNED':
        default:
            return 'En tránsito';
    }
};

const mapDeliveryStatusToFirestore = (status: DeliveryStatus): string => {
    switch (status) {
        case 'En almacén':
            return 'ARRIVED';
        case 'Dado de alta':
            return 'REGISTERED';
        case 'En tránsito':
        default:
            return 'PLANNED';
    }
};

const docToDelivery = (docSnap: QueryDocumentSnapshot<DocumentData>): Delivery => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        supplier: data.supplierName ?? 'Proveedor sin nombre',
        expectedDate: timestampToISO(data.expectedDate) ?? new Date().toISOString(),
        arrival: timestampToISO(data.arrivalDateTime),
        pallets: data.pallets ?? null,
        packages: data.packages ?? null,
        status: mapFirestoreStatusToDelivery(data.status),
        lastUpdate: timestampToISO(data.updatedAt) ?? timestampToISO(data.createdAt) ?? new Date().toISOString(),
        notes: data.expectedNotes ?? undefined,
        tracking: data.trackingCode ?? null,
        observations: data.observations ?? null,
        island: (data.island as IslandCode) ?? 'GC',
        estimatedPallets: data.estimatedPallets != null ? Number(data.estimatedPallets) : null,
        estimatedPackages: data.estimatedPackages != null ? Number(data.estimatedPackages) : null,
        transportCompany: data.transportCompany ?? null,
    };
};

const normalizeSupplierId = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '-');

const dateFromInput = (date: string) => {
    if (!date) {
        return new Date();
    }
    return new Date(`${date}T00:00:00`);
};

export const listenToShipments = (
    options: { archived: boolean },
    callback: (deliveries: Delivery[]) => void,
    onError?: (error: unknown) => void,
) => {
    const shipmentsRef = collection(db, 'shipments');
    const shipmentsQuery = query(
        shipmentsRef,
        where('archived', '==', options.archived),
    );

    return onSnapshot(
        shipmentsQuery,
        (snapshot) => {
            const deliveries = snapshot.docs.map(docToDelivery);
            const sorted = [...deliveries].sort((a, b) => {
                if (options.archived) {
                    return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
                }
                return new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime();
            });
            callback(sorted);
        },
        (error) => {
            console.error('Error listening shipments', error);
            onError?.(error);
        }
    );
};

interface CreateShipmentInput {
    supplier: string;
    expectedDate: string;
    notes?: string;
    tracking?: string;
    userId: string;
    userDisplayName?: string | null;
    island: IslandCode;
    estimatedPallets?: number | null;
    estimatedPackages?: number | null;
    transportCompany?: string | null;
}

export const createShipment = async ({
    supplier,
    expectedDate,
    notes,
    tracking,
    userId,
    userDisplayName,
    island,
    estimatedPallets,
    estimatedPackages,
    transportCompany,
}: CreateShipmentInput) => {
    if (!supplier || !expectedDate) {
        throw new Error('Proveedor y fecha prevista son obligatorios');
    }

    const supplierName = supplier.trim();
    const payload = {
        supplierId: normalizeSupplierId(supplierName),
        supplierName,
        supplierNameLower: supplierName.toLowerCase(),
        expectedDate: Timestamp.fromDate(dateFromInput(expectedDate)),
        expectedByUserId: userId,
        expectedByName: userDisplayName ?? null,
        expectedNotes: notes?.trim() || null,
        trackingCode: tracking?.trim() || null,
        observations: null,
        island,
        arrivalDateTime: null,
        pallets: null,
        packages: null,
        estimatedPallets: estimatedPallets != null ? Number(estimatedPallets) : null,
        estimatedPackages: estimatedPackages != null ? Number(estimatedPackages) : null,
        transportCompany: transportCompany?.trim() || null,
        arrivalByUserId: null,
        status: 'PLANNED',
        deliveredAt: null,
        deliveredByUserId: null,
        registeredAt: null,
        registeredByUserId: null,
        archived: false,
        archivedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'shipments'), payload);
};

export const updateShipmentFromDelivery = async (
    delivery: Delivery,
    meta: { userId: string; userDisplayName?: string | null },
) => {
    const shipmentRef = doc(db, 'shipments', delivery.id);
    const firestoreStatus = mapDeliveryStatusToFirestore(delivery.status);
    const updatePayload: Record<string, unknown> = {
        arrivalDateTime: delivery.arrival ? Timestamp.fromDate(new Date(delivery.arrival)) : null,
        pallets: delivery.pallets ?? null,
        packages: delivery.packages ?? null,
        status: firestoreStatus,
        updatedAt: serverTimestamp(),
        trackingCode: delivery.tracking ?? null,
        observations: delivery.observations ?? null,
        island: delivery.island,
    };

    if (firestoreStatus === 'ARRIVED') {
        updatePayload.arrivalByUserId = meta.userId;
    }

    if (firestoreStatus === 'REGISTERED') {
        updatePayload.registeredByUserId = meta.userId;
        updatePayload.registeredByName = meta.userDisplayName ?? null;
        updatePayload.registeredAt = serverTimestamp();
    }

    await updateDoc(shipmentRef, updatePayload);
};

export const archiveRegisteredShipments = async () => {
    const shipmentsRef = collection(db, 'shipments');
    const snapshot = await getDocs(
        query(shipmentsRef, where('archived', '==', false), where('status', '==', 'REGISTERED')),
    );

    if (snapshot.empty) {
        return 0;
    }

    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
        batch.update(docSnap.ref, {
            archived: true,
            archivedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    });

    await batch.commit();
    return snapshot.size;
};

export const getUserProfileById = async (uid: string): Promise<FirestoreUserProfile | null> => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        return null;
    }
    const data = userSnap.data();
    return {
        uid,
        displayName: data.displayName ?? 'Usuario',
        role: (data.role ?? 'compras') as FirestoreRole,
        email: data.email ?? undefined,
        island: data.island ?? undefined,
    };
};

export const mapFirestoreRoleToUserRole = (role?: FirestoreRole | null): UserRole => {
    if (role === 'almacen') {
        return 'Almacén';
    }
    return 'Compras';
};

export const deleteShipmentById = async (shipmentId: string) => {
    const shipmentRef = doc(db, 'shipments', shipmentId);
    await deleteDoc(shipmentRef);
};

