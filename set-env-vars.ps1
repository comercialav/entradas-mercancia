# Script para configurar variables de entorno en Firebase App Hosting
# Usa gcloud para actualizar el servicio de Cloud Run

$PROJECT_ID = "entradas-63f0e"
$REGION = "europe-west4"
$SERVICE_NAME = "entradas-mercancia"

# Lee las variables del .env.local
$envVars = @()

if (Test-Path ".env.local") {
    $lines = Get-Content ".env.local"
    foreach ($line in $lines) {
        if ($line -match "^VITE_" -and $line -notmatch "^#") {
            $parts = $line -split "=", 2
            if ($parts.Length -eq 2) {
                $key = $parts[0].Trim()
                $value = $parts[1].Trim()
                # Remove quotes if present
                $value = $value -replace '^["'']|["'']$', ''
                $envVars += "$key=$value"
            }
        }
    }
}

if ($envVars.Count -eq 0) {
    Write-Host "No se encontraron variables VITE_ en .env.local"
    Write-Host "Por favor, configura las variables manualmente:"
    Write-Host ""
    Write-Host "gcloud run services update $SERVICE_NAME \"
    Write-Host "  --region=$REGION \"
    Write-Host "  --project=$PROJECT_ID \"
    Write-Host "  --update-env-vars=`"VITE_FIREBASE_API_KEY=tu_valor,VITE_FIREBASE_AUTH_DOMAIN=tu_valor,...`""
    exit 1
}

# Construye el string de variables de entorno
$envVarsString = $envVars -join ","

Write-Host "Configurando variables de entorno para $SERVICE_NAME..."
Write-Host "Variables a configurar:"
$envVars | ForEach-Object { Write-Host "  $_" }

Write-Host ""
$confirm = Read-Host "¿Continuar? (s/n)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "Cancelado."
    exit 0
}

# Actualiza el servicio
Write-Host "Actualizando servicio..."
gcloud run services update $SERVICE_NAME `
    --region=$REGION `
    --project=$PROJECT_ID `
    --update-env-vars="$envVarsString"

if ($LASTEXITCODE -eq 0) {
    Write-Host "¡Variables de entorno configuradas correctamente!"
} else {
    Write-Host "Error al configurar las variables de entorno."
    exit 1
}

