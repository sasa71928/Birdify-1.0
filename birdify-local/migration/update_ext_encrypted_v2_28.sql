UPDATE _realtime.extensions SET settings = jsonb_build_object(
  'db_host', 'VJb6856PDY9tokEekxQd/w==',
  'db_port', '+enMDFi1J/3IrrquHHwUmA==',
  'db_name', 'sWBpZNdjggEPTQVlI52Zfw==',
  'db_user', 'sWBpZNdjggEPTQVlI52Zfw==',
  'db_password', 'sWBpZNdjggEPTQVlI52Zfw==',
  'region', 'oeny8A7u7c0jI0Rm3Aem/w==',
  'poll_interval_ms', 100,
  'poll_max_record_bytes', 1048576,
  'slot_name', 'tL6LFoCnL9MF3O847Xyuga8eLlrhnsBEMPotRDKLEXA=',
  'publications', '["supabase_realtime"]'::jsonb,
  'ssl_enforced', false
) WHERE tenant_external_id = 'realtime';
