import React, { useState, useEffect } from 'react';
import type { Delivery, UserRole, DeliveryStatus } from '../../../types';
import { CloseIcon, CalendarIcon, TruckIcon, CheckCircleIcon } from '../../ui/Icons';
import { StatusBadge } from './StatusBadge';
import { ConfirmationDialog } from '../../ui/ConfirmationDialog';
import { CustomNumberInput } from '../../ui/CustomNumberInput';

interface SlideOverPanelProps {
    delivery: Delivery;
    onClose: () => void;
    onUpdateDelivery: (delivery: Delivery) => Promise<void>;
    userRole: UserRole;
    isHistory?: boolean;
}

const TimelineStep: React.FC<{ icon: React.ReactNode, title: string, value: string | null, isCompleted: boolean, isLast?: boolean }> = ({ icon, title, value, isCompleted, isLast }) => (
    <div className="flex gap-4">
        <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-[--color-primary] text-white' : 'bg-gray-200 text-gray-500'}`}>
                {icon}
            </div>
            {!isLast && <div className={`w-0.5 flex-1 ${isCompleted ? 'bg-[--color-primary]' : 'bg-gray-200'}`}></div>}
        </div>
        <div className="pb-8">
            <p className={`font-semibold ${isCompleted ? 'text-[--color-text-primary]' : 'text-gray-500'}`}>{title}</p>
            <p className="text-sm text-[--color-text-secondary]">{value || 'Pendiente'}</p>
        </div>
    </div>
);

