import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

export async function archiveRegisteredShipmentsJob() {
    const snapshot = await db
        .collection('shipments')
        .where('status', '==', 'REGISTERED')
        .where('archived', '==', false)
        .get();

    if (snapshot.empty) {
        return 0;
    }

    const batch = db.batch();
    snapshot.forEach((doc) => {
        batch.update(doc.ref, {
            archived: true,
            archivedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    });

    await batch.commit();
    return snapshot.size;
}

