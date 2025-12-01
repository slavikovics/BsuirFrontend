#!/bin/bash

echo "Waiting for PostgreSQL to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done

echo "PostgreSQL is ready!"

dotnet tool install --global dotnet-ef --version 9.0.0 || true

export PATH="$PATH:/root/.dotnet/tools"

echo "Attempting to run database migrations..."

cd /app

if dotnet ef migrations list | grep -q "No migrations were found"; then
    echo "No migrations found. Creating initial migration..."
    dotnet ef migrations add InitialCreate
fi

echo "Applying migrations..."
dotnet ef database update

echo "Starting application..."
exec dotnet backend.dll