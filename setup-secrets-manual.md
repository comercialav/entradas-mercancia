# Configurar Secretos de Firebase App Hosting

Ahora el archivo `.apphosting/apphosting.yaml` está configurado para usar secretos de Cloud Secret Manager. Necesitas crear estos secretos antes de desplegar.

## Secretos a crear:

1. `firebase-api-key`
2. `firebase-auth-domain`
3. `firebase-messaging-sender-id`
4. `firebase-app-id`

## Pasos para configurar los secretos:

### Opción 1: Usando Firebase CLI (Recomendado)

Ejecuta estos comandos uno por uno. Cada comando te pedirá que ingreses el valor del secreto:

```powershell
# 1. API Key
firebase apphosting:secrets:set firebase-api-key --project entradas-63f0e
# Ingresa: AIzaSyA4sJtWJc1Zox5xyiiwML9yi9ez8nJogT0

# 2. Auth Domain
firebase apphosting:secrets:set firebase-auth-domain --project entradas-63f0e
# Ingresa: entradas-63f0e.firebaseapp.com

# 3. Messaging Sender ID
firebase apphosting:secrets:set firebase-messaging-sender-id --project entradas-63f0e
# Ingresa: 752789962386

# 4. App ID
firebase apphosting:secrets:set firebase-app-id --project entradas-63f0e
# Ingresa: 1:752789962386:web:6c20c85bb33194e970304b
```

### Opción 2: Usando gcloud CLI

Si prefieres usar gcloud directamente:

```powershell
# 1. API Key
echo "AIzaSyA4sJtWJc1Zox5xyiiwML9yi9ez8nJogT0" | gcloud secrets create firebase-api-key --data-file=- --project=entradas-63f0e

# 2. Auth Domain
echo "entradas-63f0e.firebaseapp.com" | gcloud secrets create firebase-auth-domain --data-file=- --project=entradas-63f0e

# 3. Messaging Sender ID
echo "752789962386" | gcloud secrets create firebase-messaging-sender-id --data-file=- --project=entradas-63f0e

# 4. App ID
echo "1:752789962386:web:6c20c85bb33194e970304b" | gcloud secrets create firebase-app-id --data-file=- --project=entradas-63f0e
```

Luego otorga acceso al servicio de App Hosting:

```powershell
# Otorgar acceso a todos los secretos
firebase apphosting:secrets:grantaccess firebase-api-key --project entradas-63f0e
firebase apphosting:secrets:grantaccess firebase-auth-domain --project entradas-63f0e
firebase apphosting:secrets:grantaccess firebase-messaging-sender-id --project entradas-63f0e
firebase apphosting:secrets:grantaccess firebase-app-id --project entradas-63f0e
```

### Opción 3: Usando la consola de Google Cloud

1. Ve a [Cloud Secret Manager](https://console.cloud.google.com/security/secret-manager?project=entradas-63f0e)
2. Haz clic en "CREATE SECRET"
3. Crea cada secreto con su valor correspondiente
4. Luego otorga acceso usando `firebase apphosting:secrets:grantaccess`

## Verificar que los secretos están configurados:

```powershell
firebase apphosting:secrets:list --project entradas-63f0e
```

O usando gcloud:

```powershell
gcloud secrets list --project=entradas-63f0e --filter="name~firebase"
```

## Después de configurar los secretos:

1. Haz commit y push del archivo `.apphosting/apphosting.yaml` actualizado
2. Firebase App Hosting detectará los cambios y redesplegará automáticamente
3. Los secretos se cargarán automáticamente durante el build y runtime

## Nota importante:

Los valores sensibles ahora están fuera del código fuente, lo cual es una mejor práctica de seguridad. Si necesitas cambiar algún valor en el futuro, solo actualiza el secreto en Cloud Secret Manager sin tocar el código.

