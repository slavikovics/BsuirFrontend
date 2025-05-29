#!/bin/sh

CERT_PATH="/etc/letsencrypt/live/bsuirbot.site/fullchain.pem"
HTTP_CONF="/etc/nginx/conf.d/http.conf"
SSL_CONF="/etc/nginx/conf.d/default.conf"
ACTIVE_CONF="/etc/nginx/conf.d/active.conf"

start_nginx_with_config() {
  echo "Starting nginx with config: $1"
  cp "$1" "$ACTIVE_CONF"
  nginx
}

stop_nginx() {
  echo "Stopping nginx..."
  nginx -s stop
  sleep 2
}

# If no certs, start with HTTP only
if [ ! -f "$CERT_PATH" ]; then
  echo "Certificates not found. Launching nginx for HTTP validation..."
  start_nginx_with_config "$HTTP_CONF"

  echo "Obtaining SSL certificates from Let's Encrypt..."
  certbot certonly --webroot -w /var/www/certbot \
    --email slavikovics@outlook.com --agree-tos --no-eff-email \
    -d bsuirbot.site -d www.bsuirbot.site

  if [ $? -ne 0 ]; then
    echo "Failed to obtain certificates."
    stop_nginx
    exit 1
  fi

  stop_nginx
fi

# Use SSL config now
start_nginx_with_config "$SSL_CONF"

# Keep container running
tail -f /dev/null


