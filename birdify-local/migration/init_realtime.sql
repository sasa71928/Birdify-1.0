-- ============================================================
-- Inicialización del schema _realtime para Supabase Realtime
-- Requerido por supabase/realtime:v2.25.50+ (multi-tenant)
-- ============================================================

-- 1. Crear el schema _realtime
CREATE SCHEMA IF NOT EXISTS _realtime;

-- 2. Crear la tabla tenants
CREATE TABLE IF NOT EXISTS _realtime.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text,
    external_id text UNIQUE NOT NULL,
    jwt_secret text NOT NULL,
    postgres_cdc_default text DEFAULT 'postgres_cdc_rls',
    max_concurrent_users integer DEFAULT 200 NOT NULL,
    max_events_per_second integer DEFAULT 100 NOT NULL,
    max_bytes_per_second integer DEFAULT 100000 NOT NULL,
    max_channels_per_client integer DEFAULT 100 NOT NULL,
    max_joins_per_second integer DEFAULT 100 NOT NULL,
    suspend boolean DEFAULT false,
    inserted_at timestamp(0) without time zone NOT NULL DEFAULT now(),
    updated_at timestamp(0) without time zone NOT NULL DEFAULT now()
);

-- 3. Crear la tabla extensions
CREATE TABLE IF NOT EXISTS _realtime.extensions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    type text NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb,
    tenant_external_id text NOT NULL REFERENCES _realtime.tenants(external_id) ON DELETE CASCADE,
    inserted_at timestamp(0) without time zone NOT NULL DEFAULT now(),
    updated_at timestamp(0) without time zone NOT NULL DEFAULT now()
);

-- 4. Crear la tabla schema_migrations de Realtime
CREATE TABLE IF NOT EXISTS _realtime.schema_migrations (
    version bigint NOT NULL PRIMARY KEY,
    inserted_at timestamp(0) without time zone
);

-- 5. Insertar las migraciones conocidas para que Realtime no intente re-ejecutar
INSERT INTO _realtime.schema_migrations (version, inserted_at)
VALUES
    (20211116024918, now()),
    (20211116045059, now()),
    (20211116050929, now()),
    (20211116051442, now()),
    (20211116212300, now()),
    (20211116213355, now()),
    (20211116213934, now()),
    (20211116214523, now()),
    (20211122062447, now()),
    (20211124070109, now()),
    (20211202204204, now()),
    (20211202204605, now()),
    (20211210212804, now()),
    (20211228014915, now()),
    (20220107185739, now()),
    (20220228202821, now()),
    (20220312004840, now()),
    (20220603231003, now()),
    (20220603232444, now()),
    (20220615214548, now()),
    (20220712093339, now()),
    (20220908172859, now()),
    (20220916233421, now()),
    (20230119133233, now()),
    (20230128025114, now()),
    (20230128025212, now()),
    (20230227211149, now()),
    (20230228184745, now()),
    (20230308225145, now()),
    (20230328144023, now())
ON CONFLICT (version) DO NOTHING;

-- 6. Registrar este servidor como tenant "realtime"
--    El external_id DEBE coincidir con FLY_APP_NAME del docker-compose
--    El jwt_secret DEBE coincidir con API_JWT_SECRET del docker-compose
INSERT INTO _realtime.tenants (name, external_id, jwt_secret)
VALUES (
    'realtime-dev',
    'realtime',
    'KfJEyOYauucYvBV8PlETRISqhn44DR+L'
)
ON CONFLICT (external_id) DO UPDATE
SET jwt_secret = EXCLUDED.jwt_secret,
    updated_at = now();

-- 7. Registrar la extensión postgres_cdc_rls para el tenant
--    IMPORTANTE: Los valores de db_host, db_port, db_name, db_user, db_password
--    DEBEN estar cifrados con AES-128-ECB usando DB_ENC_KEY y codificados en Base64.
--    DB_ENC_KEY = 'supabaserealtime' (16 bytes)
--    También el campo debe ser 'publication' (singular), NO 'publications'.
INSERT INTO _realtime.extensions (type, settings, tenant_external_id)
VALUES (
    'postgres_cdc_rls',
    jsonb_build_object(
        'db_host', 'VJb6856PDY9tokEekxQd/w==',
        'db_port', '+enMDFi1J/3IrrquHHwUmA==',
        'db_name', 'sWBpZNdjggEPTQVlI52Zfw==',
        'db_user', 'sWBpZNdjggEPTQVlI52Zfw==',
        'db_password', 'sWBpZNdjggEPTQVlI52Zfw==',
        'region', 'us-east-1',
        'publication', 'supabase_realtime',
        'poll_interval_ms', 100,
        'poll_max_record_bytes', 1048576,
        'slot_name', 'supabase_realtime_rls',
        'ssl_enforced', false
    ),
    'realtime'
)
ON CONFLICT DO NOTHING;

-- 8. Dar permisos al usuario postgres sobre el schema _realtime
GRANT ALL ON SCHEMA _realtime TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA _realtime TO postgres;
