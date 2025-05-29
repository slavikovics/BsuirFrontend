#!/bin/sh

CERT_PATH="/etc/letsencrypt/live/bsuirbot.site/fullchain.pem"

nginx -g "daemon off;" &

NGINX_PID=$!

if [ ! -f "$CERT_PATH" ]; then
  echo "SSL certificates not found, obtaining from Let's Encrypt..."

  certbot certonly --webroot -w /var/www/certbot \
    --email slavikovics@outlook.com --agree-tos --no-eff-email \
    -d bsuirbot.site -d www.bsuirbot.site

  if [ $? -ne 0 ]; then
    echo "Failed to obtain certificates"
    kill $NGINX_PID
    exit 1
  fi
fi

kill $NGINX_PID

nginx -g "daemon off;"
