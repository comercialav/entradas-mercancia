# Script para configurar secretos de Firebase App Hosting
# Usa firebase apphosting:secrets:set para crear secretos de forma segura

Write-Host "Configurando secretos de Firebase App Hosting..."
Write-Host ""

# Lee las variables del .env.local si existe
$envVars = @{}

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
                $envVars[$key] = $value
            }
        }
    }
}

# Lista de variables que necesitamos configurar
$requiredVars = @(
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID"
)

$optionalVars = @(
    "VITE_NOTIFY_ENDPOINT"
)

Write-Host "Variables requeridas:"
foreach ($var in $requiredVars) {
    if ($envVars.ContainsKey($var)) {
        Write-Host "  ✓ $var encontrada"
    } else {
        Write-Host "  ✗ $var NO encontrada"
    }
}

Write-Host ""
Write-Host "¿Quieres configurar estas variables como secretos en Cloud Secret Manager? (s/n)"
$confirm = Read-Host
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "Cancelado. Puedes editar .apphosting/apphosting.yaml manualmente."
    exit 0
}

# Configura cada secreto
foreach ($var in $requiredVars) {
    if ($envVars.ContainsKey($var)) {
        $secretName = $var.ToLower().Replace("VITE_", "").Replace("_", "-")
        Write-Host ""
        Write-Host "Configurando secreto: $secretName"
        Write-Host "Variable: $var"
        
        # Usa el comando de Firebase CLI
        $value = $envVars[$var]
        Write-Host "Ejecutando: firebase apphosting:secrets:set $secretName --project entradas-63f0e"
        Write-Host "Valor: $($value.Substring(0, [Math]::Min(10, $value.Length)))..."
        
        # Nota: El comando pedirá el valor de forma interactiva
        firebase apphosting:secrets:set $secretName --project entradas-63f0e
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Secreto $secretName configurado correctamente"
        } else {
            Write-Host "✗ Error al configurar $secretName"
        }
    } else {
        Write-Host "⚠ Saltando $var (no encontrada en .env.local)"
    }
}

Write-Host ""
Write-Host "¡Configuración completada!"
Write-Host ""
Write-Host "Ahora actualiza .apphosting/apphosting.yaml para usar los secretos:"
Write-Host "  - variable: VITE_FIREBASE_API_KEY"
Write-Host "    secret: firebase-api-key"
Write-Host "    availability:"
Write-Host "      - BUILD"
Write-Host "      - RUNTIME"