export const SlideOverPanel: React.FC<SlideOverPanelProps> = ({ delivery, onClose, onUpdateDelivery, userRole, isHistory }) => {
    const [arrival, setArrival] = useState(delivery.arrival ? delivery.arrival.substring(0, 16) : '');
    const [pallets, setPallets] = useState(delivery.pallets?.toString() ?? '');
    const [packages, setPackages] = useState(delivery.packages?.toString() ?? '');
    const [observations, setObservations] = useState(delivery.observations ?? '');
    const [tracking, setTracking] = useState(delivery.tracking ?? '');
    const [notes, setNotes] = useState(delivery.notes ?? '');
    const [confirmAction, setConfirmAction] = useState<'alta' | null>(null);
    const [isSavingWarehouse, setIsSavingWarehouse] = useState(false);
    const [isSavingPurchases, setIsSavingPurchases] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Actualizar estados cuando cambie el delivery
    useEffect(() => {
        setArrival(delivery.arrival ? delivery.arrival.substring(0, 16) : '');
        setPallets(delivery.pallets?.toString() ?? '');
        setPackages(delivery.packages?.toString() ?? '');
        setObservations(delivery.observations ?? '');
        setTracking(delivery.tracking ?? '');
        setNotes(delivery.notes ?? '');
        setError(null);
    }, [delivery.id]);

    const handleSaveWarehouseData = async () => {
        setError(null);
        
        // Validar campos obligatorios cuando se registra la llegada
        if (canRegister) {
            if (!arrival) {
                setError('La fecha y hora de llegada es obligatoria.');
                return;
            }
            if (pallets === '') {
                setError('El número de palets es obligatorio.');
                return;
            }
            if (packages === '') {
                setError('El número de bultos es obligatorio.');
                return;
            }
        }
        
        setIsSavingWarehouse(true);
        console.info('[slideOver] Guardando datos de almacén para', delivery.id);
        try {
            const nextStatus = canRegister ? 'En almacén' : delivery.status;
            await onUpdateDelivery({
                ...delivery,
                arrival: arrival ? new Date(arrival).toISOString() : null,
                pallets: pallets !== '' ? Number(pallets) : null,
                packages: packages !== '' ? Number(packages) : null,
                observations: observations.trim() || null,
                status: nextStatus
            });
            console.info('[slideOver] Datos guardados correctamente');
            onClose();
        } catch (err) {
            console.error(err);
            setError('No se pudo guardar la información del almacén.');
        } finally {
            setIsSavingWarehouse(false);
        }
    };

    const handleSavePurchasesData = async () => {
        setError(null);
        setIsSavingPurchases(true);
        console.info('[slideOver] Guardando datos de compras para', delivery.id);
        try {
            await onUpdateDelivery({
                ...delivery,
                tracking: tracking.trim() || null,
                notes: notes.trim() || null,
            });
            console.info('[slideOver] Datos de compras guardados correctamente');
            onClose();
        } catch (err) {
            console.error(err);
            setError('No se pudo guardar la información de compras.');
        } finally {
            setIsSavingPurchases(false);
        }
    };

    const handleStatusChange = async (newStatus: DeliveryStatus) => {
        setError(null);
        setIsUpdatingStatus(true);
        console.info('[slideOver] Cambiando estado de', delivery.id, 'a', newStatus);
        try {
            await onUpdateDelivery({ ...delivery, status: newStatus, observations: observations.trim() || delivery.observations || null });
            setConfirmAction(null);
            console.info('[slideOver] Estado actualizado correctamente');
            onClose();
        } catch (err) {
            console.error(err);
            setError('No se pudo actualizar el estado.');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const isWarehouseUser = userRole === 'Almacén';
    const canRegister = isWarehouseUser && delivery.status === 'En tránsito';
    
    return (
        <div className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
            <div className="absolute inset-y-0 right-0 w-full max-w-md bg-[--color-surface] shadow-xl flex flex-col">
                <div className="p-4 flex items-center justify-between border-b border-[--color-border-subtle]">
                    <div>
                        <h2 className="text-xl font-bold">{delivery.supplier}</h2>
                        <StatusBadge status={delivery.status} />
                    </div>
                    <button onClick={onClose} className="text-[--color-text-muted] hover:text-[--color-text-primary]">
                        <CloseIcon />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Timeline */}
                    <div>
                        <TimelineStep icon={<CalendarIcon/>} title="En tránsito (Compras)" value={new Date(delivery.expectedDate).toLocaleDateString('es-ES')} isCompleted={true} />
                        <TimelineStep icon={<TruckIcon/>} title="En almacén (Almacén)" value={delivery.arrival ? new Date(delivery.arrival).toLocaleString('es-ES') : null} isCompleted={delivery.status !== 'En tránsito'} />
                        <TimelineStep icon={<CheckCircleIcon/>} title="Dado de Alta" value={null} isCompleted={delivery.status === 'Dado de alta'} isLast={true} />
                    </div>

                    {/* Información de compras (solo lectura para todos) */}
                    {(delivery.estimatedPallets || delivery.estimatedPackages || delivery.transportCompany) && (
                        <div className="p-4 border border-[--color-border-subtle] rounded-[--radius-lg] space-y-2">
                            <h3 className="font-semibold">Información de Compras</h3>
                            {(delivery.estimatedPallets || delivery.estimatedPackages) && (
                                <div>
                                    <p className="text-xs uppercase font-semibold text-[--color-text-muted]">Estimación inicial</p>
                                    <p className="text-sm text-[--color-text-primary]">
                                        {delivery.estimatedPallets != null && `Palets: ${String(delivery.estimatedPallets)}`}
                                        {delivery.estimatedPallets != null && delivery.estimatedPackages != null && ' • '}
                                        {delivery.estimatedPackages != null && `Bultos: ${String(delivery.estimatedPackages)}`}
                                    </p>
                                </div>
                            )}
                            {delivery.transportCompany && (
                                <div>
                                    <p className="text-xs uppercase font-semibold text-[--color-text-muted]">Empresa de transporte</p>
                                    <p className="text-sm text-[--color-text-primary]">{delivery.transportCompany}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {userRole === 'Compras' && !isHistory && (
                        <div className="space-y-4 p-4 border border-[--color-border-subtle] rounded-[--radius-lg]">
                            <h3 className="font-semibold">Datos de Compras</h3>
                            {error && <p className="text-sm text-[--color-error]">{error}</p>}
                            <div>
                                <label className="text-sm font-medium text-[--color-text-secondary]">Tracking</label>
                                <input
                                    type="text"
                                    value={tracking}
                                    onChange={(e) => setTracking(e.target.value)}
                                    placeholder="Número o enlace de tracking"
                                    className="mt-1 w-full p-2 border border-[--color-border-strong] rounded-[--radius-md] bg-white"
                                />
                                <p className="mt-1 text-xs text-[--color-text-muted]">Solo visible para Compras.</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[--color-text-secondary]">Notas</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Notas adicionales sobre esta entrega"
                                    className="mt-1 w-full border border-[--color-border-strong] rounded-[--radius-md] p-2 bg-white"
                                />
                            </div>
                            <button
                                onClick={handleSavePurchasesData}
                                disabled={isSavingPurchases}
                                className="w-full py-2 px-4 bg-[--color-primary] text-white font-semibold rounded-[--radius-md] hover:bg-[--color-primary-light] disabled:opacity-60"
                            >
                                {isSavingPurchases ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    )}
                    {userRole === 'Compras' && isHistory && (
                        <div className="p-4 border border-[--color-border-subtle] rounded-[--radius-lg] space-y-1">
                            <h3 className="font-semibold">Tracking</h3>
                            <p className="text-sm text-[--color-text-secondary]">
                                {delivery.tracking && delivery.tracking.trim() ? delivery.tracking : 'Sin tracking asignado'}
                            </p>
                            <p className="text-xs text-[--color-text-muted]">Solo visible para Compras.</p>
                        </div>
                    )}

                    {!isHistory && (
                        <>
                            {/* Warehouse Data */}
                            <div className="space-y-4 p-4 border border-[--color-border-subtle] rounded-[--radius-lg]">
                                <h3 className="font-semibold">Datos de Almacén</h3>
                                {error && <p className="text-sm text-[--color-error]">{error}</p>}
                                <div>
                                    <label className="text-sm font-medium text-[--color-text-secondary]">
                                        Fecha y hora de llegada real {canRegister && <span className="text-[--color-error]">*</span>}
                                    </label>
                                    <input 
                                        type="datetime-local" 
                                        value={arrival} 
                                        onChange={e => setArrival(e.target.value)} 
                                        disabled={!canRegister} 
                                        required={canRegister}
                                        className={`mt-1 w-full p-2 border ${error && canRegister && !arrival ? 'border-[--color-error]' : 'border-[--color-border-strong]'} rounded-[--radius-md] bg-white disabled:bg-gray-100`}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <CustomNumberInput 
                                        id="pallets"
                                        label={canRegister ? <>Palets <span className="text-[--color-error]">*</span></> : "Palets"}
                                        value={pallets}
                                        onChange={setPallets}
                                        disabled={!canRegister}
                                        min={0}
                                    />
                                    <CustomNumberInput 
                                        id="packages"
                                        label={canRegister ? <>Bultos <span className="text-[--color-error]">*</span></> : "Bultos"}
                                        value={packages}
                                        onChange={setPackages}
                                        disabled={!canRegister}
                                        min={0}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[--color-text-secondary]">Observaciones</label>
                                    <textarea
                                        value={observations}
                                        onChange={(e) => setObservations(e.target.value)}
                                        disabled={!isWarehouseUser}
                                        rows={3}
                                        className="mt-1 w-full border border-[--color-border-strong] rounded-[--radius-md] p-2 bg-white disabled:bg-gray-100"
                                    />
                                </div>
                                {canRegister && (
                                    <button
                                        onClick={handleSaveWarehouseData}
                                        disabled={isSavingWarehouse}
                                        className="w-full py-2 px-4 bg-gray-100 text-[--color-text-secondary] font-semibold rounded-[--radius-md] hover:bg-gray-200 disabled:opacity-60"
                                    >
                                        {isSavingWarehouse ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="space-y-2">
                                {delivery.status === 'En almacén' && isWarehouseUser && (
                                    <button
                                        onClick={() => setConfirmAction('alta')}
                                        disabled={isUpdatingStatus}
                                        className="w-full py-2 px-4 bg-[--color-success] text-white font-semibold rounded-[--radius-md] hover:opacity-90 disabled:opacity-60"
                                    >
                                        Dar de Alta
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            {confirmAction === 'alta' && (
                <ConfirmationDialog
                    title="Dar de alta proveedor"
                    message="Al dar de alta este registro, se cerrará el proceso y se enviará la notificación correspondiente. Esta acción no se puede deshacer."
                    onConfirm={() => handleStatusChange('Dado de alta')}
                    onCancel={() => setConfirmAction(null)}
                    confirmText="Confirmar alta"
                    requiresCheckbox={true}
                    checkboxLabel="He revisado los datos y son correctos"
                />
            )}
        </div>
    );
};