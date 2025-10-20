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
COPY --from=build-env /app/build/client /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]