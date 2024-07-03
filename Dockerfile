FROM nginx:stable-alpine3.17-slim

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
