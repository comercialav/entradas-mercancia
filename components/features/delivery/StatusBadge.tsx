import React from 'react';
import type { DeliveryStatus } from '../../../types';

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

