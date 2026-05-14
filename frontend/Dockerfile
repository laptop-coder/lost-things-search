FROM node:26.1.0-alpine3.22 AS deps
WORKDIR /app
COPY package.json package-lock.json .
RUN npm i

FROM node:26.1.0-alpine3.22 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY vite.config.ts tsconfig.json index.html .
COPY src src
COPY .env* .
RUN npx vite build

FROM nginx:1.31.0-alpine3.23-slim
WORKDIR app
COPY nginx.conf.template .
COPY assets /usr/share/nginx/html/storage/assets
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 31022
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
ENTRYPOINT /app/entrypoint.sh
