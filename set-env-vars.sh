#!/bin/bash
# Script para configurar variables de entorno en Firebase App Hosting
# Usa gcloud para actualizar el servicio de Cloud Run

PROJECT_ID="entradas-63f0e"
REGION="europe-west4"
SERVICE_NAME="entradas-mercancia"

# Lee las variables del .env.local
ENV_VARS=()

if [ -f ".env.local" ]; then
    while IFS= read -r line; do
        if [[ $line =~ ^VITE_ ]] && [[ ! $line =~ ^# ]]; then
            IFS='=' read -r key value <<< "$line"
            key=$(echo "$key" | xargs)
            value=$(echo "$value" | xargs)
            # Remove quotes if present
            value=$(echo "$value" | sed "s/^[\"']//; s/[\"']$//")
            ENV_VARS+=("$key=$value")
        fi
    done < .env.local
fi

if [ ${#ENV_VARS[@]} -eq 0 ]; then
    echo "No se encontraron variables VITE_ en .env.local"
    echo "Por favor, configura las variables manualmente:"
    echo ""
    echo "gcloud run services update $SERVICE_NAME \\"
    echo "  --region=$REGION \\"
    echo "  --project=$PROJECT_ID \\"
    echo "  --update-env-vars=\"VITE_FIREBASE_API_KEY=tu_valor,VITE_FIREBASE_AUTH_DOMAIN=tu_valor,...\""
    exit 1
fi

# Construye el string de variables de entorno
ENV_VARS_STRING=$(IFS=','; echo "${ENV_VARS[*]}")

echo "Configurando variables de entorno para $SERVICE_NAME..."
echo "Variables a configurar:"
printf '  %s\n' "${ENV_VARS[@]}"

echo ""
read -p "¿Continuar? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Cancelado."
    exit 0
fi

# Actualiza el servicio
echo "Actualizando servicio..."
gcloud run services update "$SERVICE_NAME" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --update-env-vars="$ENV_VARS_STRING"

if [ $? -eq 0 ]; then
    echo "¡Variables de entorno configuradas correctamente!"
else
    echo "Error al configurar las variables de entorno."
    exit 1
fi

