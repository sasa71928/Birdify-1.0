


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."append_deleted_for"("message_id" "uuid", "user_id_to_add" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE messages
  SET deleted_for = array_append(deleted_for, user_id_to_add)
  WHERE id = message_id
    AND NOT (deleted_for @> ARRAY[user_id_to_add]);
END;
$$;


ALTER FUNCTION "public"."append_deleted_for"("message_id" "uuid", "user_id_to_add" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_group_conversation"("creator_id" "uuid", "group_name" "text", "group_description" "text", "member_ids" "uuid"[], "group_avatar" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  conv_id UUID;
  member  UUID;
BEGIN
  INSERT INTO conversations (name, description, is_group, created_by, avatar_url)
  VALUES (group_name, group_description, TRUE, creator_id, group_avatar)
  RETURNING id INTO conv_id;

  INSERT INTO conversation_members (conversation_id, user_id, role)
  VALUES (conv_id, creator_id, 'admin');

  FOREACH member IN ARRAY member_ids LOOP
    IF member <> creator_id THEN
      INSERT INTO conversation_members (conversation_id, user_id, role)
      VALUES (conv_id, member, 'member');
    END IF;
  END LOOP;

  RETURN conv_id;
END;
$$;


ALTER FUNCTION "public"."create_group_conversation"("creator_id" "uuid", "group_name" "text", "group_description" "text", "member_ids" "uuid"[], "group_avatar" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;


ALTER FUNCTION "public"."delete_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_batch_conversation_member_states"("p_user_id" "uuid", "p_conversation_ids" "uuid"[]) RETURNS TABLE("conversation_id" "uuid", "last_read_message_id" "uuid", "visible_message_id" "uuid")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cms.conversation_id,
    cms.last_read_message_id,
    cms.visible_message_id
  FROM conversation_member_states cms
  WHERE cms.user_id = p_user_id
    AND cms.conversation_id = ANY(p_conversation_ids);
END;
$$;


ALTER FUNCTION "public"."get_batch_conversation_member_states"("p_user_id" "uuid", "p_conversation_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_conversation_ids"() RETURNS SETOF "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT conversation_id
  FROM public.conversation_members
  WHERE user_id = auth.uid();
$$;


ALTER FUNCTION "public"."get_my_conversation_ids"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_conversation_ids"("uid" "uuid") RETURNS SETOF "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT conversation_id
  FROM conversation_members
  WHERE user_id = uid;
$$;


ALTER FUNCTION "public"."get_my_conversation_ids"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_or_create_direct_conversation"("user_a" "uuid", "user_b" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  conv_id UUID;
BEGIN
  SELECT cm1.conversation_id INTO conv_id
  FROM conversation_members cm1
  INNER JOIN conversation_members cm2
    ON cm1.conversation_id = cm2.conversation_id
  INNER JOIN conversations c
    ON c.id = cm1.conversation_id
  WHERE cm1.user_id = user_a
    AND cm2.user_id = user_b
    AND c.is_group = FALSE
  LIMIT 1;

  IF conv_id IS NOT NULL THEN
    RETURN conv_id;
  END IF;

  INSERT INTO conversations (is_group)
  VALUES (FALSE)
  RETURNING id INTO conv_id;

  INSERT INTO conversation_members (conversation_id, user_id)
  VALUES (conv_id, user_a), (conv_id, user_b);

  RETURN conv_id;
END;
$$;


ALTER FUNCTION "public"."get_or_create_direct_conversation"("user_a" "uuid", "user_b" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_delete_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  delete from public.users where id = old.id;
  return old;
end;
$$;


ALTER FUNCTION "public"."handle_delete_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_blocked"("a" "uuid", "b" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = a AND blocked_id = b)
       OR (blocker_id = b AND blocked_id = a)
  );
$$;


ALTER FUNCTION "public"."is_blocked"("a" "uuid", "b" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_conversation_member"("conv_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_members
    WHERE conversation_id = conv_id
    AND user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."is_conversation_member"("conv_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."birds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "common_name" "text" NOT NULL,
    "scientific_name" "text" NOT NULL,
    "description" "text",
    "season" "text",
    "habitat_info" "text",
    "ideal_zones" "text"
);


ALTER TABLE "public"."birds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sighting_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "parent_comment_id" "uuid",
    "content" "text" NOT NULL,
    "is_subcomment" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_member_states" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "last_read_message_id" "uuid",
    "last_read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "visible_message_id" "uuid",
    "visible_message_created_at" timestamp with time zone
);

ALTER TABLE ONLY "public"."conversation_member_states" REPLICA IDENTITY FULL;


ALTER TABLE "public"."conversation_member_states" OWNER TO "postgres";


COMMENT ON TABLE "public"."conversation_member_states" IS 'Estado de lectura por usuario/conversación. Último mensaje leído para scroll directo.';



CREATE TABLE IF NOT EXISTS "public"."conversation_members" (
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"(),
    "role" "text" DEFAULT 'member'::"text"
);


ALTER TABLE "public"."conversation_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "description" "text",
    "avatar_url" "text",
    "is_group" boolean DEFAULT false,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."follows" (
    "follower_id" "uuid" NOT NULL,
    "following_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "follows_check" CHECK (("follower_id" <> "following_id"))
);


ALTER TABLE "public"."follows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."message_reads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message_id" "uuid",
    "user_id" "uuid",
    "read_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."message_reads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid",
    "sender_id" "uuid",
    "content" "text",
    "image_url" "text",
    "reply_to_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_deleted" boolean DEFAULT false,
    "deleted_for" "uuid"[] DEFAULT '{}'::"uuid"[]
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reactions" (
    "user_id" "uuid" NOT NULL,
    "sighting_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."reactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sighting_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reported_user_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


COMMENT ON COLUMN "public"."reports"."reported_user_id" IS 'Usuario que está siendo reportado (puede ser NULL si solo se reporta un avistamiento)';



COMMENT ON COLUMN "public"."reports"."status" IS 'Estado del reporte: pending, reviewed, dismissed';



CREATE TABLE IF NOT EXISTS "public"."sightings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "bird_id" "uuid" NOT NULL,
    "description" "text",
    "latitude" numeric(9,6),
    "longitude" numeric(9,6),
    "is_location_private" boolean DEFAULT false NOT NULL,
    "photo_url" "text",
    "sighting_date" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sightings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_blocks" (
    "blocker_id" "uuid" NOT NULL,
    "blocked_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "no_self_block" CHECK (("blocker_id" <> "blocked_id"))
);


ALTER TABLE "public"."user_blocks" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_blocks" IS 'Registro de bloqueos entre usuarios. Un bloqueo es recíproco: ninguno ve contenido del otro.';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "username" "text" NOT NULL,
    "fullname" "text",
    "bio" "text",
    "profile_pic_url" "text",
    "is_private" boolean DEFAULT false NOT NULL,
    "is_verified" boolean DEFAULT false NOT NULL,
    "user_level" "text" DEFAULT 'general'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expo_push_token" "text",
    "notification_settings" "jsonb" DEFAULT '{}'::"jsonb",
    "push_notifications" "jsonb" DEFAULT '{}'::"jsonb",
    "email_notifications" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."birds"
    ADD CONSTRAINT "birds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_member_states"
    ADD CONSTRAINT "conversation_member_states_conversation_id_user_id_key" UNIQUE ("conversation_id", "user_id");



ALTER TABLE ONLY "public"."conversation_member_states"
    ADD CONSTRAINT "conversation_member_states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_members"
    ADD CONSTRAINT "conversation_members_pkey" PRIMARY KEY ("conversation_id", "user_id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("follower_id", "following_id");



ALTER TABLE ONLY "public"."message_reads"
    ADD CONSTRAINT "message_reads_message_id_user_id_key" UNIQUE ("message_id", "user_id");



ALTER TABLE ONLY "public"."message_reads"
    ADD CONSTRAINT "message_reads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_pkey" PRIMARY KEY ("user_id", "sighting_id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sightings"
    ADD CONSTRAINT "sightings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_blocks"
    ADD CONSTRAINT "user_blocks_pkey" PRIMARY KEY ("blocker_id", "blocked_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE INDEX "idx_conversation_member_states_conversation" ON "public"."conversation_member_states" USING "btree" ("conversation_id");



CREATE INDEX "idx_conversation_member_states_conversation_user" ON "public"."conversation_member_states" USING "btree" ("conversation_id", "user_id");



CREATE INDEX "idx_conversation_member_states_last_read" ON "public"."conversation_member_states" USING "btree" ("last_read_message_id");



CREATE INDEX "idx_conversation_member_states_user" ON "public"."conversation_member_states" USING "btree" ("user_id");



CREATE INDEX "idx_message_reads_message_id" ON "public"."message_reads" USING "btree" ("message_id");



CREATE INDEX "idx_message_reads_user_id" ON "public"."message_reads" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "update_conversation_member_states_updated_at" BEFORE UPDATE ON "public"."conversation_member_states" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_sighting_id_fkey" FOREIGN KEY ("sighting_id") REFERENCES "public"."sightings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_member_states"
    ADD CONSTRAINT "conversation_member_states_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_member_states"
    ADD CONSTRAINT "conversation_member_states_last_read_message_id_fkey" FOREIGN KEY ("last_read_message_id") REFERENCES "public"."messages"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."conversation_member_states"
    ADD CONSTRAINT "conversation_member_states_visible_message_id_fkey" FOREIGN KEY ("visible_message_id") REFERENCES "public"."messages"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."conversation_members"
    ADD CONSTRAINT "conversation_members_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_members"
    ADD CONSTRAINT "conversation_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."message_reads"
    ADD CONSTRAINT "message_reads_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."message_reads"
    ADD CONSTRAINT "message_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "public"."messages"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_sighting_id_fkey" FOREIGN KEY ("sighting_id") REFERENCES "public"."sightings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_sighting_id_fkey" FOREIGN KEY ("sighting_id") REFERENCES "public"."sightings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sightings"
    ADD CONSTRAINT "sightings_bird_id_fkey" FOREIGN KEY ("bird_id") REFERENCES "public"."birds"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sightings"
    ADD CONSTRAINT "sightings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_blocks"
    ADD CONSTRAINT "user_blocks_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_blocks"
    ADD CONSTRAINT "user_blocks_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Permitir creación a usuarios autenticados" ON "public"."sightings" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Permitir edición de avistamientos propios" ON "public"."sightings" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Permitir inserción de especies a usuarios autenticados" ON "public"."birds" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Permitir lectura pública de avistamientos" ON "public"."sightings" FOR SELECT USING (true);



CREATE POLICY "Permitir lectura pública de catálogo" ON "public"."birds" FOR SELECT USING (true);



CREATE POLICY "Permitir lectura pública de usuarios" ON "public"."users" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Users can add themselves to conversations" ON "public"."conversation_members" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create conversations" ON "public"."conversations" FOR INSERT TO "authenticated" WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can create own blocks" ON "public"."user_blocks" FOR INSERT WITH CHECK (("auth"."uid"() = "blocker_id"));



CREATE POLICY "Users can delete own blocks" ON "public"."user_blocks" FOR DELETE USING (("auth"."uid"() = "blocker_id"));



CREATE POLICY "Users can delete own conversation states" ON "public"."conversation_member_states" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own sightings" ON "public"."sightings" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own message reads" ON "public"."message_reads" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own messages" ON "public"."messages" FOR DELETE TO "authenticated" USING (("sender_id" = "auth"."uid"()));



CREATE POLICY "Users can insert own conversation states" ON "public"."conversation_member_states" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own message reads" ON "public"."message_reads" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own blocks" ON "public"."user_blocks" FOR SELECT USING ((("auth"."uid"() = "blocker_id") OR ("auth"."uid"() = "blocked_id")));



CREATE POLICY "Users can read their own message reads" ON "public"."message_reads" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can remove themselves from conversations" ON "public"."conversation_members" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can send messages" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK (("sender_id" = "auth"."uid"()));



CREATE POLICY "Users can update conversations" ON "public"."conversations" FOR UPDATE TO "authenticated" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can update own conversation states" ON "public"."conversation_member_states" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own sightings for 5 minutes" ON "public"."sightings" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND ("now"() <= ("created_at" + '00:05:00'::interval))));



CREATE POLICY "Users can update their own message reads" ON "public"."message_reads" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own messages" ON "public"."messages" FOR UPDATE TO "authenticated" USING (("sender_id" = "auth"."uid"()));



CREATE POLICY "Users can view conversation members" ON "public"."conversation_members" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view conversations" ON "public"."conversations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view messages" ON "public"."messages" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view own conversation states" ON "public"."conversation_member_states" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuarios pueden actualizar su propio estado" ON "public"."conversation_member_states" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuarios pueden eliminar su propio estado" ON "public"."conversation_member_states" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuarios pueden insertar su propio estado" ON "public"."conversation_member_states" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuarios pueden ver su propio estado" ON "public"."conversation_member_states" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."birds" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "birds_delete" ON "public"."birds" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "birds_insert" ON "public"."birds" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "birds_select" ON "public"."birds" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "birds_update" ON "public"."birds" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "comments_delete" ON "public"."comments" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "comments_insert" ON "public"."comments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "comments_select" ON "public"."comments" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") OR (NOT "public"."is_blocked"("auth"."uid"(), "user_id"))));



CREATE POLICY "comments_update" ON "public"."comments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "conversation_delete" ON "public"."conversations" FOR DELETE USING (("created_by" = "auth"."uid"()));



CREATE POLICY "conversation_insert" ON "public"."conversations" FOR INSERT WITH CHECK (("created_by" = "auth"."uid"()));



ALTER TABLE "public"."conversation_member_states" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "conversation_members_delete" ON "public"."conversation_members" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "conversation_members_insert" ON "public"."conversation_members" FOR INSERT WITH CHECK (true);



CREATE POLICY "conversation_members_select" ON "public"."conversation_members" FOR SELECT USING (true);



CREATE POLICY "conversation_select" ON "public"."conversations" FOR SELECT USING (("id" IN ( SELECT "conversation_members"."conversation_id"
   FROM "public"."conversation_members"
  WHERE ("conversation_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "conversation_update" ON "public"."conversations" FOR UPDATE USING (("created_by" = "auth"."uid"()));



ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."follows" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "follows_delete" ON "public"."follows" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "follower_id"));



CREATE POLICY "follows_insert" ON "public"."follows" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "follower_id") AND (NOT "public"."is_blocked"("auth"."uid"(), "following_id"))));



