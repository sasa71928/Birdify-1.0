UPDATE _realtime.extensions SET settings = jsonb_build_object(
  'db_host', 'db-primary',
  'db_port', '5432',
  'db_name', 'postgres',
  'db_user', 'postgres',
  'db_password', 'postgres',
  'region', 'us-east-1',
  'poll_interval_ms', 100,
  'poll_max_record_bytes', 1048576,
  'slot_name', 'supabase_realtime_rls',
  'ssl_enforced', false
) WHERE tenant_external_id = 'realtime';
