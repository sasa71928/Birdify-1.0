#!/bin/bash
export PGPASSWORD=postgres
PROMOTED=0

echo "Failover monitor is running. Waiting for initial startup..."
sleep 20

while true; do
  # Comprobar si db-primary está caído
  if ! pg_isready -h db-primary -U postgres -q; then
    echo "¡db-primary no responde!"
    
    # Si no lo hemos promovido todavía, lo promovemos
    if [ $PROMOTED -eq 0 ]; then
      echo "Promoviendo db-replica1 a nodo principal..."
      psql -h db-replica1 -U postgres -d postgres -c "SELECT pg_promote();"
      PROMOTED=1
      echo "db-replica1 ascendido exitosamente."
    fi
  else
    # Si el primario está vivo, nos aseguramos de resetear la bandera por si acabamos de iniciar
    # No auto-failback.
    PROMOTED=0
  fi
  sleep 5
done
