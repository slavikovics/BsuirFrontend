FROM nginx:alpine

RUN apk add --no-cache certbot

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/http.conf /etc/nginx/conf.d/http.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh
RUN mkdir -p /var/www/certbot

ENTRYPOINT ["/entrypoint.sh"]
