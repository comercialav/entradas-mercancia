
import React, { useState, useMemo } from 'react';
import type { Delivery, UserRole, DeliveryStatus, IslandCode } from '../types';
import { PlusIcon, FilterIcon, InfoIcon, EmptyBoxIcon } from '../components/ui/Icons';
import { AddForecastModal } from '../components/features/delivery/AddForecastModal';
import { DeliveryTable } from '../components/features/delivery/DeliveryTable';
import { SlideOverPanel } from '../components/features/delivery/SlideOverPanel';
import { STATUS_OPTIONS, SUPPLIERS } from '../constants';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';

interface DashboardPageProps {
    deliveries: Delivery[];
    onAddDelivery: (newDelivery: Omit<Delivery, 'id' | 'status' | 'lastUpdate' | 'arrival' | 'pallets' | 'packages'>) => Promise<void>;
    onUpdateDelivery: (updatedDelivery: Delivery) => Promise<void>;
    onDeleteDelivery: (delivery: Delivery) => Promise<void>;
    userRole: UserRole;
    onArchive: () => Promise<void>;
    isSyncing: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ deliveries, onAddDelivery, onUpdateDelivery, onDeleteDelivery, userRole, onArchive, isSyncing }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
    const [supplierFilter, setSupplierFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<DeliveryStatus | ''>('');
    const [islandFilter, setIslandFilter] = useState<IslandCode | ''>('');
    const [isArchiving, setIsArchiving] = useState(false);
    const [deliveryPendingDelete, setDeliveryPendingDelete] = useState<Delivery | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const filteredDeliveries = useMemo(() => {
        return deliveries
            .filter(d => supplierFilter ? d.supplier.toLowerCase().includes(supplierFilter.toLowerCase()) : true)
            .filter(d => statusFilter ? d.status === statusFilter : true)
            .filter(d => islandFilter ? d.island === islandFilter : true)
            .sort((a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime());
    }, [deliveries, supplierFilter, statusFilter, islandFilter]);

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-[--color-text-primary]">Panel de proveedores</h2>
                    {isSyncing && (
                        <span className="flex items-center gap-2 text-sm text-[--color-text-secondary]">
                            <svg className="w-4 h-4 animate-spin text-[--color-primary]" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Sincronizando...
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {userRole === 'Compras' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-[--color-primary] text-white font-semibold py-2 px-4 rounded-[--radius-md] hover:bg-[--color-primary-light] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--color-primary-light] transition-all duration-150 ease-out shadow-sm"
                        >
                            <PlusIcon />
                            Añadir previsión
                        </button>
                    )}
                </div>
                </div>
            </div>

            <div className="bg-[rgba(37,99,235,0.06)] border border-[rgba(47,142,219,0.2)] text-[--color-primary-dark] p-4 rounded-[--radius-lg] flex items-start gap-3">
                <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[--color-primary]" />
                <p className="text-sm">
                    Los registros <span className="font-semibold">dados de alta</span> se archivan automáticamente los lunes a las 08:00 (hora Canarias) y pasan al historial.
                    {userRole === 'Compras' && (
                        <button
                            onClick={async () => {
                                setIsArchiving(true);
                                try {
                                    await onArchive();
                                } finally {
                                    setIsArchiving(false);
                                }
                            }}
                            disabled={isArchiving}
                            className="ml-2 font-semibold underline hover:text-[--color-primary-light] disabled:opacity-60"
                        >
                            {isArchiving ? 'Archivando...' : 'Archivar manualmente ahora'}
                        </button>
                    )}
                </p>
            </div>

            <div className="bg-[--color-surface] rounded-[--radius-lg] shadow-[--shadow-soft] border border-[--color-border-subtle]">
                <div className="p-4 border-b border-[--color-border-subtle] flex flex-wrap items-center gap-4">
                    <FilterIcon className="w-5 h-5 text-[--color-text-secondary]" />
                    <h3 className="font-semibold text-[--color-text-primary]">Filtros</h3>
                    <div className="relative">
                        <select
                            value={supplierFilter}
                            onChange={(e) => setSupplierFilter(e.target.value)}
                            className="bg-gray-50 border border-[--color-border-strong] text-sm rounded-[--radius-pill] py-1.5 px-3 appearance-none focus:outline-none focus:ring-1 focus:ring-[--color-primary] focus:border-[--color-primary]"
                        >
                            <option value="">Todos los proveedores</option>
                            {SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="relative">
                        <select
                           value={statusFilter}
                           onChange={(e) => setStatusFilter(e.target.value as DeliveryStatus | '')}
                           className="bg-gray-50 border border-[--color-border-strong] text-sm rounded-[--radius-pill] py-1.5 px-3 appearance-none focus:outline-none focus:ring-1 focus:ring-[--color-primary] focus:border-[--color-primary]"
                        >
                            <option value="">Todos los estados</option>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    {userRole === 'Compras' && (
                        <div className="relative">
                            <select
                                value={islandFilter}
                                onChange={(e) => setIslandFilter(e.target.value as IslandCode | '')}
                                className="bg-gray-50 border border-[--color-border-strong] text-sm rounded-[--radius-pill] py-1.5 px-3 appearance-none focus:outline-none focus:ring-1 focus:ring-[--color-primary] focus:border-[--color-primary]"
                            >
                                <option value="">Todas las islas</option>
                                <option value="GC">Gran Canaria</option>
                                <option value="TF">Tenerife</option>
                            </select>
                        </div>
                    )}
                </div>

                {filteredDeliveries.length > 0 ? (
                    <DeliveryTable
                        deliveries={filteredDeliveries}
                        onSelectDelivery={setSelectedDelivery}
                        userRole={userRole}
                        onRequestDelete={userRole === 'Compras' ? setDeliveryPendingDelete : undefined}
                    />
                ) : (
                    <div className="text-center py-16 px-4">
                        <EmptyBoxIcon className="mx-auto w-24 h-24 text-[--color-border-strong]" />
                        <h3 className="mt-4 text-xl font-semibold text-[--color-text-primary]">No hay previsiones que mostrar</h3>
                        <p className="mt-1 text-[--color-text-secondary]">
                           {userRole === 'Compras' ? "Crea la primera desde el botón ‘Añadir previsión’." : "No hay llegadas previstas que coincidan con los filtros."} 
                        </p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <AddForecastModal 
                    onClose={() => setIsModalOpen(false)} 
                    onAddDelivery={onAddDelivery}
                    showTrackingField={userRole === 'Compras'}
                />
            )}

            {selectedDelivery && (
                <SlideOverPanel 
                    delivery={selectedDelivery} 
                    onClose={() => setSelectedDelivery(null)}
                    onUpdateDelivery={onUpdateDelivery}
                    userRole={userRole}
                />
            )}
            {deliveryPendingDelete && (
                <ConfirmationDialog
                    title="Eliminar previsión"
                    message="Esta previsión se eliminará de forma permanente. ¿Deseas continuar?"
                    confirmText={isDeleting ? 'Eliminando...' : 'Eliminar'}
                    cancelText="Cancelar"
                    onConfirm={async () => {
                        if (isDeleting) return;
                        setIsDeleting(true);
                        try {
                            await onDeleteDelivery(deliveryPendingDelete);
                            setDeliveryPendingDelete(null);
                        } finally {
                            setIsDeleting(false);
                        }
                    }}
                    onCancel={() => {
                        if (isDeleting) return;
                        setDeliveryPendingDelete(null);
                    }}
                    requiresCheckbox={true}
                    checkboxLabel="Entiendo que esta acción no se puede deshacer"
                />
            )}
        </div>
    );
};
