-- 1. Crear roles base
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN;
CREATE ROLE supabase_admin SUPERUSER NOLOGIN;

-- 2. Crear roles administradores
CREATE ROLE authenticator LOGIN NOINHERIT PASSWORD 'postgres';
CREATE ROLE supabase_auth_admin LOGIN NOINHERIT CREATEROLE PASSWORD 'postgres';
CREATE ROLE supabase_storage_admin LOGIN NOINHERIT CREATEROLE PASSWORD 'postgres';

-- 3. Enlazar privilegios
GRANT anon, authenticated, service_role, supabase_admin TO authenticator;
GRANT ALL ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON SCHEMA public TO supabase_storage_admin;
GRANT ALL ON SCHEMA public TO authenticator;

-- 4. Crear los esquemas vacíos para que Auth y Storage construyan sobre ellos
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE SCHEMA auth AUTHORIZATION supabase_auth_admin;
CREATE SCHEMA storage AUTHORIZATION supabase_storage_admin;

-- 5. Configurar Replicación y Realtime
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replica123';
SELECT pg_create_physical_replication_slot('slot_replica1');
SELECT pg_create_physical_replication_slot('slot_replica2');
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
ALTER ROLE supabase_admin WITH REPLICATION;