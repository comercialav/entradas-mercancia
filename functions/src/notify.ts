import type { HttpsError } from 'firebase-functions/v2/https';
import { sendMail } from './mail';

export type NotifyAction = 'SHIPMENT_CREATED' | 'SHIPMENT_ARRIVED' | 'SHIPMENT_REGISTERED';
type IslandCode = 'GC' | 'TF';

export interface NotificationPayload {
    supplier: string;
    expectedDate: string;
    status: string;
    pallets?: number | null;
    packages?: number | null;
    arrival?: string | null;
    notes?: string | null;
    tracking?: string | null;
    updatedBy?: string | null;
    observations?: string | null;
    island: IslandCode;
    estimatedPallets?: number | null;
    estimatedPackages?: number | null;
    transportCompany?: string | null;
}

const WAREHOUSE_EMAIL: Record<IslandCode, string> = {
    GC: 'almacen.gc@comercialav.com',
    TF: 'almacen.tf@comercialav.com',
};

const NOTIFY_EMAILS: Record<IslandCode, string> = {
    GC: 'avisos.entradas.gc@comercialav.com',
    TF: 'avisos.entradas.tf@comercialav.com',
};

const SUBJECTS: Record<NotifyAction, string> = {
    SHIPMENT_CREATED: 'Nueva previsión registrada',
    SHIPMENT_ARRIVED: 'Entrada de mercancía registrada',
    SHIPMENT_REGISTERED: 'Entrega dada de alta',
};

const ACTION_DESCRIPTIONS: Record<NotifyAction, string> = {
    SHIPMENT_CREATED: 'Se ha registrado una nueva previsión de proveedor.',
    SHIPMENT_ARRIVED: 'El almacén ha marcado la llegada real.',
    SHIPMENT_REGISTERED: 'Almacén ha dado de alta la entrega y se ha notificado a Compras.',
};

function formatDate(value?: string | null) {
    if (!value) return '—';
    return new Date(value).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function buildHtml(action: NotifyAction, payload: NotificationPayload) {
    return `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111; line-height: 1.4;">
            <h2 style="color:#0b63ce;margin-bottom:4px;">${SUBJECTS[action]}</h2>
            <p style="margin-top:0;color:#555;">${ACTION_DESCRIPTIONS[action]}</p>
            <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                <tbody>
                    <tr>
                        <td style="padding:6px 8px;background:#f4f6fa;width:35%;font-weight:600;">Proveedor</td>
                        <td style="padding:6px 8px;">${payload.supplier}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 8px;background:#f4f6fa;font-weight:600;">Fecha prevista</td>
                        <td style="padding:6px 8px;">${formatDate(payload.expectedDate)}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 8px;background:#f4f6fa;font-weight:600;">Estado actual</td>
                        <td style="padding:6px 8px;">${payload.status}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 8px;background:#f4f6fa;font-weight:600;">Llegada real</td>
                        <td style="padding:6px 8px;">${formatDate(payload.arrival)}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 8px;background:#f4f6fa;font-weight:600;">Palets / Bultos</td>
                        <td style="padding:6px 8px;">${payload.pallets ?? '—'} / ${payload.packages ?? '—'}</td>
                    </tr>
                    ${(payload.estimatedPallets || payload.estimatedPackages) ? `
                    <tr>
                        <td style="padding:6px 8px;background:#f4f6fa;font-weight:600;">Estimación inicial</td>
                        <td style="padding:6px 8px;">${payload.estimatedPallets ? `Palets: ${payload.estimatedPallets}` : ''}${payload.estimatedPallets && payload.estimatedPackages ? ' • ' : ''}${payload.estimatedPackages ? `Bultos: ${payload.estimatedPackages}` : ''}</td>
                    </tr>
                    ` : ''}
                    ${payload.transportCompany ? `
                    <tr>
                        <td style="padding:6px 8px;background:#f4f6fa;font-weight:600;">Empresa de transporte</td>
                        <td style="padding:6px 8px;">${payload.transportCompany}</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td style="padding:6px 8px;background:#f4f6fa;font-weight:600;">Isla</td>
                        <td style="padding:6px 8px;">${payload.island === 'GC' ? 'Gran Canaria' : 'Tenerife'}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 8px;background:#f4f6fa;font-weight:600;">Notas</td>
                        <td style="padding:6px 8px;">${payload.notes ?? '—'}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 8px;background:#f4f6fa;font-weight:600;">Observaciones</td>
                        <td style="padding:6px 8px;">${payload.observations ?? '—'}</td>
                    </tr>
                </tbody>
            </table>
            <p style="margin-top:16px;font-size:13px;color:#555;">Actualizado por: ${payload.updatedBy ?? 'Usuario'}</p>
        </div>
    `;
}

function resolveRecipients(action: NotifyAction, payload: NotificationPayload) {
    switch (action) {
        case 'SHIPMENT_CREATED':
            return [
                WAREHOUSE_EMAIL[payload.island] ?? 'almacen@comercialav.com'
            ];
        case 'SHIPMENT_ARRIVED':
            return ['compras@comercialav.com'];
        case 'SHIPMENT_REGISTERED':
            return ['compras@comercialav.com', NOTIFY_EMAILS[payload.island]];
        default:
            return ['compras@comercialav.com'];
    }
}

export async function handleNotification(action: NotifyAction, payload: NotificationPayload) {
    const to = resolveRecipients(action, payload);
    const html = buildHtml(action, payload);

    await sendMail({
        to,
        subject: SUBJECTS[action],
        html,
    });

    return { deliveredTo: to };
}

