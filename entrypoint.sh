#!/bin/sh
set -e

# App a servir: definida con la variable de entorno APP_NAME en Dokploy
# (valores: admin | member-portal). Por defecto: admin.
APP_NAME="${APP_NAME:-admin}"

if [ -d "/dist/${APP_NAME}" ]; then
    echo "Serving app: ${APP_NAME}"
    cp -r "/dist/${APP_NAME}/." /usr/share/nginx/html/
else
    echo "ERROR: /dist/${APP_NAME} no existe. Apps disponibles: $(ls /dist | tr '\n' ' ')"
    exit 1
fi

exec "$@"
