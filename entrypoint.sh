#!/bin/sh

CERT_DIR="/etc/letsencrypt/live/bsuirbot.site"
HTTP_CONF="/etc/nginx/conf.d/http.conf"
SSL_CONF="/etc/nginx/conf.d/default.conf"
ACTIVE_CONF="/etc/nginx/conf.d/active.conf"

# Функция для запуска nginx с указанным конфигом
start_nginx_temp() {
  echo "Starting nginx with config: $1"
  cp "$1" "$ACTIVE_CONF"
  nginx
}

start_nginx_final() {
  echo "Starting nginx with config: $1"
  cp "$1" "$ACTIVE_CONF"
  exec nginx -g "daemon off;"  # FINALLY, блокирующий запуск
}

stop_nginx() {
  echo "Stopping nginx..."
  nginx -s quit
  sleep 2
}

# Проверяем наличие сертификатов
if [ ! -f "$CERT_DIR/fullchain.pem" ] || [ ! -f "$CERT_DIR/privkey.pem" ]; then
  echo "SSL certificates not found. Starting HTTP server for certificate issuance..."
  
  # Запускаем временный HTTP сервер
  start_nginx_temp "$HTTP_CONF"
  
  # Получаем сертификаты
  echo "Requesting SSL certificates from Let's Encrypt..."
  certbot certonly --webroot -w /var/www/certbot \
    --email slavikovics@outlook.com --agree-tos --no-eff-email \
    -d bsuirbot.site -d www.bsuirbot.site --noninteractive
  
  # Проверяем успешность получения
  if [ $? -ne 0 ]; then
    echo "Failed to obtain SSL certificates"
    exit 1
  fi
  
  echo "Stopping temporary nginx..."
  stop_nginx
fi

# Запускаем основной HTTPS сервер
echo "Starting HTTPS server with existing certificates"
start_nginx "$SSL_CONF"