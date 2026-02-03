
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Delivery, UserRole, DeliveryStatus, IslandCode } from '../types';
import { PlusIcon, FilterIcon, InfoIcon, EmptyBoxIcon, ChevronDownIcon } from '../components/ui/Icons';
import { AddForecastModal } from '../components/features/delivery/AddForecastModal';
import { DeliveryTable } from '../components/features/delivery/DeliveryTable';
import { SlideOverPanel } from '../components/features/delivery/SlideOverPanel';
import { STATUS_OPTIONS } from '../constants';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';

interface DashboardPageProps {
    deliveries: Delivery[];
    onAddDelivery: (newDelivery: Omit<Delivery, 'id' | 'status' | 'lastUpdate' | 'arrival' | 'pallets' | 'packages'>) => Promise<void>;
    onUpdateDelivery: (updatedDelivery: Delivery) => Promise<void>;
    onDeleteDelivery: (delivery: Delivery) => Promise<void>;
    userRole: UserRole;
    onArchive: () => Promise<void>;
    isSyncing: boolean;
    userId: string;
    userDisplayName?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ deliveries, onAddDelivery, onUpdateDelivery, onDeleteDelivery, userRole, onArchive, isSyncing, userId, userDisplayName }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
    const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
    const [supplierSearch, setSupplierSearch] = useState('');
    const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
    const supplierDropdownRef = useRef<HTMLDivElement | null>(null);
    const [statusFilter, setStatusFilter] = useState<DeliveryStatus | ''>('');
    const [islandFilter, setIslandFilter] = useState<IslandCode | ''>('');
    const [isArchiving, setIsArchiving] = useState(false);
    const [deliveryPendingDelete, setDeliveryPendingDelete] = useState<Delivery | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [mobileSearch, setMobileSearch] = useState('');

    // Obtener lista única de proveedores de las entregas actuales
    const availableSuppliers = useMemo(() => {
        const suppliers = new Set(deliveries.map(d => d.supplier));
        return Array.from(suppliers).sort();
    }, [deliveries]);

    const filteredSuppliers = useMemo(() => {
        return availableSuppliers.filter((name) =>
            name.toLowerCase().includes(supplierSearch.toLowerCase())
        );
    }, [availableSuppliers, supplierSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target as Node)) {
                setIsSupplierDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSupplier = (supplier: string) => {
        setSelectedSuppliers(prev =>
            prev.includes(supplier)
                ? prev.filter(s => s !== supplier)
                : [...prev, supplier]
        );
    };

    const clearSupplierFilter = () => {
        setSelectedSuppliers([]);
        setSupplierSearch('');
    };

    const filteredDeliveries = useMemo(() => {
        return deliveries
            .filter(d => selectedSuppliers.length === 0 || selectedSuppliers.includes(d.supplier))
            .filter(d => statusFilter ? d.status === statusFilter : true)
            .filter(d => islandFilter ? d.island === islandFilter : true)
            .filter(d => mobileSearch ? d.supplier.toLowerCase().includes(mobileSearch.toLowerCase()) : true)
            .sort((a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime());
    }, [deliveries, selectedSuppliers, statusFilter, islandFilter, mobileSearch]);

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl md:text-3xl font-bold text-[--color-text-primary]">Panel de proveedores</h2>
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

            {/* Buscador Móvil - solo visible en móvil */}
            <div className="lg:hidden">
                <div className="relative">
                    <input
                        type="text"
                        value={mobileSearch}
                        onChange={(e) => setMobileSearch(e.target.value)}
                        placeholder="Buscar proveedor..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-[--color-border-strong] rounded-[--radius-lg] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-[--color-primary]"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--color-text-muted]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {mobileSearch && (
                        <button
                            onClick={() => setMobileSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[--color-text-muted] hover:text-[--color-text-primary]"
                        >
                            ✕
                        </button>
                    )}
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
                {/* Header de filtros - clickable en móvil */}
                <button
                    type="button"
                    onClick={() => setIsFiltersOpen(prev => !prev)}
                    className="w-full p-4 border-b border-[--color-border-subtle] flex items-center gap-4 lg:cursor-default"
                >
                    <FilterIcon className="w-5 h-5 text-[--color-text-secondary]" />
                    <h3 className="font-semibold text-[--color-text-primary]">Filtros</h3>
                    {/* Indicador de filtros activos */}
                    {(selectedSuppliers.length > 0 || statusFilter || islandFilter) && (
                        <span className="bg-[--color-primary] text-white text-xs px-2 py-0.5 rounded-full">
                            {(selectedSuppliers.length > 0 ? 1 : 0) + (statusFilter ? 1 : 0) + (islandFilter ? 1 : 0)}
                        </span>
                    )}
                    <ChevronDownIcon className={`ml-auto w-5 h-5 text-[--color-text-muted] lg:hidden transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                </button>
                {/* Contenedor de filtros - colapsable en móvil */}
                <div className={`p-4 border-b border-[--color-border-subtle] flex-wrap items-center gap-4 ${isFiltersOpen ? 'flex' : 'hidden'} lg:flex`}>
                    <div className="relative w-full lg:w-auto" ref={supplierDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsSupplierDropdownOpen(prev => !prev)}
                            className="bg-gray-50 border border-[--color-border-strong] text-sm rounded-[--radius-pill] py-1.5 px-3 min-w-[200px] text-left flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[--color-primary] focus:border-[--color-primary]"
                        >
                            <span className={selectedSuppliers.length === 0 ? 'text-[--color-text-muted]' : 'text-[--color-text-primary]'}>
                                {selectedSuppliers.length === 0
                                    ? 'Todos los proveedores'
                                    : selectedSuppliers.length === 1
                                        ? selectedSuppliers[0]
                                        : `${selectedSuppliers.length} proveedores`
                                }
                            </span>
                            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isSupplierDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isSupplierDropdownOpen && (
                            <div className="absolute z-20 mt-2 w-full bg-white border border-[--color-border-subtle] rounded-[--radius-md] shadow-xl max-h-80 overflow-hidden flex flex-col">
                                <div className="p-2 border-b border-[--color-border-subtle]">
                                    <input
                                        type="text"
                                        value={supplierSearch}
                                        onChange={(e) => setSupplierSearch(e.target.value)}
                                        placeholder="Buscar proveedor..."
                                        className="w-full px-3 py-2 text-sm border border-[--color-border-strong] rounded-[--radius-md] focus:outline-none focus:ring-1 focus:ring-[--color-primary] focus:border-[--color-primary]"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className="overflow-y-auto max-h-64">
                                    {filteredSuppliers.length > 0 ? (
                                        <>
                                            {filteredSuppliers.map((supplier) => (
                                                <label
                                                    key={supplier}
                                                    className="flex items-center gap-2 px-3 py-2 hover:bg-[--color-primary]/10 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSuppliers.includes(supplier)}
                                                        onChange={() => toggleSupplier(supplier)}
                                                        className="rounded border-[--color-border-strong] text-[--color-primary] focus:ring-[--color-primary]"
                                                    />
                                                    <span className="text-sm text-[--color-text-primary]">{supplier}</span>
                                                </label>
                                            ))}
                                        </>
                                    ) : (
                                        <p className="px-3 py-2 text-sm text-[--color-text-muted]">Sin coincidencias</p>
                                    )}
                                </div>
                                {selectedSuppliers.length > 0 && (
                                    <div className="p-2 border-t border-[--color-border-subtle]">
                                        <button
                                            type="button"
                                            onClick={clearSupplierFilter}
                                            className="w-full text-xs text-[--color-primary] hover:text-[--color-primary-dark] font-medium"
                                        >
                                            Limpiar selección
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
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
                    userId={userId}
                    userDisplayName={userDisplayName}
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
