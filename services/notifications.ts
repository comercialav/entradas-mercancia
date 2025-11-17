export type NotificationAction = 'SHIPMENT_CREATED' | 'SHIPMENT_ARRIVED' | 'SHIPMENT_REGISTERED';

import type { IslandCode } from '../types';

export interface NotificationRequestPayload {
    supplier: string;
    expectedDate: string;
    status: string;
    arrival?: string | null;
    pallets?: number | null;
    packages?: number | null;
    notes?: string | null;
    tracking?: string | null;
    observations?: string | null;
    updatedBy?: string | null;
    island: IslandCode;
}

const NOTIFY_ENDPOINT = import.meta.env.PROOVEDORES_AV_NOTIFY_ENDPOINT;

export async function notifyServer(action: NotificationAction, payload: NotificationRequestPayload) {
    if (!NOTIFY_ENDPOINT || import.meta.env.PROOVEDORES_AV_DISABLE_NOTIFICATIONS === 'true') {
        if (import.meta.env.DEV) {
            console.info('[notify] Notifications disabled. Skipping email trigger for action', action);
        }
        return;
    }

    const response = await fetch(NOTIFY_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
        throw new Error(`Failed to notify backend: ${response.statusText}`);
    }

    return response.json();
}

