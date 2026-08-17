# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Dependencias (aprovecha la caché de Docker)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Código fuente
COPY . .

# App a compilar (admin | member-portal).
# En Dokploy: Build Args -> APP_NAME=member-portal (o admin)
ARG APP_NAME=admin
ENV APP_NAME=$APP_NAME

# Compilar en modo producción (genera el version.json)
RUN npm run generate-version && npx ng build ${APP_NAME} --configuration=production

# ---- Serve stage ----
FROM nginx:alpine
ARG APP_NAME=admin

# Config de nginx (SPA: redirige rutas a index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/${APP_NAME} /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