CREATE POLICY "follows_select" ON "public"."follows" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "follower_id") OR ("auth"."uid"() = "following_id")));



ALTER TABLE "public"."message_reads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "messages_delete" ON "public"."messages" FOR DELETE USING (("sender_id" = "auth"."uid"()));



CREATE POLICY "messages_insert" ON "public"."messages" FOR INSERT WITH CHECK ((("sender_id" = "auth"."uid"()) AND ("conversation_id" IN ( SELECT "conversation_members"."conversation_id"
   FROM "public"."conversation_members"
  WHERE ("conversation_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "messages_select" ON "public"."messages" FOR SELECT USING (("conversation_id" IN ( SELECT "conversation_members"."conversation_id"
   FROM "public"."conversation_members"
  WHERE ("conversation_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "messages_update" ON "public"."messages" FOR UPDATE USING (("sender_id" = "auth"."uid"()));



ALTER TABLE "public"."reactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reactions_delete" ON "public"."reactions" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "reactions_insert" ON "public"."reactions" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") AND (NOT "public"."is_blocked"("auth"."uid"(), ( SELECT "sightings"."user_id"
   FROM "public"."sightings"
  WHERE ("sightings"."id" = "reactions"."sighting_id"))))));



CREATE POLICY "reactions_select" ON "public"."reactions" FOR SELECT TO "authenticated" USING ((NOT "public"."is_blocked"("auth"."uid"(), ( SELECT "sightings"."user_id"
   FROM "public"."sightings"
  WHERE ("sightings"."id" = "reactions"."sighting_id")))));



ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reports_insert" ON "public"."reports" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "reports_select" ON "public"."reports" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") OR (( SELECT "users"."user_level"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = 'admin'::"text")));



