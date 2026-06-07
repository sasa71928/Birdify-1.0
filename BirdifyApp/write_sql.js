const fs = require('fs');
const sql = `CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN INSERT INTO public.users (id, email, username, fullname, profile_pic_url) VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), COALESCE(NEW.raw_user_meta_data->>'fullname', ''), COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')); RETURN NEW; END; $$;`;
fs.writeFileSync('fix_trigger.sql', sql);
