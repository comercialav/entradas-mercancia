
import React, { useState } from 'react';
import type { Delivery, UserRole, IslandCode } from '../../../types';
import { StatusBadge } from './StatusBadge';
import { EyeIcon, TrashIcon } from '../../ui/Icons';

interface DeliveryTableProps {
    deliveries: Delivery[];
    onSelectDelivery: (delivery: Delivery) => void;
    userRole: UserRole;
    isHistory?: boolean;
    onRequestDelete?: (delivery: Delivery) => void;
}

const ISLAND_STYLES: Record<IslandCode, string> = {
    GC: 'bg-indigo-100 text-indigo-800',
    TF: 'bg-purple-100 text-purple-800',
};

const TableHeader: React.FC = () => (
    <thead className="bg-[#F9FAFB]">
        <tr>
            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-[--color-text-secondary] uppercase tracking-wider">Proveedor</th>
            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-[--color-text-secondary] uppercase tracking-wider">Fecha Prevista</th>
            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-[--color-text-secondary] uppercase tracking-wider">Llegada Real</th>
            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-[--color-text-secondary] uppercase tracking-wider">Palets</th>
            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-[--color-text-secondary] uppercase tracking-wider">Bultos</th>
            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-[--color-text-secondary] uppercase tracking-wider">Estado</th>
            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-[--color-text-secondary] uppercase tracking-wider">Última Actualización</th>
            <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-[--color-text-secondary] uppercase tracking-wider">Acciones</th>
        </tr>
    </thead>
);

const formatDate = (dateString: string | null) => {
    if (!dateString) return <span className="text-[--color-text-muted]">--</span>;
    return new Date(dateString).toLocaleDateString('es-ES');
};

