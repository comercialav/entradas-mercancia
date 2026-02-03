# Script para configurar todos los secretos de Firebase App Hosting
# Usa firebase apphosting:secrets:set para crear secretos de forma segura

Write-Host "========================================="
Write-Host "Configurando secretos de Firebase App Hosting"
Write-Host "========================================="
Write-Host ""

$PROJECT_ID = "entradas-63f0e"

# Mapeo de variables a nombres de secretos
$secrets = @{
    "VITE_FIREBASE_API_KEY" = "firebase-api-key"
    "VITE_FIREBASE_AUTH_DOMAIN" = "firebase-auth-domain"
    "VITE_FIREBASE_MESSAGING_SENDER_ID" = "firebase-messaging-sender-id"
    "VITE_FIREBASE_APP_ID" = "firebase-app-id"
}

# Valores actuales del apphosting.yaml (los leemos del archivo)
$currentValues = @{
    "VITE_FIREBASE_API_KEY" = "AIzaSyA4sJtWJc1Zox5xyiiwML9yi9ez8nJogT0"
    "VITE_FIREBASE_AUTH_DOMAIN" = "entradas-63f0e.firebaseapp.com"
    "VITE_FIREBASE_MESSAGING_SENDER_ID" = "752789962386"
    "VITE_FIREBASE_APP_ID" = "1:752789962386:web:6c20c85bb33194e970304b"
}

Write-Host "Se configurarán los siguientes secretos:"
foreach ($var in $secrets.Keys) {
    $secretName = $secrets[$var]
    Write-Host "  - $secretName (para $var)"
}
Write-Host ""

$confirm = Read-Host "¿Continuar? (s/n)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "Cancelado."
    exit 0
}

Write-Host ""
Write-Host "Configurando secretos..."
Write-Host ""

foreach ($var in $secrets.Keys) {
    $secretName = $secrets[$var]
    $value = $currentValues[$var]
    
    Write-Host "Configurando: $secretName"
    Write-Host "  Variable: $var"
    Write-Host "  Valor: $($value.Substring(0, [Math]::Min(20, $value.Length)))..."
    
    # El comando firebase apphosting:secrets:set pedirá el valor de forma interactiva
    # Necesitamos pasar el valor de alguna forma. Intentamos con echo
    $value | firebase apphosting:secrets:set $secretName --project $PROJECT_ID
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Secreto $secretName configurado correctamente"
    } else {
        Write-Host "  ✗ Error al configurar $secretName"
        Write-Host "  Intenta ejecutar manualmente:"
        Write-Host "    firebase apphosting:secrets:set $secretName --project $PROJECT_ID"
    }
    Write-Host ""
}

Write-Host "========================================="
Write-Host "¡Configuración de secretos completada!"
Write-Host "========================================="
Write-Host ""
Write-Host "Ahora actualiza .apphosting/apphosting.yaml para usar los secretos."
Write-Host "Reemplaza 'value:' con 'secret:' para cada variable."

