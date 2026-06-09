# Guía de Instalación y Ejecución Local de Supabase (Birdify)

Esta guía documenta los pasos necesarios para desplegar, configurar e inicializar la infraestructura local de Supabase para el proyecto **Birdify**. Todo el entorno corre bajo contenedores de Docker mediante Docker Compose.

---

## 1. Requisitos Previos

1. **Docker y Docker Compose** instalados en tu equipo (ej. Docker Desktop para Windows/Mac).
2. **Git Bash, WSL (Windows Subsystem for Linux) o PowerShell** para ejecutar comandos en la terminal.
3. **Node.js y npm** (si vas a correr la aplicación de Expo en local).

---

## 2. Configuración Inicial

### Variables de Entorno
1. Entra a la carpeta `birdify-local` de tu proyecto.
2. Abre el archivo `.env`.
3. Busca la variable `TU_IP_LOCAL`. Debes asignarle la IP local de tu computadora en la red (por ejemplo, `192.168.1.100`). **No uses localhost si vas a conectarte desde tu celular o el emulador.**
   ```env
   TU_IP_LOCAL=192.168.1.100
   ```
4. Asegúrate de que el `.env` de tu **aplicación Expo** (`BirdifyApp/.env`) también apunte a esta misma IP:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=http://192.168.1.100:8000
   ```

### Permisos y Saltos de Línea (Solo Windows)
Asegúrate de que los archivos dentro de la carpeta `config/` (especialmente `.sh`) tengan saltos de línea LF (Linux) en lugar de CRLF (Windows), de lo contrario fallarán al iniciar. Esto ya se configuró, pero tenlo en cuenta en caso de que modifiques los scripts.

---

## 3. Levantar los Contenedores

Abre tu terminal dentro de la carpeta `birdify-local` y ejecuta el siguiente comando para levantar toda la arquitectura en segundo plano:

```bash
docker compose up -d
```

> **Nota:** La primera vez tomará varios minutos mientras descarga las imágenes de Postgres, Kong, GoTrue, Realtime, Storage, etc.

Una vez finalizado, puedes revisar que los servicios estén corriendo usando:
```bash
docker ps
```

Deberías ver corriendo contenedores como `db-primary`, `db-proxy`, `supabase-auth`, `supabase-realtime`, `supabase-storage`, `supabase-kong`, entre otros.

---

## 4. Inicializar la Base de Datos y las Migraciones

Si es la **primera vez** que levantas los contenedores con volúmenes limpios, el script de inicialización de la base de datos se encarga de correr las migraciones automáticamente de manera interna. 

Sin embargo, si necesitas **re-ejecutar manualmente las migraciones** (por ejemplo, si borraste tablas o actualizaste el esquema), sigue estos pasos:

### Opción A: Ejecutar todas las migraciones de golpe
La base de datos tiene un archivo maestro (`run-migrations.sql`) que manda llamar a todos los scripts necesarios. Ejecútalo con el siguiente comando:

```bash
docker exec -i db-primary psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/03-run-migrations.sql
```
*Este comando instalará el esquema (tablas), los datos semilla (usuarios base), la configuración encriptada de Realtime y las políticas de Storage en el orden correcto.*

### Opción B: Ejecutar migraciones individuales paso a paso
Si deseas ejecutar cada script manualmente por separado, puedes hacerlo usando el siguiente orden en la consola:

**1. Tablas y Esquemas Base:**
```bash
docker exec -i db-primary psql -U postgres -d postgres -f /migration/schema.sql
```

**2. Datos de Prueba (Usuarios base y Aves):**
```bash
docker exec -i db-primary psql -U postgres -d postgres -f /migration/data.sql
```

**3. Inicializar Configuración del Realtime (Secretos Encriptados):**
```bash
docker exec -i db-primary psql -U postgres -d postgres -f /migration/init_realtime.sql
```
*(Luego de ejecutar este paso, es recomendable reiniciar Realtime para que lea los secretos nuevos)*:
```bash
docker restart supabase-realtime
```

**4. Crear Buckets de Almacenamiento:**
```bash
docker exec -i db-primary psql -U postgres -d postgres -f /migration/storage_buckets.sql
```

**5. Aplicar Políticas de Seguridad de Storage (Row Level Security):**
```bash
docker exec -i db-primary psql -U postgres -d postgres -f /migration/storage_permissions.sql
```

---

## 5. Accesos Útiles

- **API Gateway (Kong):** `http://<TU_IP_LOCAL>:8000`
- **Base de Datos Principal:** `postgres://postgres:tu_password_aqui@<TU_IP_LOCAL>:5432/postgres`
- **Studio (Interfaz Web de Administración):** `http://<TU_IP_LOCAL>:3000`
- **Inbucket (Bandeja de correos falsos para validaciones):** `http://<TU_IP_LOCAL>:9000`

---

## 6. Limpiar y Reiniciar desde Cero

Si algo se corrompe irremediablemente y deseas destruir todo y volver a iniciar de cero (borrando bases de datos, usuarios e imágenes subidas), ejecuta:

```bash
# Apaga y borra los contenedores, así como los volúmenes (base de datos)
docker compose down -v

# Levanta todo de nuevo
docker compose up -d
```

---

## 7. Confirmar Correos Electrónicos Manualmente

Al crear un nuevo usuario desde la aplicación, Supabase exige la confirmación del correo electrónico de forma predeterminada para que el usuario pueda iniciar sesión. Tienes dos maneras sencillas de hacerlo en local:

### Opción A: Usando Inbucket (Sin código)
La arquitectura local incluye una bandeja de correo falsa llamada **Inbucket** que atrapa y almacena todos los correos enviados por tu servidor local, así no necesitas configurar servidores SMTP reales.
1. Abre tu navegador y ve a `http://<TU_IP_LOCAL>:9000`.
2. Busca en la lista el correo de confirmación enviado por Supabase.
3. Abre el correo y haz clic en el botón o enlace de **"Confirm your email"**.

### Opción B: Mediante Comando SQL (Para forzar validaciones)
Si prefieres saltarte el correo y verificarlo directamente a nivel base de datos, puedes inyectar la fecha de confirmación (`email_confirmed_at`) directamente en la tabla `auth.users` ejecutando este comando en tu terminal (reemplaza `correo@ejemplo.com` por el correo del usuario):

```bash
docker exec -i db-primary psql -U postgres -d postgres -c "UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'correo@ejemplo.com';"
```
Si deseas confirmar a **todos** los usuarios pendientes de un solo golpe, omite el `WHERE`:
```bash
docker exec -i db-primary psql -U postgres -d postgres -c "UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;"
```
