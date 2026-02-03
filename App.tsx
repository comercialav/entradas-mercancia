
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';
import type { Delivery, UserRole, Page, IslandCode } from './types';
import { auth } from './firebase';
import { Toast } from './components/ui/Toast';
import {
    archiveRegisteredShipments,
    createShipment,
    getUserProfileById,
    listenToShipments,
    mapFirestoreRoleToUserRole,
    deleteShipmentById,
    updateShipmentFromDelivery,
} from './services/firestore';
import { notifyServer, type NotificationAction, type NotificationRequestPayload } from './services/notifications';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authUser, setAuthUser] = useState<User | null>(null);
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [archivedDeliveries, setArchivedDeliveries] = useState<Delivery[]>([]);
    const [userRole, setUserRole] = useState<UserRole>('Compras');
    const [userName, setUserName] = useState<string>();
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [userIsland, setUserIsland] = useState<IslandCode | undefined>(undefined);
    const [hasLoadedActive, setHasLoadedActive] = useState(false);
    const [hasLoadedArchived, setHasLoadedArchived] = useState(false);
    const [pendingSync, setPendingSync] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const toastTimeoutRef = useRef<number | null>(null);

    const isSyncing = !hasLoadedActive || !hasLoadedArchived || pendingSync;

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        if (toastTimeoutRef.current) {
            window.clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = window.setTimeout(() => {
            setToast(null);
            toastTimeoutRef.current = null;
        }, 4000);
    }, []);

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                window.clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);

    const updatedByLabel = userName ?? authUser?.email ?? 'Usuario';

    const triggerNotification = useCallback(async (action: NotificationAction, payload: NotificationRequestPayload) => {
        try {
            await notifyServer(action, payload);
        } catch (error) {
            console.error('[notify] Unable to send email', error);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthUser(user);
            setIsAuthenticated(!!user);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let cancelled = false;
        if (!authUser) {
            setUserName(undefined);
            setUserRole('Compras');
            setUserIsland(undefined);
            return;
        }

        const fetchProfile = async () => {
            try {
                const profile = await getUserProfileById(authUser.uid);
                if (cancelled) return;
                if (profile) {
                    console.info('[auth] Loaded user profile', profile);
                    setUserRole(mapFirestoreRoleToUserRole(profile.role));
                    setUserName(profile.displayName);
                    setUserIsland(profile.island as IslandCode | undefined);
                } else {
                    console.warn('[auth] No user profile found. Falling back to default role.');
                    setUserRole('Compras');
                    setUserName(authUser.email ?? 'Usuario');
                    setUserIsland(undefined);
                }
            } catch (error) {
                console.error('Error loading user profile', error);
            }
        };

        fetchProfile();
        return () => {
            cancelled = true;
        };
    }, [authUser]);

    useEffect(() => {
        if (!isAuthenticated) {
            setDeliveries([]);
            setArchivedDeliveries([]);
            setHasLoadedActive(false);
            setHasLoadedArchived(false);
            setPendingSync(true);
            return;
        }

        setHasLoadedActive(false);
        setHasLoadedArchived(false);
        setPendingSync(true);

        const unsubscribeActive = listenToShipments(
            { archived: false },
            (data) => {
                setDeliveries(data);
                setHasLoadedActive(true);
                setPendingSync(false);
            },
            () => {
                setHasLoadedActive(true);
                setPendingSync(false);
                showToast('No se pudieron sincronizar las previsiones activas.', 'error');
            }
        );
        const unsubscribeArchived = listenToShipments(
            { archived: true },
            (data) => {
                setArchivedDeliveries(data);
                setHasLoadedArchived(true);
                setPendingSync(false);
            },
            () => {
                setHasLoadedArchived(true);
                setPendingSync(false);
                showToast('No se pudo sincronizar el histórico.', 'error');
            }
        );

        return () => {
            unsubscribeActive();
            unsubscribeArchived();
        };
    }, [isAuthenticated]);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } finally {
            setIsAuthenticated(false);
            setAuthUser(null);
        }
    };

    const addDelivery = useCallback(async (newDelivery: Omit<Delivery, 'id' | 'status' | 'lastUpdate' | 'arrival' | 'pallets' | 'packages'>) => {
        if (!authUser) {
            throw new Error('Usuario no autenticado');
        }
        setPendingSync(true);
        try {
            await createShipment({
                supplier: newDelivery.supplier,
                expectedDate: newDelivery.expectedDate,
                notes: newDelivery.notes,
                tracking: newDelivery.tracking ?? undefined,
                userId: authUser.uid,
                userDisplayName: userName ?? authUser.email ?? 'Usuario',
                island: newDelivery.island,
                estimatedPallets: newDelivery.estimatedPallets ?? null,
                estimatedPackages: newDelivery.estimatedPackages ?? null,
                transportCompany: newDelivery.transportCompany ?? null,
            });
            showToast('Previsión creada correctamente');
            await triggerNotification('SHIPMENT_CREATED', {
                supplier: newDelivery.supplier,
                expectedDate: newDelivery.expectedDate,
                status: 'En tránsito',
                notes: newDelivery.notes ?? null,
                tracking: newDelivery.tracking ?? null,
                observations: null,
                updatedBy: updatedByLabel,
                island: newDelivery.island,
                estimatedPallets: newDelivery.estimatedPallets ?? null,
                estimatedPackages: newDelivery.estimatedPackages ?? null,
                transportCompany: newDelivery.transportCompany ?? null,
            });
        } catch (error) {
            setPendingSync(false);
            showToast('No se pudo crear la previsión.', 'error');
            throw error;
        }
    }, [authUser, triggerNotification, updatedByLabel, showToast]);

    const updateDelivery = useCallback(async (updatedDelivery: Delivery) => {
        if (!authUser) {
            throw new Error('Usuario no autenticado');
        }
        const previousDelivery = deliveries.find((delivery) => delivery.id === updatedDelivery.id);
        await updateShipmentFromDelivery(updatedDelivery, {
            userId: authUser.uid,
            userDisplayName: userName ?? authUser.email ?? 'Usuario',
        });
        const prevStatus = previousDelivery?.status;
        const nextStatus = updatedDelivery.status;

        const statusChanged = prevStatus !== nextStatus;
        showToast('Entrega actualizada');
        if (statusChanged) {
            let action: NotificationAction | null = null;
            if (nextStatus === 'En almacén') {
                action = 'SHIPMENT_ARRIVED';
            } else if (nextStatus === 'Dado de alta') {
                action = 'SHIPMENT_REGISTERED';
            }

            if (action) {
                await triggerNotification(action, {
                    supplier: updatedDelivery.supplier,
                    expectedDate: updatedDelivery.expectedDate,
                    status: updatedDelivery.status,
                    arrival: updatedDelivery.arrival,
                    pallets: updatedDelivery.pallets ?? null,
                    packages: updatedDelivery.packages ?? null,
                    notes: updatedDelivery.notes ?? null,
                    tracking: updatedDelivery.tracking ?? null,
                    observations: updatedDelivery.observations ?? null,
                    updatedBy: updatedByLabel,
                    island: updatedDelivery.island,
                    estimatedPallets: updatedDelivery.estimatedPallets ?? null,
                    estimatedPackages: updatedDelivery.estimatedPackages ?? null,
                    transportCompany: updatedDelivery.transportCompany ?? null,
                });
            }
        }
    }, [authUser, userName, deliveries, triggerNotification, updatedByLabel, showToast]);

    const deleteDelivery = useCallback(async (delivery: Delivery) => {
        if (!authUser) {
            throw new Error('Usuario no autenticado');
        }
        setPendingSync(true);
        try {
            await deleteShipmentById(delivery.id);
            showToast('Previsión eliminada');
        } catch (error) {
            setPendingSync(false);
            showToast('No se pudo eliminar la previsión.', 'error');
            throw error;
        }
    }, [authUser, showToast]);

    const handleManualArchive = useCallback(async () => {
        setPendingSync(true);
        const count = await archiveRegisteredShipments();
        if (count === 0) {
            setPendingSync(false);
            showToast('No hay entregas registradas pendientes de archivar.', 'error');
        } else {
            showToast(`Se han archivado ${count} entrega${count === 1 ? '' : 's'}.`);
        }
    }, [showToast]);

    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    const visibleDeliveries = userRole === 'Almacén' && userIsland
        ? deliveries.filter((delivery) => delivery.island === userIsland)
        : deliveries;

    const visibleArchived = userRole === 'Almacén' && userIsland
        ? archivedDeliveries.filter((delivery) => delivery.island === userIsland)
        : archivedDeliveries;

    return (
        <div className="h-screen w-screen flex flex-col bg-[--color-bg] text-[--color-text-primary]">
            <TopBar userRole={userRole} userName={userName} onLogout={handleLogout} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
                        {currentPage === 'dashboard' && (
                            <DashboardPage
                                deliveries={visibleDeliveries}
                                onAddDelivery={addDelivery}
                                onUpdateDelivery={updateDelivery}
                                onDeleteDelivery={deleteDelivery}
                                userRole={userRole}
                                onArchive={handleManualArchive}
                                isSyncing={isSyncing}
                                userIsland={userIsland}
                                userId={authUser?.uid ?? ''}
                                userDisplayName={userName}
                            />
                        )}
                        {currentPage === 'history' && (
                            <HistoryPage
                                deliveries={visibleArchived}
                                userRole={userRole}
                                userId={authUser?.uid ?? ''}
                                userDisplayName={userName}
                            />
                        )}
                    </div>
                </main>
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default App;
