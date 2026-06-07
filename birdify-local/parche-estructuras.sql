-- 1. Esquemas Base e indispensables de funciones de Supabase
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS extensions;

-- Crear la función de la que dependen tus políticas (schema.sql)
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
    SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ LANGUAGE sql STABLE;

-- 2. Tabla auth.users Completa
CREATE TABLE IF NOT EXISTS auth.users (
    id uuid PRIMARY KEY,
    instance_id uuid,
    aud varchar(255),
    role varchar(255),
    email varchar(255),
    encrypted_password varchar(255),
    email_confirmed_at timestamptz,
    invited_at timestamptz,
    confirmation_token varchar(255),
    confirmation_sent_at timestamptz,
    recovery_token varchar(255),
    recovery_sent_at timestamptz,
    email_change_token_new varchar(255),
    email_change_token_current varchar(255),
    email_change_sent_at timestamptz,
    last_sign_in_at timestamptz,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin bool,
    created_at timestamptz,
    updated_at timestamptz,
    phone varchar(255),
    phone_confirmed_at timestamptz,
    phone_change_token varchar(255),
    phone_change_sent_at timestamptz,
    confirmed_at timestamptz,
    email_change varchar(255),
    password_change_token varchar(255),
    banned_until timestamptz,
    reauthentication_token varchar(255),
    reauthentication_sent_at timestamptz,
    is_sso_user bool NOT NULL DEFAULT false,
    deleted_at timestamptz,
    is_anonymous bool DEFAULT false,
    phone_change varchar(255) -- Columna faltante en Cloud
);

-- 3. Tabla auth.identities Completa
CREATE TABLE IF NOT EXISTS auth.identities (
    id varchar(255) NOT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz,
    email text,
    provider_id text NOT NULL, -- Columna faltante en Cloud
    PRIMARY KEY (provider, id)
);

-- 4. Tabla auth.sessions Completa
CREATE TABLE IF NOT EXISTS auth.sessions (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz,
    updated_at timestamptz,
    factor_id uuid,
    not_visible bool DEFAULT false,
    aal text -- Columna de nivel de seguridad faltante
);

-- 5. Otras tablas de Auth secundarias
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id bigserial PRIMARY KEY,
    instance_id uuid,
    token varchar(255),
    token_hash varchar(255),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    revoked bool,
    created_at timestamptz,
    updated_at timestamptz,
    parent varchar(255),
    session_id uuid REFERENCES auth.sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth.mfa_amr_claims (
    id uuid PRIMARY KEY,
    session_id uuid NOT NULL REFERENCES auth.sessions(id) ON DELETE CASCADE,
    created_at timestamptz,
    updated_at timestamptz,
    authentication_method text NOT NULL
);

-- 6. Tablas indispensables para Supabase Storage con soporte moderno de Cloud
CREATE TABLE IF NOT EXISTS storage.buckets (
    id text PRIMARY KEY,
    name text NOT NULL,
    owner uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    public boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    gallery_layout text,
    avif_autodetection boolean DEFAULT false -- Columna faltante en Cloud
);

CREATE TABLE IF NOT EXISTS storage.objects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_id text REFERENCES storage.buckets(id),
    name text,
    owner uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    last_accessed_at timestamptz DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text -- Columna faltante en Cloud
);