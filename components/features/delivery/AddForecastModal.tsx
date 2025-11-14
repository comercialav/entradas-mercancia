import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Delivery, IslandCode } from '../../../types';
import { SUPPLIERS, ISLAND_OPTIONS } from '../../../constants';
import { CloseIcon, ChevronDownIcon } from '../../ui/Icons';

interface AddForecastModalProps {
    onClose: () => void;
    onAddDelivery: (newDelivery: Omit<Delivery, 'id' | 'status' | 'lastUpdate' | 'arrival' | 'pallets' | 'packages'>) => Promise<void>;
    showTrackingField?: boolean;
}

export const AddForecastModal: React.FC<AddForecastModalProps> = ({ onClose, onAddDelivery, showTrackingField = false }) => {
    const [supplier, setSupplier] = useState('');
    const [expectedDate, setExpectedDate] = useState('');
    const [notes, setNotes] = useState('');
    const [tracking, setTracking] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [useCustomSupplier, setUseCustomSupplier] = useState(false);
    const [supplierSearch, setSupplierSearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [island, setIsland] = useState<IslandCode>('GC');

    const filteredSuppliers = useMemo(() => {
        return SUPPLIERS.filter((name) =>
            name.toLowerCase().includes(supplierSearch.toLowerCase())
        );
    }, [supplierSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplier || !expectedDate) {
            setError('Proveedor y fecha prevista son obligatorios.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await onAddDelivery({ supplier, expectedDate, notes, tracking: tracking || undefined, island });
            onClose();
        } catch (err) {
            console.error(err);
            setError('No se pudo guardar la previsión. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = Boolean(supplier && expectedDate);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[--color-surface] rounded-[--radius-lg] shadow-xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-[--color-text-muted] hover:text-[--color-text-primary]">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-[--color-text-primary]">Añadir Previsión de Llegada</h3>
                    </div>
                    <div className="p-6 space-y-4 border-y border-[--color-border-subtle]">
                        {error && <p className="text-sm text-[--color-error]">{error}</p>}
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="supplier" className="block text-sm font-medium text-[--color-text-secondary]">Proveedor</label>
                                <button
                                    type="button"
                                    className="text-xs font-semibold text-[--color-primary] hover:text-[--color-primary-light]"
                                    onClick={() => {
                                        setUseCustomSupplier(prev => !prev);
                                        setSupplier('');
                                        setSupplierSearch('');
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    {useCustomSupplier ? 'Usar lista' : 'Nuevo proveedor'}
                                </button>
                            </div>
                            {!useCustomSupplier ? (
                                <div className="relative mt-1" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(prev => !prev)}
                                        className={`w-full flex items-center justify-between bg-white border ${error && !supplier ? 'border-[--color-error]' : 'border-[--color-border-strong]'} rounded-[--radius-md] py-2 px-3 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]`}
                                    >
                                        <span className={supplier ? 'text-[--color-text-primary]' : 'text-[--color-text-muted]'}>
                                            {supplier || 'Selecciona proveedor'}
                                        </span>
                                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="absolute z-20 mt-2 w-full bg-white border border-[--color-border-subtle] rounded-[--radius-md] shadow-xl">
                                            <input
                                                type="text"
                                                value={supplierSearch}
                                                onChange={(e) => setSupplierSearch(e.target.value)}
                                                placeholder="Busca por nombre…"
                                                className="w-full border-b border-[--color-border-subtle] px-3 py-2 text-sm focus:outline-none"
                                            />
                                            <div className="max-h-48 overflow-y-auto">
                                                {filteredSuppliers.length > 0 ? (
                                                    filteredSuppliers.map((name) => (
                                                        <button
                                                            type="button"
                                                            key={name}
                                                            className="w-full text-left px-3 py-2 text-sm hover:bg-[--color-primary]/10"
                                                            onClick={() => {
                                                                setSupplier(name);
                                                                setSupplierSearch('');
                                                                setIsDropdownOpen(false);
                                                            }}
                                                        >
                                                            {name}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <p className="px-3 py-2 text-sm text-[--color-text-muted]">Sin coincidencias</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <input
                                    id="supplier"
                                    type="text"
                                    value={supplier}
                                    onChange={e => setSupplier(e.target.value)}
                                    placeholder="Nombre del proveedor"
                                    className={`mt-1 block w-full bg-white border ${error && !supplier ? 'border-[--color-error]' : 'border-[--color-border-strong]'} rounded-[--radius-md] shadow-sm py-2 px-3 focus:outline-none focus:ring-[--color-primary] focus:border-[--color-primary]`}
                                />
                            )}
                        </div>
                        {showTrackingField && (
                            <div>
                                <label htmlFor="tracking" className="block text-sm font-medium text-[--color-text-secondary]">Tracking</label>
                                <input
                                    id="tracking"
                                    type="text"
                                    value={tracking}
                                    onChange={(e) => setTracking(e.target.value)}
                                    placeholder="Número o enlace de tracking"
                                    className="mt-1 block w-full bg-white border border-[--color-border-strong] rounded-[--radius-md] shadow-sm py-2 px-3 focus:outline-none focus:ring-[--color-primary] focus:border-[--color-primary]"
                                />
                                <p className="mt-1 text-xs text-[--color-text-secondary]">Solo visible para Compras.</p>
                            </div>
                        )}
                        <div>
                            <label htmlFor="island" className="block text-sm font-medium text-[--color-text-secondary]">Isla</label>
                            <select
                                id="island"
                                value={island}
                                onChange={(e) => setIsland(e.target.value as IslandCode)}
                                className="mt-1 block w-full bg-white border border-[--color-border-strong] rounded-[--radius-md] shadow-sm py-2 px-3 focus:outline-none focus:ring-[--color-primary] focus:border-[--color-primary]"
                            >
                                {ISLAND_OPTIONS.map(option => (
                                    <option key={option} value={option}>
                                        {option === 'GC' ? 'Gran Canaria' : 'Tenerife'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="expectedDate" className="block text-sm font-medium text-[--color-text-secondary]">Fecha Prevista de Llegada</label>
                            <input
                                type="date"
                                id="expectedDate"
                                value={expectedDate}
                                onChange={e => setExpectedDate(e.target.value)}
                                className={`mt-1 block w-full bg-white border ${error && !expectedDate ? 'border-[--color-error]' : 'border-[--color-border-strong]'} rounded-[--radius-md] shadow-sm py-2 px-3 focus:outline-none focus:ring-[--color-primary] focus:border-[--color-primary]`}
                            />
                        </div>
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-[--color-text-secondary]">Notas (opcional)</label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full bg-white border border-[--color-border-strong] rounded-[--radius-md] shadow-sm py-2 px-3 focus:outline-none focus:ring-[--color-primary] focus:border-[--color-primary]"
                            />
                        </div>
                    </div>
                    <div className="p-4 flex justify-end gap-3 bg-gray-50 rounded-b-[--radius-lg]">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[--color-text-secondary] hover:bg-gray-100 rounded-[--radius-md]">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid || isSubmitting}
                            className="px-4 py-2 text-sm font-semibold text-white bg-[--color-primary] rounded-[--radius-md] hover:bg-[--color-primary-light] disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Guardando...' : 'Guardar Previsión'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};