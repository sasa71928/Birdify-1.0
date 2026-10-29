-- ============================================================================
-- Migración 01: Triggers de Notificaciones Push con pg_net
-- ============================================================================
-- Este script traslada el envío de notificaciones push de Expo desde la app móvil
-- hacia triggers en Supabase Cloud. De esta forma, el token de acceso de Expo NUNCA
-- se expone en la aplicación cliente ni en el bundle compilado (APK/AAB).
-- ============================================================================

-- 1. Habilitar extensión pg_net (cliente HTTP asíncrono en Postgres)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA net;

-- 2. Tabla interna de secretos de servidor (solo accesible por postgres/service_role)
CREATE TABLE IF NOT EXISTS public.server_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.server_secrets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.server_secrets FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE public.server_secrets IS 'Almacén seguro de tokens de servidor. Configurar: INSERT INTO public.server_secrets (key, value) VALUES (''EXPO_ACCESS_TOKEN'', ''tu_token_aqui'') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;';

-- 3. Función interna para despachar push a través de Expo Push API
CREATE OR REPLACE FUNCTION public.send_expo_push_notifications(
  p_tokens text[],
  p_title text,
  p_body text,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, pg_temp
AS $$
DECLARE
  v_expo_token text;
  v_messages jsonb := '[]'::jsonb;
  v_token text;
BEGIN
  SELECT value INTO v_expo_token FROM public.server_secrets WHERE key = 'EXPO_ACCESS_TOKEN' LIMIT 1;
  IF v_expo_token IS NULL OR v_expo_token = '' THEN
    RAISE LOG '[send_expo_push_notifications] EXPO_ACCESS_TOKEN no configurado en public.server_secrets.';
    RETURN;
  END IF;

  FOREACH v_token IN ARRAY p_tokens LOOP
    IF v_token IS NOT NULL AND v_token != '' THEN
      v_messages := v_messages || jsonb_build_object(
        'to', v_token,
        'sound', 'default',
        'title', p_title,
        'body', p_body,
        'data', p_data
      );
    END IF;
  END LOOP;

  IF jsonb_array_length(v_messages) > 0 THEN
    PERFORM net.http_post(
      url := 'https://exp.host/--/api/v2/push/send',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Accept', 'application/json',
        'Authorization', 'Bearer ' || v_expo_token
      ),
      body := v_messages
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[send_expo_push_notifications] Error enviando push: %', SQLERRM;
END;
$$;

-- Revocar ejecución pública: solo triggers internos (postgres) pueden invocarla
REVOKE ALL ON FUNCTION public.send_expo_push_notifications(text[], text, text, jsonb)
  FROM PUBLIC, anon, authenticated;

-- 4. Trigger al insertar mensaje de chat (notificar a los demás miembros no bloqueados)
CREATE OR REPLACE FUNCTION public.trg_push_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_recipient_tokens text[];
  v_body text;
  v_sender_name text;
BEGIN
  SELECT COALESCE(fullname, username, 'Alguien') INTO v_sender_name
  FROM public.users WHERE id = NEW.sender_id;

  SELECT array_agg(u.expo_push_token) INTO v_recipient_tokens
  FROM public.conversation_members cm
  JOIN public.users u ON u.id = cm.user_id
  WHERE cm.conversation_id = NEW.conversation_id
    AND cm.user_id != NEW.sender_id
    AND NOT public.is_blocked(NEW.sender_id, cm.user_id)
    AND u.expo_push_token IS NOT NULL
    AND u.expo_push_token != ''
    AND (
      u.push_notifications IS NULL
      OR u.push_notifications = '{}'::jsonb
      OR u.push_notifications = '[]'::jsonb
      OR (
        jsonb_typeof(u.push_notifications) = 'array'
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(u.push_notifications) elem
          WHERE elem->>'id' = '4' AND (elem->>'active')::boolean = true
        )
      )
    );

  IF v_recipient_tokens IS NOT NULL AND array_length(v_recipient_tokens, 1) > 0 THEN
    v_body := CASE
      WHEN NEW.content IS NOT NULL AND length(NEW.content) > 0 THEN
        left(NEW.content, 80)
      ELSE 'Te envió una foto'
    END;

    PERFORM public.send_expo_push_notifications(
      v_recipient_tokens,
      COALESCE(v_sender_name, 'Nuevo mensaje'),
      v_body,
      jsonb_build_object('type', 'direct_message', 'conversationId', NEW.conversation_id)
    );
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.trg_push_on_message() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_message_created_push ON public.messages;
CREATE TRIGGER on_message_created_push
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_push_on_message();

-- 5. Trigger al insertar comentario (notificar al dueño del avistamiento)
CREATE OR REPLACE FUNCTION public.trg_push_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_sighting_owner_id uuid;
  v_owner_token text;
  v_commenter_name text;
  v_is_enabled boolean := true;
