#!/bin/sh

CERT_PATH="/etc/letsencrypt/live/bsuirbot.site/fullchain.pem"

start_nginx_http_only() {
  echo "Starting nginx without SSL (for certbot)..."
  nginx -c /etc/nginx/http.conf
}

start_nginx_full_ssl() {
  echo "Starting nginx with SSL..."
  nginx -c /etc/nginx/default.conf
}

if [ ! -f "$CERT_PATH" ]; then
  start_nginx_http_only

  echo "Obtaining SSL certificates from Let's Encrypt..."
  certbot certonly --webroot -w /var/www/certbot \
    --email slavikovics@outlook.com --agree-tos --no-eff-email \
    -d bsuirbot.site -d www.bsuirbot.site

  if [ $? -ne 0 ]; then
    echo "Failed to obtain certificates"
    nginx -s stop
    exit 1
  fi

  echo "Stopping nginx (HTTP only)..."
  nginx -s stop
fi

start_nginx_full_ssl

# keep container running
tail -f /dev/null

