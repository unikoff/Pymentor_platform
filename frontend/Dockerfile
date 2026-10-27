FROM node:24.18.0-bookworm-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
RUN npm audit --audit-level=critical

COPY . .
RUN npm exec -- tsc --noEmit -p config/tsconfig.json \
    && ./node_modules/.bin/vite build --config config/vite.config.ts --configLoader native --outDir /tmp/frontend-dist

FROM nginx:1.30.6-alpine3.24-slim AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /tmp/frontend-dist/ /usr/share/nginx/html/

EXPOSE 8080
