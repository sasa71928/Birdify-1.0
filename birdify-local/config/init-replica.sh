#!/bin/bash
until pg_isready -h db-primary -p 5432 -U postgres; do
  echo "Esperando al primary..."
  sleep 2
done

if [ -s "$PGDATA/PG_VERSION" ]; then
  echo "Réplica ya inicializada"
  exit 0
fi

rm -rf "$PGDATA"/*

PGPASSWORD=replica123 pg_basebackup \
  -h db-primary \
  -p 5432 \
  -U replicator \
  -D "$PGDATA" \
  -Xs -R -P \
  --slot=${SLOT_NAME}

# Sin chown, ya somos postgres
chmod 700 "$PGDATA"

exec postgres \
  -D "$PGDATA" \
  -c config_file=/etc/postgresql/postgresql.conf \
  -c hba_file=/etc/postgresql/pg_hba.conf