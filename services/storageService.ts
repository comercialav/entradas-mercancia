import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { DeliveryPhoto } from '../types';

/**
 * Genera un ID único para las fotos
 */
const generatePhotoId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Sube una foto de incidencia para una entrega
 */
export const uploadDeliveryPhoto = async (
    deliveryId: string,
    file: File,
    userId: string,
    userDisplayName?: string
): Promise<DeliveryPhoto> => {
    const photoId = generatePhotoId();
    const extension = file.name.split('.').pop() || 'jpg';
    const storagePath = `shipments/${deliveryId}/photos/${photoId}.${extension}`;

    const storageRef = ref(storage, storagePath);

    // Subir archivo a Storage
    await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
            uploadedBy: userId,
            deliveryId: deliveryId,
        },
    });

    // Obtener URL de descarga
    const url = await getDownloadURL(storageRef);

    const photo: DeliveryPhoto = {
        id: photoId,
        url,
        uploadedAt: new Date().toISOString(),
        uploadedBy: userId,
        uploadedByName: userDisplayName,
    };

    // Añadir referencia de la foto al documento de Firestore
    const shipmentRef = doc(db, 'shipments', deliveryId);
    await updateDoc(shipmentRef, {
        photos: arrayUnion(photo),
    });

    return photo;
};

/**
 * Elimina una foto de incidencia
 */
export const deleteDeliveryPhoto = async (
    deliveryId: string,
    photo: DeliveryPhoto
): Promise<void> => {
    // Intentar eliminar de Storage (puede fallar si la estructura cambió)
    try {
        const extension = photo.url.split('.').pop()?.split('?')[0] || 'jpg';
        const storagePath = `shipments/${deliveryId}/photos/${photo.id}.${extension}`;
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
    } catch (error) {
        console.warn('No se pudo eliminar la foto de Storage:', error);
    }

    // Eliminar referencia de Firestore
    const shipmentRef = doc(db, 'shipments', deliveryId);
    await updateDoc(shipmentRef, {
        photos: arrayRemove(photo),
    });
};
