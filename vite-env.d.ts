/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly PROOVEDORES_AV_FIREBASE_API_KEY: string;
    readonly PROOVEDORES_AV_FIREBASE_AUTH_DOMAIN: string;
    readonly PROOVEDORES_AV_FIREBASE_PROJECT_ID: string;
    readonly PROOVEDORES_AV_FIREBASE_STORAGE_BUCKET: string;
    readonly PROOVEDORES_AV_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly PROOVEDORES_AV_FIREBASE_APP_ID: string;
    readonly PROOVEDORES_AV_NOTIFY_ENDPOINT?: string;
    readonly PROOVEDORES_AV_DISABLE_NOTIFICATIONS?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

