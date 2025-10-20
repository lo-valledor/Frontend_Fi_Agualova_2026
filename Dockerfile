FROM node:22-alpine AS development-dependencies-env
RUN corepack enable
COPY . /app
WORKDIR /app
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS production-dependencies-env
RUN corepack enable
COPY ./package.json pnpm-lock.yaml /app/
WORKDIR /app
RUN pnpm install --frozen-lockfile --prod

FROM node:22-alpine AS build-env
RUN corepack enable
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app

# Agregar las variables de entorno para el build
ARG VITE_API_URL
ARG VITE_API_ENERLINK_URL
ARG VITE_AI_API_URL
ARG VITE_ENV_MODE=production
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_ENERLINK_URL=$VITE_API_ENERLINK_URL
ENV VITE_AI_API_URL=$VITE_AI_API_URL
ENV VITE_ENV_MODE=$VITE_ENV_MODE

RUN pnpm run build

FROM nginx:alpine

# Instalar curl para healthchecks (opcional)
RUN apk add --no-cache curl

COPY --from=build-env /app/build/client /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Crear directorios y dar permisos para usuario nginx
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /var/run && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

EXPOSE 80

# Usuario no-root
USER nginx

CMD ["nginx", "-g", "daemon off;"]