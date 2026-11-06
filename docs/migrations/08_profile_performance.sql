-- ============================================================================
-- Migración 08: Optimización de Rendimiento y Consultas SQL en Perfil
-- ============================================================================
-- Resuelve:
--   - Unificación de la carga de cabecera de perfil en una sola llamada RPC
--     (get_profile_summary) en lugar de 5 consultas secuenciales desde el cliente.
--   - Respeto estricto de políticas RLS, bloqueos y privacidad mediante
--     SECURITY INVOKER y public.can_view_user_content().
--   - Índices compuestos para conteos de seguidores, avistamientos por usuario
--     y reacciones paginadas en la pestaña Likes.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. ÍNDICES DE RENDIMIENTO PARA PERFIL, FOLLOWS Y LIKES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_follows_following_id
  ON public.follows (following_id);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id
  ON public.follows (follower_id);

CREATE INDEX IF NOT EXISTS idx_sightings_user_created_at
  ON public.sightings (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reactions_user_created_at
  ON public.reactions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reactions_sighting_id
  ON public.reactions (sighting_id);

-- ----------------------------------------------------------------------------
-- 2. RPC get_profile_summary (SECURITY INVOKER: respeta RLS y permisos)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_profile_summary(p_target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_user record;
  v_followers_count bigint := 0;
  v_following_count bigint := 0;
  v_is_following boolean := false;
  v_can_view_content boolean := false;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado.' USING ERRCODE = '42501';
  END IF;

  IF p_target_user_id IS NULL THEN
    RAISE EXCEPTION 'El identificador de perfil es obligatorio.' USING ERRCODE = '22023';
  END IF;

  -- Consulta las columnas públicas autorizadas; al ser SECURITY INVOKER se aplica
  -- automáticamente la política RLS users_select_authenticated (incluyendo is_blocked).
  SELECT
    u.id,
    u.username,
    u.fullname,
    u.bio,
    u.profile_pic_url,
    u.is_private,
    u.is_verified,
    u.user_level,
    u.created_at
  INTO v_user
  FROM public.users u
  WHERE u.id = p_target_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'profile', NULL,
      'followers_count', 0,
      'following_count', 0,
      'is_following', false,
      'can_view_content', false
    );
  END IF;

  SELECT count(*)::bigint
  INTO v_followers_count
  FROM public.follows f
  WHERE f.following_id = p_target_user_id;

  SELECT count(*)::bigint
  INTO v_following_count
  FROM public.follows f
  WHERE f.follower_id = p_target_user_id;

  IF v_uid <> p_target_user_id THEN
    v_is_following := EXISTS (
      SELECT 1
      FROM public.follows f
      WHERE f.follower_id = v_uid
        AND f.following_id = p_target_user_id
    );
  END IF;

  v_can_view_content := public.can_view_user_content(p_target_user_id);

  RETURN jsonb_build_object(
    'profile', jsonb_build_object(
      'id', v_user.id,
      'username', v_user.username,
      'fullname', v_user.fullname,
      'bio', v_user.bio,
      'profile_pic_url', v_user.profile_pic_url,
      'is_private', COALESCE(v_user.is_private, false),
      'is_verified', COALESCE(v_user.is_verified, false),
      'user_level', COALESCE(v_user.user_level, 'general'),
      'created_at', v_user.created_at
    ),
    'followers_count', COALESCE(v_followers_count, 0),
    'following_count', COALESCE(v_following_count, 0),
    'is_following', COALESCE(v_is_following, false),
    'can_view_content', COALESCE(v_can_view_content, false)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_profile_summary(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_profile_summary(uuid) TO authenticated;

COMMIT;

