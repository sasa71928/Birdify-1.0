#!/bin/bash
set -e

# Asegurar que el directorio de datos pertenezca a postgres
chown -R postgres:postgres "$PGDATA"

# Esperar a que el primary esté listo
until pg_isready -h db-primary -p 5432 -U postgres; do
  echo "Esperando al primary..."
  sleep 2
done

# Si ya está inicializada, arrancar directamente
if [ -s "$PGDATA/PG_VERSION" ]; then
  echo "Réplica ya inicializada, arrancando..."
  exec gosu postgres postgres \
    -D "$PGDATA" \
    -c config_file=/etc/postgresql/postgresql.conf \
    -c hba_file=/etc/postgresql/pg_hba.conf
fi

# Limpiar directorio de datos
rm -rf "$PGDATA"/*

# Hacer base backup como usuario postgres
echo "Iniciando pg_basebackup..."
gosu postgres bash -c "PGPASSWORD=replica123 pg_basebackup \
  -h db-primary \
  -p 5432 \
  -U replicator \
  -D \"$PGDATA\" \
  -Xs -R -P \
  --slot=${SLOT_NAME}"

# Asegurar permisos correctos
chown -R postgres:postgres "$PGDATA"
chmod 700 "$PGDATA"

# Arrancar postgres como usuario postgres
exec gosu postgres postgres \
  -D "$PGDATA" \
  -c config_file=/etc/postgresql/postgresql.conf \
  -c hba_file=/etc/postgresql/pg_hba.conf