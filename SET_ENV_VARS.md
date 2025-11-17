# Configurar Variables de Entorno en Firebase App Hosting

## Opción 1: Usando gcloud (recomendado)

Ejecuta este comando reemplazando los valores con los de tu `.env.local`:

```powershell
gcloud run services update entradas-mercancia `
    --region=europe-west4 `
    --project=entradas-63f0e `
    --update-env-vars="VITE_FIREBASE_API_KEY=TU_API_KEY,VITE_FIREBASE_AUTH_DOMAIN=TU_AUTH_DOMAIN,VITE_FIREBASE_PROJECT_ID=entradas-63f0e,VITE_FIREBASE_STORAGE_BUCKET=entradas-63f0e.firebasestorage.app,VITE_FIREBASE_MESSAGING_SENDER_ID=TU_SENDER_ID,VITE_FIREBASE_APP_ID=TU_APP_ID,VITE_NOTIFY_ENDPOINT=https://us-central1-entradas-63f0e.cloudfunctions.net/notify"
```

## Opción 2: Usando el script PowerShell

Si tienes un archivo `.env.local` con las variables:

```powershell
.\set-env-vars.ps1
```

## Opción 3: Configurar en la consola de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/project/entradas-63f0e/apphosting)
2. Selecciona tu app
3. Ve a Settings → Environment variables
4. Agrega cada variable manualmente

## Variables requeridas:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_NOTIFY_ENDPOINT` (opcional)

## Nota importante:

Las variables de entorno configuradas con `gcloud` se aplican al servicio de Cloud Run, pero Firebase App Hosting puede sobrescribirlas en el próximo despliegue. Es mejor configurarlas en la consola de Firebase App Hosting para que persistan.

