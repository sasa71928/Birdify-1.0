-- ============================================================================
-- Birdify · Trigger de creación de perfil compatible con Google / Facebook
-- Ejecutar en Supabase Dashboard → SQL Editor (una sola vez).
--
-- Mejoras respecto a fix_trigger.sql:
--   * Lee metadatos de OAuth (full_name / name, avatar_url / picture).
--   * Genera un username único (evita "Database error saving new user" cuando
--     dos cuentas comparten prefijo de email, p.ej. juan@gmail.com y juan@outlook.com).
--   * Si el email ya existía en public.users, no rompe el alta.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta          jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  base_username text;
  final_username text;
  attempt       int := 0;
BEGIN
  base_username := lower(regexp_replace(
    COALESCE(meta->>'username', split_part(COALESCE(NEW.email, ''), '@', 1)),
    '[^a-zA-Z0-9_]', '', 'g'
  ));
  IF base_username IS NULL OR base_username = '' THEN
    base_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;

  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.users WHERE lower(username) = final_username) LOOP
    attempt := attempt + 1;
    final_username := left(base_username, 20) || '_' || substr(md5(NEW.id::text || attempt), 1, 5);
  END LOOP;

  INSERT INTO public.users (id, email, username, fullname, profile_pic_url)
  VALUES (
    NEW.id,
    NEW.email,
    final_username,
    COALESCE(meta->>'fullname', meta->>'full_name', meta->>'name', ''),
    COALESCE(meta->>'profile_pic_url', meta->>'avatar_url', meta->>'picture',
             'https://gravatar.com/avatar/?d=mp')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN unique_violation THEN
  -- p.ej. email ya existente en public.users: la app (AuthContext) sincroniza el perfil después
  RETURN NEW;
END;
$$;

-- Asegura que el trigger existe sobre auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
