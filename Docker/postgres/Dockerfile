FROM postgres:16-alpine

ENV POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=postgres

COPY init/ /docker-entrypoint-initdb.d/

EXPOSE 5432
