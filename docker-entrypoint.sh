#!/bin/sh
set -e

echo "[entrypoint] Running Prisma migrations..."
cd /app && node_modules/.bin/prisma migrate deploy --schema=packages/database/prisma/schema.prisma

echo "[entrypoint] Migrations done. Starting API..."
exec "$@"
