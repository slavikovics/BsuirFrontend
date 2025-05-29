#!/bin/sh

CERT_DIR="/etc/letsencrypt/live/bsuirbot.site"
HTTP_CONF="/etc/nginx/conf.d/http.conf"
SSL_CONF="/etc/nginx/conf.d/default.conf"
ACTIVE_CONF="/etc/nginx/conf.d/active.conf"

# Функция для запуска nginx с указанным конфигом
start_nginx() {
  echo "Starting nginx with config: $1"
  cp "$1" "$ACTIVE_CONF"
  nginx -g "daemon off;"
}

# Проверяем наличие сертификатов
if [ ! -f "$CERT_DIR/fullchain.pem" ] || [ ! -f "$CERT_DIR/privkey.pem" ]; then
  echo "SSL certificates not found. Starting HTTP server for certificate issuance..."
  
  # Запускаем временный HTTP сервер
  start_nginx "$HTTP_CONF"
  
  # Получаем сертификаты
  certbot certonly --webroot -w /var/www/certbot \
    --email slavikovics@outlook.com --agree-tos --no-eff-email \
    -d bsuirbot.site -d www.bsuirbot.site --noninteractive
  
  # Проверяем успешность получения
  if [ $? -ne 0 ]; then
    echo "Failed to obtain SSL certificates"
    exit 1
  fi
  
  # Останавливаем временный сервер
  nginx -s quit
  sleep 2
fi

# Запускаем основной HTTPS сервер
echo "Starting HTTPS server with existing certificates"
start_nginx "$SSL_CONF"