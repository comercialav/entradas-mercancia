# Configurar Variables de Entorno en Firebase App Hosting

Según la documentación oficial de Firebase App Hosting, hay dos formas de configurar variables de entorno:

## Opción 1: Valores directos en apphosting.yaml (Simple)

Edita el archivo `.apphosting/apphosting.yaml` y reemplaza los valores vacíos con tus credenciales:

```yaml
env:
  - variable: VITE_FIREBASE_API_KEY
    value: "tu-api-key-aqui"
    availability:
      - BUILD
      - RUNTIME
```

**⚠️ Nota**: Esta opción es menos segura porque los valores quedan en el código fuente.

## Opción 2: Usar Cloud Secret Manager (Recomendado - Más seguro)

### Paso 1: Crear los secretos usando Firebase CLI

Ejecuta estos comandos para cada variable sensible:

```powershell
# Para API Key
firebase apphosting:secrets:set firebase-api-key --project entradas-63f0e

# Para Auth Domain
firebase apphosting:secrets:set firebase-auth-domain --project entradas-63f0e

# Para Messaging Sender ID
firebase apphosting:secrets:set firebase-messaging-sender-id --project entradas-63f0e

# Para App ID
firebase apphosting:secrets:set firebase-app-id --project entradas-63f0e
```

Cada comando te pedirá que ingreses el valor del secreto de forma interactiva.

### Paso 2: Actualizar apphosting.yaml para usar los secretos

Después de crear los secretos, actualiza `.apphosting/apphosting.yaml`:

```yaml
env:
  - variable: VITE_FIREBASE_API_KEY
    secret: firebase-api-key
    availability:
      - BUILD
      - RUNTIME
  
  - variable: VITE_FIREBASE_AUTH_DOMAIN
    secret: firebase-auth-domain
    availability:
      - BUILD
      - RUNTIME
```

### Paso 3: Usar el script automatizado

También puedes usar el script `setup-secrets.ps1` que lee tu `.env.local` y configura los secretos automáticamente:

```powershell
.\setup-secrets.ps1
```

## Variables que necesitas configurar:

### Requeridas:
- `VITE_FIREBASE_API_KEY` - Tu API Key de Firebase
- `VITE_FIREBASE_AUTH_DOMAIN` - Tu Auth Domain (ej: `entradas-63f0e.firebaseapp.com`)
- `VITE_FIREBASE_PROJECT_ID` - Ya configurado: `entradas-63f0e`
- `VITE_FIREBASE_STORAGE_BUCKET` - Ya configurado: `entradas-63f0e.firebasestorage.app`
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Tu Messaging Sender ID
- `VITE_FIREBASE_APP_ID` - Tu App ID

### Opcionales:
- `VITE_NOTIFY_ENDPOINT` - Ya configurado: `https://us-central1-entradas-63f0e.cloudfunctions.net/notify`
- `VITE_DISABLE_NOTIFICATIONS` - Ya configurado: `false`

## Después de configurar:

1. Haz commit y push de los cambios en `.apphosting/apphosting.yaml`
2. Firebase App Hosting detectará los cambios y redesplegará automáticamente
3. Las variables estarán disponibles tanto en BUILD como en RUNTIME

## Verificar que funcionó:

Después del despliegue, la app debería cargar correctamente sin el error `auth/invalid-api-key`.

