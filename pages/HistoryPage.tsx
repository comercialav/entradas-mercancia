
import React, { useState, useMemo } from 'react';
import type { Delivery, DeliveryStatus, UserRole, IslandCode } from '../types';
import { FilterIcon, EmptyBoxIcon } from '../components/ui/Icons';
import { DeliveryTable } from '../components/features/delivery/DeliveryTable';
import { SlideOverPanel } from '../components/features/delivery/SlideOverPanel';
import { STATUS_OPTIONS } from '../constants';

interface HistoryPageProps {
    deliveries: Delivery[];
    userRole: UserRole;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ deliveries, userRole }) => {
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
    const [supplierFilter, setSupplierFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<DeliveryStatus | ''>('Dado de alta');
    const [islandFilter, setIslandFilter] = useState<IslandCode | ''>('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filteredDeliveries = useMemo(() => {
        return deliveries
            .filter(d => supplierFilter ? d.supplier.toLowerCase().includes(supplierFilter.toLowerCase()) : true)
            .filter(d => statusFilter ? d.status === statusFilter : true)
            .filter(d => islandFilter ? d.island === islandFilter : true)
            .filter(d => {
                const dateValue = d.arrival ?? d.expectedDate;
                if (!dateValue) return false;
                const dateOnly = dateValue.slice(0, 10);
                if (dateFrom && dateOnly < dateFrom) return false;
                if (dateTo && dateOnly > dateTo) return false;
                return true;
            })
            .sort((a, b) => new Date(b.arrival || b.expectedDate).getTime() - new Date(a.arrival || a.expectedDate).getTime());
    }, [deliveries, supplierFilter, statusFilter, islandFilter, dateFrom, dateTo]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-3xl font-bold text-[--color-text-primary]">Historial de Entregas</h2>
            </div>

            <div className="bg-[--color-surface] rounded-[--radius-lg] shadow-[--shadow-soft] border border-[--color-border-subtle]">
                <div className="p-4 border-b border-[--color-border-subtle] flex flex-wrap items-center gap-4">
                    <FilterIcon className="w-5 h-5 text-[--color-text-secondary]" />
                    <h3 className="font-semibold text-[--color-text-primary]">Filtros</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar por proveedor..."
                            value={supplierFilter}
                            onChange={(e) => setSupplierFilter(e.target.value)}
                            className="bg-gray-50 border border-[--color-border-strong] text-sm rounded-[--radius-pill] py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-[--color-primary] focus:border-[--color-primary]"
                        />
                    </div>
                    {userRole === 'Compras' && (
                        <div className="relative">
                            <select
                                value={islandFilter}
                                onChange={(e) => setIslandFilter(e.target.value as IslandCode | '')}
                                className="bg-gray-50 border border-[--color-border-strong] text-sm rounded-[--radius-pill] py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-[--color-primary] focus:border-[--color-primary]"
                            >
                                <option value="">Todas las islas</option>
                                <option value="GC">Gran Canaria</option>
                                <option value="TF">Tenerife</option>
                            </select>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <input 
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="bg-gray-50 border border-[--color-border-strong] text-sm rounded-[--radius-pill] py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-[--color-primary] focus:border-[--color-primary]"
                        />
                        <span className="text-sm text-[--color-text-secondary]">a</span>
                        <input 
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="bg-gray-50 border border-[--color-border-strong] text-sm rounded-[--radius-pill] py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-[--color-primary] focus:border-[--color-primary]"
                        />
                        <div className="flex items-center gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    const lastWeek = new Date(today);
                                    lastWeek.setDate(today.getDate() - 7);
                                    setDateFrom(lastWeek.toISOString().slice(0, 10));
                                    setDateTo(today.toISOString().slice(0, 10));
                                }}
                                className="px-2 py-1 border border-[--color-border-strong] rounded-[--radius-pill] hover:bg-gray-100"
                            >
                                Últimos 7 días
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                                    setDateFrom(firstDay.toISOString().slice(0, 10));
                                    setDateTo(today.toISOString().slice(0, 10));
                                }}
                                className="px-2 py-1 border border-[--color-border-strong] rounded-[--radius-pill] hover:bg-gray-100"
                            >
                                Últimos 30 días
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setDateFrom('');
                                    setDateTo('');
                                }}
                                className="text-[--color-primary] underline"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>

                {filteredDeliveries.length > 0 ? (
                    <DeliveryTable
                        deliveries={filteredDeliveries}
                        onSelectDelivery={setSelectedDelivery}
                        userRole={userRole}
                        isHistory={true}
                    />
                ) : (
                    <div className="text-center py-16 px-4">
                        <EmptyBoxIcon className="mx-auto w-24 h-24 text-[--color-border-strong]" />
                        <h3 className="mt-4 text-xl font-semibold text-[--color-text-primary]">No hay registros en el historial</h3>
                        <p className="mt-1 text-[--color-text-secondary]">
                           Las entregas completadas aparecerán aquí después de ser archivadas.
                        </p>
                    </div>
                )}
            </div>
            
            {selectedDelivery && (
                <SlideOverPanel 
                    delivery={selectedDelivery} 
                    onClose={() => setSelectedDelivery(null)}
                    onUpdateDelivery={async () => {}} // No updates in history
                    userRole={userRole}
                    isHistory={true}
                />
            )}
        </div>
    );
};