BEGIN
  SELECT user_id INTO v_sighting_owner_id FROM public.sightings WHERE id = NEW.sighting_id;

  IF v_sighting_owner_id IS NULL
     OR v_sighting_owner_id = NEW.user_id
     OR public.is_blocked(v_sighting_owner_id, NEW.user_id) THEN
    RETURN NEW;
  END IF;

  SELECT expo_push_token,
         CASE
           WHEN push_notifications IS NULL OR jsonb_typeof(push_notifications) <> 'array' OR jsonb_array_length(push_notifications) = 0 THEN true
           ELSE COALESCE(
             (SELECT (elem->>'active')::boolean
              FROM jsonb_array_elements(push_notifications) elem
              WHERE elem->>'id' = '2'
              LIMIT 1),
             true
           )
         END
  INTO v_owner_token, v_is_enabled
  FROM public.users WHERE id = v_sighting_owner_id;

  IF v_owner_token IS NOT NULL AND v_owner_token != '' AND v_is_enabled = true THEN
    SELECT COALESCE(username, 'Un usuario') INTO v_commenter_name
    FROM public.users WHERE id = NEW.user_id;

    PERFORM public.send_expo_push_notifications(
      ARRAY[v_owner_token],
      'Nuevo comentario en tu avistamiento',
      v_commenter_name || ': ' || left(NEW.content, 60),
      jsonb_build_object('type', 'new_comment', 'sightingId', NEW.sighting_id)
    );
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.trg_push_on_comment() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_comment_created_push ON public.comments;
CREATE TRIGGER on_comment_created_push
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_push_on_comment();

-- 6. Trigger al insertar avistamiento (respetando perfiles privados y bloqueos)
CREATE OR REPLACE FUNCTION public.trg_push_on_sighting()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_follower_tokens text[];
  v_author_name text;
  v_author_is_private boolean := false;
BEGIN
  SELECT COALESCE(fullname, username, 'Alguien'), COALESCE(is_private, false)
  INTO v_author_name, v_author_is_private
  FROM public.users WHERE id = NEW.user_id;

  SELECT array_agg(u.expo_push_token) INTO v_follower_tokens
  FROM public.follows f
  JOIN public.users u ON u.id = f.follower_id
  WHERE f.following_id = NEW.user_id
    AND NOT public.is_blocked(NEW.user_id, f.follower_id)
    AND (
      v_author_is_private = false
      OR EXISTS (
        SELECT 1 FROM public.follows mf
        WHERE mf.follower_id = NEW.user_id
          AND mf.following_id = f.follower_id
      )
    )
    AND u.expo_push_token IS NOT NULL
    AND u.expo_push_token != ''
    AND (
      u.push_notifications IS NULL
      OR u.push_notifications = '{}'::jsonb
      OR u.push_notifications = '[]'::jsonb
      OR (
        jsonb_typeof(u.push_notifications) = 'array'
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(u.push_notifications) elem
          WHERE elem->>'id' = '1' AND (elem->>'active')::boolean = true
        )
      )
    );

  IF v_follower_tokens IS NOT NULL AND array_length(v_follower_tokens, 1) > 0 THEN
    PERFORM public.send_expo_push_notifications(
      v_follower_tokens,
      'Nuevo avistamiento',
      v_author_name || ' publicó un nuevo avistamiento',
      jsonb_build_object('type', 'new_sighting', 'sightingId', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.trg_push_on_sighting() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_sighting_created_push ON public.sightings;
CREATE TRIGGER on_sighting_created_push
  AFTER INSERT ON public.sightings
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_push_on_sighting();

-- 7. Trigger al seguir a un usuario (notificar al usuario seguido)
CREATE OR REPLACE FUNCTION public.trg_push_on_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_followed_token text;
  v_follower_name text;
  v_is_enabled boolean := true;
BEGIN
  IF public.is_blocked(NEW.following_id, NEW.follower_id) THEN
    RETURN NEW;
  END IF;

  SELECT expo_push_token,
         CASE
           WHEN push_notifications IS NULL OR jsonb_typeof(push_notifications) <> 'array' OR jsonb_array_length(push_notifications) = 0 THEN true
           ELSE COALESCE(
             (SELECT (elem->>'active')::boolean
              FROM jsonb_array_elements(push_notifications) elem
              WHERE elem->>'id' = '3'
              LIMIT 1),
             true
           )
         END
  INTO v_followed_token, v_is_enabled
  FROM public.users WHERE id = NEW.following_id;

  IF v_followed_token IS NOT NULL AND v_followed_token != '' AND v_is_enabled = true THEN
    SELECT COALESCE(fullname, username, 'Alguien') INTO v_follower_name
    FROM public.users WHERE id = NEW.follower_id;

    PERFORM public.send_expo_push_notifications(
      ARRAY[v_followed_token],
      'Nuevo seguidor',
      v_follower_name || ' empezó a seguirte',
      jsonb_build_object('type', 'new_follower', 'followerId', NEW.follower_id)
    );
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.trg_push_on_follow() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_follow_created_push ON public.follows;
CREATE TRIGGER on_follow_created_push
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_push_on_follow();
