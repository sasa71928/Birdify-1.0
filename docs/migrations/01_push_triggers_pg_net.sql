-- ============================================================================
-- Migraci├│n 01: Triggers de Notificaciones Push con pg_net
-- ============================================================================
-- Este script traslada el env├¡o de notificaciones push de Expo desde la app m├│vil
-- hacia triggers en Supabase Cloud. De esta forma, el token de acceso de Expo NUNCA
-- se expone en la aplicaci├│n cliente ni en el bundle compilado (APK/AAB).
-- ============================================================================

-- 1. Habilitar extensi├│n pg_net (cliente HTTP as├¡ncrono en Postgres)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA net;

-- 2. Tabla interna de secretos de servidor (solo accesible por postgres/service_role)
CREATE TABLE IF NOT EXISTS public.server_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.server_secrets ENABLE ROW LEVEL SECURITY;
-- No definimos pol├¡ticas para 'anon' ni 'authenticated': ning├║n cliente puede leerla.

-- Comentario instructivo para el administrador:
COMMENT ON TABLE public.server_secrets IS 'Almac├®n seguro de tokens de servidor. Configurar: INSERT INTO public.server_secrets (key, value) VALUES (''EXPO_ACCESS_TOKEN'', ''tu_token_aqui'') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;';

-- 3. Funci├│n interna para despachar push a trav├®s de Expo Push API
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
  -- Obtener token de Expo
  SELECT value INTO v_expo_token FROM public.server_secrets WHERE key = 'EXPO_ACCESS_TOKEN' LIMIT 1;
  IF v_expo_token IS NULL OR v_expo_token = '' THEN
    -- Si no est├í configurado, no enviamos y salimos sin fallar la transacci├│n
    RAISE LOG '[send_expo_push_notifications] EXPO_ACCESS_TOKEN no configurado en public.server_secrets.';
    RETURN;
  END IF;

  -- Construir el batch de mensajes
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
    -- Llamada HTTP POST as├¡ncrona
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
  -- Evitar que una falla en red aborte la inserci├│n en base de datos
  RAISE WARNING '[send_expo_push_notifications] Error enviando push: %', SQLERRM;
END;
$$;

-- 4. Trigger al insertar mensaje de chat (notificar a los dem├ís miembros)
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
  -- Obtener nombre del remitente
  SELECT COALESCE(fullname, username, 'Alguien') INTO v_sender_name
  FROM public.users WHERE id = NEW.sender_id;

  -- Obtener tokens de miembros con push habilitado para direct_message
  SELECT array_agg(u.expo_push_token) INTO v_recipient_tokens
  FROM public.conversation_members cm
  JOIN public.users u ON u.id = cm.user_id
  WHERE cm.conversation_id = NEW.conversation_id
    AND cm.user_id != NEW.sender_id
    AND u.expo_push_token IS NOT NULL
    AND u.expo_push_token != ''
    -- Validar preferencia de push (direct_message es ID 4)
    AND (
      u.push_notifications IS NULL 
      OR u.push_notifications = '[]'::jsonb
      OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(u.push_notifications) elem
        WHERE elem->>'id' = '4' AND (elem->>'active')::boolean = true
      )
    );

  IF v_recipient_tokens IS NOT NULL AND array_length(v_recipient_tokens, 1) > 0 THEN
    v_body := CASE 
      WHEN NEW.content IS NOT NULL AND length(NEW.content) > 0 THEN 
        left(NEW.content, 80)
      ELSE 'Te envi├│ una foto' 
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

DROP TRIGGER IF EXISTS on_message_created_push ON public.messages;
CREATE TRIGGER on_message_created_push
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_push_on_message();

-- 5. Trigger al insertar comentario (notificar al due├▒o del avistamiento)
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
  -- Obtener due├▒o del sighting
  SELECT user_id INTO v_sighting_owner_id FROM public.sightings WHERE id = NEW.sighting_id;

  -- Si no existe o se comenta a s├¡ mismo, salir
  IF v_sighting_owner_id IS NULL OR v_sighting_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Obtener datos del due├▒o (token y preferencias)
  SELECT expo_push_token,
         COALESCE(
           (SELECT (elem->>'active')::boolean 
            FROM jsonb_array_elements(push_notifications) elem 
            WHERE elem->>'id' = '2'), 
           true
         )
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

DROP TRIGGER IF EXISTS on_comment_created_push ON public.comments;
CREATE TRIGGER on_comment_created_push
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_push_on_comment();

-- 6. Trigger al insertar avistamiento (notificar a los seguidores)
CREATE OR REPLACE FUNCTION public.trg_push_on_sighting()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_follower_tokens text[];
  v_author_name text;
BEGIN
  -- Obtener nombre del autor
  SELECT COALESCE(fullname, username, 'Alguien') INTO v_author_name
  FROM public.users WHERE id = NEW.user_id;

  -- Obtener tokens de seguidores con push habilitado para new_sighting (ID 1)
  SELECT array_agg(u.expo_push_token) INTO v_follower_tokens
  FROM public.follows f
  JOIN public.users u ON u.id = f.follower_id
  WHERE f.following_id = NEW.user_id
    AND u.expo_push_token IS NOT NULL
    AND u.expo_push_token != ''
    AND (
      u.push_notifications IS NULL
      OR u.push_notifications = '[]'::jsonb
      OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(u.push_notifications) elem
        WHERE elem->>'id' = '1' AND (elem->>'active')::boolean = true
      )
    );

  IF v_follower_tokens IS NOT NULL AND array_length(v_follower_tokens, 1) > 0 THEN
    PERFORM public.send_expo_push_notifications(
      v_follower_tokens,
      'Nuevo avistamiento',
      v_author_name || ' public├│ un nuevo avistamiento',
      jsonb_build_object('type', 'new_sighting', 'sightingId', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$;

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
  -- Obtener datos del usuario seguido
  SELECT expo_push_token,
         COALESCE(
           (SELECT (elem->>'active')::boolean 
            FROM jsonb_array_elements(push_notifications) elem 
            WHERE elem->>'id' = '3'), 
           true
         )
  INTO v_followed_token, v_is_enabled
  FROM public.users WHERE id = NEW.following_id;

  IF v_followed_token IS NOT NULL AND v_followed_token != '' AND v_is_enabled = true THEN
    SELECT COALESCE(fullname, username, 'Alguien') INTO v_follower_name
    FROM public.users WHERE id = NEW.follower_id;

    PERFORM public.send_expo_push_notifications(
      ARRAY[v_followed_token],
      'Nuevo seguidor',
      v_follower_name || ' empez├│ a seguirte',
      jsonb_build_object('type', 'new_follower', 'followerId', NEW.follower_id)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_follow_created_push ON public.follows;
CREATE TRIGGER on_follow_created_push
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_push_on_follow();

