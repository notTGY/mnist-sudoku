FROM oven/bun:alpine

COPY . /app

RUN cd /app && bun install && bun run build


FROM nginx:stable-alpine3.17-slim

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=0 app/dist /usr/share/nginx/html
