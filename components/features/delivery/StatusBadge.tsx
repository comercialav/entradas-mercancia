import React from 'react';
import type { Delivery, DeliveryStatus } from '../../../types';
import { getIncidentState } from '../../../types';

interface StatusBadgeProps {
    status: DeliveryStatus;
}

const STATUS_STYLES: Record<DeliveryStatus, { bg: string; text: string }> = {
    'En tránsito': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
    },
    'En almacén': {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
    },
    'Dado de alta': {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
    },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const style = STATUS_STYLES[status];
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
            {status}
        </span>
    );
};

const INCIDENT_STYLES = {
    open: { bg: 'bg-red-100', text: 'text-red-700', label: 'Sí' },
    none: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'No' },
    resolved: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Solucionada' },
} as const;

export const IncidentBadge: React.FC<{ delivery: Pick<Delivery, 'hasIncident' | 'incidentSolution'> }> = ({ delivery }) => {
    const state = getIncidentState(delivery);
    if (state === 'unset') {
        return null;
    }
    const style = INCIDENT_STYLES[state];
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
            {style.label}
        </span>
    );
};