CREATE POLICY "reports_update_admin" ON "public"."reports" FOR UPDATE TO "authenticated" USING ((( SELECT "users"."user_level"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = 'admin'::"text")) WITH CHECK ((( SELECT "users"."user_level"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = 'admin'::"text"));



ALTER TABLE "public"."sightings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sightings_delete" ON "public"."sightings" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "sightings_insert" ON "public"."sightings" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "sightings_select" ON "public"."sightings" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") OR (NOT "public"."is_blocked"("auth"."uid"(), "user_id"))));



CREATE POLICY "sightings_update" ON "public"."sightings" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."user_blocks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_blocks_delete" ON "public"."user_blocks" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "blocker_id"));



CREATE POLICY "user_blocks_insert" ON "public"."user_blocks" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "blocker_id"));



CREATE POLICY "user_blocks_select" ON "public"."user_blocks" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "blocker_id"));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_delete" ON "public"."users" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "users_insert" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "users_select" ON "public"."users" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "id") OR (NOT "public"."is_blocked"("auth"."uid"(), "id"))));



CREATE POLICY "users_update" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."comments";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."conversation_member_states";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."conversation_members";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."conversations";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."reactions";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."sightings";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


























































































































































































GRANT ALL ON FUNCTION "public"."create_group_conversation"("creator_id" "uuid", "group_name" "text", "group_description" "text", "member_ids" "uuid"[], "group_avatar" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_group_conversation"("creator_id" "uuid", "group_name" "text", "group_description" "text", "member_ids" "uuid"[], "group_avatar" "text") TO "authenticated";



GRANT ALL ON FUNCTION "public"."get_batch_conversation_member_states"("p_user_id" "uuid", "p_conversation_ids" "uuid"[]) TO "authenticated";



GRANT ALL ON FUNCTION "public"."get_or_create_direct_conversation"("user_a" "uuid", "user_b" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_or_create_direct_conversation"("user_a" "uuid", "user_b" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";






























ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























-- Fix para Supabase Meta (Studio) y Storage API en entorno local
DO $$
BEGIN
    -- Añadir la columna is_anonymous si la tabla auth.users ya existe (Gotrue)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false;
    END IF;

    -- Conceder BYPASSRLS a supabase_storage_admin si el rol existe (Storage API)
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
        ALTER ROLE supabase_storage_admin BYPASSRLS;
    END IF;
END $$;
-- Fix para permisos de tablas y RLS (local development sin politicas exportadas)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

DO $$
DECLARE
    row record;
BEGIN
    FOR row IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(row.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END;
$$;

-- Fix para permisos de Storage API (local development sin politicas exportadas)
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA storage TO anon, authenticated;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;


-- Fix para roles authenticated y anon (Storage API)
ALTER ROLE authenticated SET search_path = storage, public;
ALTER ROLE anon SET search_path = storage, public;

-- Fix para upserts de Storage API (faltaba el indice unico en name y bucket_id)
CREATE UNIQUE INDEX IF NOT EXISTS objects_bucketid_name_key ON storage.objects (bucket_id, name);

-- Fix para evitar aves duplicadas por nombre común
ALTER TABLE ONLY "public"."birds" ADD CONSTRAINT "birds_common_name_key" UNIQUE ("common_name");

-- Fix para Supabase Realtime (creación del schema y permisos)
CREATE SCHEMA IF NOT EXISTS realtime;
GRANT USAGE ON SCHEMA realtime TO postgres, anon, authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA realtime TO postgres, anon, authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA realtime TO postgres, anon, authenticated;

-- Fix para Storage API (service_role no tenia search_path localmente)
ALTER ROLE service_role SET search_path TO storage, public;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO service_role;
