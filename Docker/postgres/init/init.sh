#!/bin/sh
set -euo pipefail

: "${APP_DB_NAME:=$POSTGRES_DB}"
: "${APP_DB_USER:=$POSTGRES_USER}"
: "${APP_DB_PASSWORD:=$POSTGRES_PASSWORD}"

echo ">> Ensure role ${APP_DB_USER}"
if ! psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres -tAc \
  "SELECT 1 FROM pg_roles WHERE rolname='${APP_DB_USER}'" | grep -q 1; then
  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres -c \
    "CREATE ROLE ${APP_DB_USER} LOGIN PASSWORD '${APP_DB_PASSWORD}'"
fi

echo ">> Ensure database ${APP_DB_NAME} owned by ${APP_DB_USER}"
if ! psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres -tAc \
  "SELECT 1 FROM pg_database WHERE datname='${APP_DB_NAME}'" | grep -q 1; then
  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres -c \
    "CREATE DATABASE ${APP_DB_NAME} OWNER ${APP_DB_USER}"
fi

echo ">> Grants/default privileges on ${APP_DB_NAME}"
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "${APP_DB_NAME}" -c \
  "GRANT USAGE, CREATE ON SCHEMA public TO ${APP_DB_USER}"
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "${APP_DB_NAME}" -c \
  "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${APP_DB_USER}"
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "${APP_DB_NAME}" -c \
  "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, UPDATE ON SEQUENCES TO ${APP_DB_USER}"

echo ">> Init done."