const formatDateTime = (dateString: string | null) => {
    if (!dateString) return <span className="text-[--color-text-muted]">--</span>;
    return new Date(dateString).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

interface TableRowProps {
    delivery: Delivery;
    onSelect: () => void;
    isHistory?: boolean;
    isExpanded: boolean;
    onToggleExpand: () => void;
    canDelete: boolean;
    onDelete?: () => void;
    userRole: UserRole;
}

const TableRow: React.FC<TableRowProps> = ({ delivery, onSelect, isHistory, isExpanded, onToggleExpand, canDelete, onDelete, userRole }) => {
    const trackingValue = delivery.tracking?.trim();
    const isTrackingLink = trackingValue ? /^https?:\/\//i.test(trackingValue) : false;

    return (
        <>
            <tr 
                onClick={onSelect}
                className="border-b border-[--color-border-subtle] hover:bg-[#F9FAFB] cursor-pointer transition-colors duration-150 ease-out"
            >
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[--color-text-primary]">
                <span className={`inline-flex items-center justify-center w-8 h-8 mr-3 rounded-full text-xs font-bold ${ISLAND_STYLES[delivery.island]}`}>
                    {delivery.island}
                </span>
                {delivery.supplier}
            </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[--color-text-secondary]">{formatDate(delivery.expectedDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[--color-text-secondary]">{formatDateTime(delivery.arrival)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[--color-text-secondary]">{delivery.pallets ?? <span className="text-[--color-text-muted]">--</span>}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[--color-text-secondary]">{delivery.packages ?? <span className="text-[--color-text-muted]">--</span>}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={delivery.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[--color-text-secondary]">{formatDateTime(delivery.lastUpdate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
                            className={`p-1 rounded-full border ${isExpanded ? 'text-[--color-primary] border-[--color-primary]' : 'text-[--color-text-secondary] border-transparent hover:text-[--color-primary]'}`}
                            aria-label={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                        >
                            <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onSelect(); }}
                            className="text-[--color-primary] hover:text-[--color-primary-dark] transition-colors"
                        >
                            {isHistory ? 'Ver detalle' : 'Gestionar'}
                        </button>
                        {canDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete?.();
                                }}
                                className="p-1 rounded-full text-[--color-error] hover:bg-red-50 transition-colors"
                                aria-label="Eliminar previsión"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-[#F8FAFF] border-b border-[--color-border-subtle]">
                    <td colSpan={8} className="px-6 py-4 text-sm text-[--color-text-secondary]">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="md:col-span-2">
                                <p className="text-xs uppercase font-semibold text-[--color-text-muted]">Notas</p>
                                <p className="mt-1 text-[--color-text-primary]">{delivery.notes?.trim() || 'Sin notas adicionales.'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs uppercase font-semibold text-[--color-text-muted]">Observaciones</p>
                                <p className="mt-1 text-[--color-text-primary]">{delivery.observations?.trim() || 'Sin observaciones.'}</p>
                            </div>
                            {userRole === 'Compras' && (
                                <div>
                                    <p className="text-xs uppercase font-semibold text-[--color-text-muted]">Tracking</p>
                                    <p className="mt-1 text-[--color-text-primary]">
                                        {trackingValue ? (
                                            isTrackingLink ? (
                                                <a href={trackingValue} target="_blank" rel="noreferrer" className="text-[--color-primary] underline">
                                                    Ver tracking
                                                </a>
                                            ) : (
                                                trackingValue
                                            )
                                        ) : 'Sin tracking'}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs uppercase font-semibold text-[--color-text-muted]">Última actualización</p>
                                <p className="mt-1">{formatDateTime(delivery.lastUpdate)}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase font-semibold text-[--color-text-muted]">Llegada real</p>
                                <p className="mt-1">{delivery.arrival ? formatDateTime(delivery.arrival) : 'Pendiente'}</p>
                            </div>
                            <div className="flex gap-6">
                                <div>
                                    <p className="text-xs uppercase font-semibold text-[--color-text-muted]">Palets</p>
                                    <p className="mt-1">{delivery.pallets ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-semibold text-[--color-text-muted]">Bultos</p>
                                    <p className="mt-1">{delivery.packages ?? '—'}</p>
                                </div>
                            </div>
                            {(delivery.estimatedPallets || delivery.estimatedPackages) && (
                                <div>
                                    <p className="text-xs uppercase font-semibold text-[--color-text-muted]">Estimación inicial</p>
                                    <p className="mt-1 text-[--color-text-primary]">
                                        {delivery.estimatedPallets != null && `Palets: ${String(delivery.estimatedPallets)}`}
                                        {delivery.estimatedPallets != null && delivery.estimatedPackages != null && ' • '}
                                        {delivery.estimatedPackages != null && `Bultos: ${String(delivery.estimatedPackages)}`}
                                    </p>
                                </div>
                            )}
                            {delivery.transportCompany && (
                                <div>
                                    <p className="text-xs uppercase font-semibold text-[--color-text-muted]">Transporte</p>
                                    <p className="mt-1 text-[--color-text-primary]">{delivery.transportCompany}</p>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export const DeliveryTable: React.FC<DeliveryTableProps> = ({ deliveries, onSelectDelivery, userRole, isHistory, onRequestDelete }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (deliveryId: string) => {
        setExpandedId(prev => prev === deliveryId ? null : deliveryId);
    };

    return (
        <div className="overflow-x-auto table-scrollbar">
            <table className="min-w-full divide-y divide-[--color-border-subtle]">
                <TableHeader />
                <tbody className="bg-white divide-y divide-[--color-border-subtle]">
                    {deliveries.map(delivery => (
                        <React.Fragment key={delivery.id}>
                            <TableRow 
                                delivery={delivery} 
                                onSelect={() => onSelectDelivery(delivery)}
                                isHistory={isHistory}
                                isExpanded={expandedId === delivery.id}
                                onToggleExpand={() => toggleExpand(delivery.id)}
                                canDelete={!isHistory && userRole === 'Compras' && !!onRequestDelete}
                                onDelete={onRequestDelete ? () => onRequestDelete(delivery) : undefined}
                                userRole={userRole}
                            />
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
