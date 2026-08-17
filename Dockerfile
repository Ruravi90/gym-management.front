# ---- Build stage: compila AMBAS apps ----
FROM node:20-alpine AS build
WORKDIR /app

# Dependencias (aprovecha la caché de Docker)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Código fuente
COPY . .

# Compilar las dos apps en producción (sin build args; la elección es en runtime)
RUN npm run generate-version && \
    npx ng build admin --configuration=production && \
    npx ng build member-portal --configuration=production

# ---- Serve stage: nginx sirve la app elegida por env var APP_NAME ----
FROM nginx:alpine

# Template de nginx (SPA + proxy /api al backend interno de Dokploy)
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Dist de ambas apps
COPY --from=build /app/dist /dist

# Entrypoint que renderiza la config y copia la app seleccionada al html de nginx
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]