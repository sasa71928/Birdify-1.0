-- 1. Crear roles base
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN;
CREATE ROLE supabase_admin SUPERUSER LOGIN PASSWORD 'postgres';

-- 2. Crear roles administradores
CREATE ROLE authenticator LOGIN NOINHERIT PASSWORD 'postgres';
CREATE ROLE supabase_auth_admin LOGIN NOINHERIT CREATEROLE PASSWORD 'postgres';
CREATE ROLE supabase_storage_admin LOGIN NOINHERIT CREATEROLE PASSWORD 'postgres';

-- 3. Enlazar privilegios
GRANT anon, authenticated, service_role, supabase_admin TO authenticator;
GRANT anon, authenticated, service_role TO supabase_storage_admin;
GRANT ALL ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON SCHEMA public TO supabase_storage_admin;
GRANT ALL ON SCHEMA public TO authenticator;

-- 4. Crear los esquemas vacíos para que Auth y Storage construyan sobre ellos
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgjwt SCHEMA extensions;
CREATE SCHEMA auth AUTHORIZATION supabase_auth_admin;
CREATE SCHEMA storage AUTHORIZATION supabase_storage_admin;

-- 4b. Configurar search_path y permisos para Auth
ALTER ROLE supabase_auth_admin SET search_path TO auth, public, extensions;
GRANT USAGE ON SCHEMA extensions TO supabase_auth_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA extensions TO supabase_auth_admin;

-- 4c. Cast implícito uuid→text (requerido por GoTrue migrations)
CREATE CAST (uuid AS text) WITH INOUT AS IMPLICIT;

-- 5. Configurar Replicación y Realtime
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replica123';
SELECT pg_create_physical_replication_slot('slot_replica1');
SELECT pg_create_physical_replication_slot('slot_replica2');
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
ALTER ROLE supabase_admin WITH REPLICATION;