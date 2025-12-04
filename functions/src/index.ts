import * as httpsFunctions from 'firebase-functions/v2/https';
import * as scheduler from 'firebase-functions/v2/scheduler';
import cors from 'cors';
import { handleNotification, type NotifyAction, type NotificationPayload } from './notify';
import { archiveRegisteredShipmentsJob } from './jobs';

const corsHandler = cors({ origin: true });

export const notify = httpsFunctions.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        try {
            const { action, payload } = req.body as { action?: NotifyAction; payload?: NotificationPayload };

            if (!action || !payload) {
                res.status(400).json({ error: 'Missing action or payload' });
                return;
            }

            const allowedActions: NotifyAction[] = ['SHIPMENT_CREATED', 'SHIPMENT_ARRIVED', 'SHIPMENT_REGISTERED'];
            if (!allowedActions.includes(action)) {
                res.status(400).json({ error: 'Unsupported action' });
                return;
            }

            const result = await handleNotification(action, payload);
            res.status(200).json({ ok: true, ...result });
        } catch (error) {
            console.error('[notify] Error sending email', error);
            res.status(500).json({ error: 'Unable to send notification' });
        }
    });
});

export const autoArchiveRegistered = scheduler.onSchedule(
    {
        schedule: '0 8 * * 1',
        timeZone: 'Atlantic/Canary',
    },
    async () => {
        const archivedCount = await archiveRegisteredShipmentsJob();
        console.log(`[autoArchive] Archived ${archivedCount} deliveries`);
    }
);

