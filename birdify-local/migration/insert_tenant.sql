INSERT INTO _realtime.tenants (name, external_id, jwt_secret)
VALUES (
    'realtime-dev',
    'realtime',
    'KfJEyOYauucYvBV8PlETRISqhn44DR+L'
)
ON CONFLICT (external_id) DO UPDATE
SET jwt_secret = EXCLUDED.jwt_secret,
    updated_at = now();

INSERT INTO _realtime.extensions (type, settings, tenant_external_id)
VALUES (
    'postgres_cdc_rls',
    jsonb_build_object(
        'db_host', 'db-primary',
        'db_port', 5432,
        'db_name', 'postgres',
        'db_user', 'postgres',
        'db_password', 'postgres',
        'region', 'us-east-1',
        'poll_interval_ms', 100,
        'poll_max_record_bytes', 1048576,
        'slot_name', 'supabase_realtime_rls',
        'publications', '["supabase_realtime"]'::jsonb,
        'ssl_enforced', false
    ),
    'realtime'
)
ON CONFLICT DO NOTHING;
