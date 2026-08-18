#!/bin/sh
set -e

# App a servir: definida con la variable de entorno APP_NAME en Dokploy
# (valores: admin | member-portal). Si no se define, auto-detecta la única disponible.
if [ -z "${APP_NAME}" ]; then
    AVAILABLE=$(ls /dist 2>/dev/null)
    COUNT=$(echo "$AVAILABLE" | grep -c .)
    if [ "$COUNT" -eq 1 ]; then
        APP_NAME="$AVAILABLE"
    else
        APP_NAME="admin"
    fi
fi

# API interno de Dokploy (sin dominio público): el navegador llama a /api
# y nginx lo proxya al contenedor del backend por su nombre de red.
API_UPSTREAM="${API_UPSTREAM:-http://mygym-api-jk2wub:8000}"

# Normalizar: asegurar esquema http y sin barra final (nginx exige http:// o https://)
case "$API_UPSTREAM" in
  http://*|https://*) ;;
  *) API_UPSTREAM="http://${API_UPSTREAM}" ;;
esac
API_UPSTREAM="${API_UPSTREAM%/}"

# Renderizar la config de nginx con el upstream real del API
envsubst '${API_UPSTREAM}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

if [ -d "/dist/${APP_NAME}" ]; then
    echo "Serving app: ${APP_NAME}"
    cp -r "/dist/${APP_NAME}/." /usr/share/nginx/html/
else
    echo "ERROR: /dist/${APP_NAME} no existe. Apps disponibles: $(ls /dist | tr '\n' ' ')"
    exit 1
fi

exec "$@"