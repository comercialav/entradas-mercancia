<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1YPbXdkbAG7liingjNgYfXvGsv6GHuNYd

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copia el archivo `.env.local` de ejemplo (si no existe) y define tus credenciales de Firebase + endpoint de notificaciones:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_NOTIFY_ENDPOINT=https://<tu-region>-<tu-proyecto>.cloudfunctions.net/notify
   VITE_DISABLE_NOTIFICATIONS=true   # opcional para pausar los correos en desarrollo
   ```

   > El endpoint se completa tras desplegar la Cloud Function `notify` descrita abajo.

3. Ejecuta el entorno de desarrollo:
   `npm run dev`

4. (Opcional) Genera la build de producción:
   `npm run build`

## Email notifications (Firebase Functions)

1. Inicializa las Functions (si no lo hiciste):
   ```
   firebase init functions
   ```
2. Instala dependencias en `functions/`:
   ```
   cd functions
   npm install
   ```
3. Configura las credenciales SMTP **solo en el backend**:
   ```
   firebase functions:config:set mail.host="smtp.ionos.es" \
     mail.port="465" \
     mail.user="entregas.mercancia@comercialav.com" \
     mail.pass="$W2tissU_CAV2025" \
     mail.from="entregas.mercancia@comercialav.com" \
     mail.reply_to="entregas.mercancia@comercialav.com"
   ```
   > Ajusta los valores según tu proveedor. No expongas estas claves en el frontend.

4. Compila/depliega la función `notify`:
   ```
   npm run build
   firebase deploy --only functions
   ```

5. Copia la URL resultante y colócala en `VITE_NOTIFY_ENDPOINT` para que el frontend pueda disparar los correos.

## Archivado automático

- Existe la función programada `autoArchiveRegistered` que ejecuta el archivado todos los lunes a las 08:00 (hora Canarias).
- Para desplegarla junto con `notify`, usa:
  ```
  cd functions
  npm run build
  firebase deploy --only functions:autoArchiveRegistered,functions:notify
  ```
- Puedes seguir usando el botón “Archivar manualmente ahora” (solo visible para Compras) para lanzar el proceso en cualquier momento.
