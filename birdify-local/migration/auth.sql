SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict YkD8IBzCX8ziaaRJfKyrdwBKaWYtTTeFUA1vZhzlJVA5ecQQMdK1m7CS0zzvuj4

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'c4c29d80-a62d-48f5-869f-cf03d90378fb', 'authenticated', 'authenticated', 'fiolc5173@gmail.com', '$2a$10$fMhxaqypKIp1dS7hZo76RuGv/6m63cAOLpHe4ecHnvPldBeQE4hHW', '2026-05-24 19:50:07.913235+00', NULL, '', '2026-05-24 19:49:38.597526+00', '', NULL, '', '', NULL, '2026-05-24 19:50:27.403133+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "c4c29d80-a62d-48f5-869f-cf03d90378fb", "email": "fiolc5173@gmail.com", "fullname": "Christian", "username": "chricito1", "full_name": "Christian", "email_verified": true, "phone_verified": false, "profile_pic_url": "https://gravatar.com/avatar/?d=mp"}', NULL, '2026-05-24 19:49:38.540633+00', '2026-05-25 21:46:50.101362+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '6ad088ba-0fbd-4180-80ae-a117b11afb4a', 'authenticated', 'authenticated', 'fiolchristian96@gmail.com', '$2a$10$QQH5dIRYKzq9r/xKymCo0et.ZmUQEAy1/MGM1P05G7yE3ErWNSAHi', '2026-05-24 19:52:46.350287+00', NULL, '', '2026-05-24 19:52:33.557141+00', '', NULL, '', '', NULL, '2026-05-24 19:52:59.795446+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "6ad088ba-0fbd-4180-80ae-a117b11afb4a", "email": "fiolchristian96@gmail.com", "fullname": "Christian", "username": "chricito02", "full_name": "Christian", "email_verified": true, "phone_verified": false, "profile_pic_url": "https://gravatar.com/avatar/?d=mp"}', NULL, '2026-05-24 19:52:33.529782+00', '2026-05-24 21:49:26.684194+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', 'authenticated', 'authenticated', 'osalazarsalas@gmail.com', '$2a$10$zWPDwf5KXzHssVsrZaK/fOLJzhyFP0o4hAu1rpPnC4YT3cdJCFaHu', '2026-05-18 17:38:46.525915+00', NULL, '', '2026-05-18 17:38:32.085418+00', '', NULL, '', '', NULL, '2026-05-31 23:04:15.165072+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "dc8e0ffd-57c0-4017-adbe-83e1b17cfea3", "email": "osalazarsalas@gmail.com", "username": "sasilla7", "full_name": "Oscar Eduardo Salazar Salas", "email_verified": true, "phone_verified": false}', NULL, '2026-05-18 17:38:32.051048+00', '2026-06-05 21:32:16.395107+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '0f99790f-05a5-4049-8605-3180bbe889cb', 'authenticated', 'authenticated', 'ivanroko109@gmail.com', '$2a$10$RSCS19AG9l/6FofEs2MKHevRHR5nPx9rTHI6PTM7KMr2g5ou8.5S6', '2026-05-25 23:07:18.668483+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-05 19:43:03.326151+00', '{"provider": "email", "providers": ["email"]}', '{"fullname": "Ivancho", "username": "ivanroko109", "email_verified": true, "profile_pic_url": "https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/avatars/0f99790f-05a5-4049-8605-3180bbe889cb/1779958405626.jpeg"}', NULL, '2026-05-25 23:07:18.665845+00', '2026-06-06 01:24:22.366816+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3b392ef7-f898-4b54-9cf5-f9547775471a', 'authenticated', 'authenticated', 'osalazar_22@alu.uabcs.mx', '$2a$10$bL7SlebZmQUgwm0YN7Io3.MVNfDh7I3nkx0pV0uPvhhKQpV3dmJ26', '2026-05-14 06:26:58.83209+00', NULL, '', '2026-05-14 06:26:24.106222+00', '', NULL, '', '', NULL, '2026-05-31 23:03:34.744362+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "3b392ef7-f898-4b54-9cf5-f9547775471a", "email": "osalazar_22@alu.uabcs.mx", "fullname": "Oscar Eduardo Salazar Salas", "username": "osasa7", "full_name": "Oscar Eduardo Salazar Salas", "email_verified": true, "phone_verified": false, "profile_pic_url": "https://gravatar.com/avatar/?d=mp"}', NULL, '2026-05-14 06:26:24.082215+00', '2026-05-31 23:03:34.78437+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', 'authenticated', 'authenticated', 'jcota_22@alu.uabcs.mx', '$2a$10$QTN/Twr9NmEm4jFG8yLic.70vu3pjLhdnYUN.4Edrk4mZcm2fCWgW', '2026-05-25 21:10:08.191972+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-06-06 01:28:32.448847+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "7e96ecc2-2814-42da-bf7a-7d7a899e81ec", "email": "jcota_22@alu.uabcs.mx", "fullname": "ivan", "username": "iban_test", "full_name": "ivan", "email_verified": true, "phone_verified": false, "profile_pic_url": "https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/avatars/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779745933617.jpeg"}', NULL, '2026-05-25 21:09:50.205803+00', '2026-06-06 01:28:32.477435+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('3b392ef7-f898-4b54-9cf5-f9547775471a', '3b392ef7-f898-4b54-9cf5-f9547775471a', '{"sub": "3b392ef7-f898-4b54-9cf5-f9547775471a", "email": "osalazar_22@alu.uabcs.mx", "username": "osasa7", "full_name": "Oscar Eduardo Salazar Salas", "email_verified": true, "phone_verified": false}', 'email', '2026-05-14 06:26:24.097983+00', '2026-05-14 06:26:24.098064+00', '2026-05-14 06:26:24.098064+00', '5b4550ff-c3f8-4b26-8e83-8dd5ff91d844'),
	('dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{"sub": "dc8e0ffd-57c0-4017-adbe-83e1b17cfea3", "email": "osalazarsalas@gmail.com", "username": "sasilla7", "full_name": "Oscar Eduardo Salazar Salas", "email_verified": true, "phone_verified": false}', 'email', '2026-05-18 17:38:32.079414+00', '2026-05-18 17:38:32.079462+00', '2026-05-18 17:38:32.079462+00', '8adfc105-149f-4a89-8bf8-5d4fe87ceb4d'),
	('c4c29d80-a62d-48f5-869f-cf03d90378fb', 'c4c29d80-a62d-48f5-869f-cf03d90378fb', '{"sub": "c4c29d80-a62d-48f5-869f-cf03d90378fb", "email": "fiolc5173@gmail.com", "fullname": "Christian", "username": "chricito1", "full_name": "Christian", "email_verified": true, "phone_verified": false, "profile_pic_url": "https://gravatar.com/avatar/?d=mp"}', 'email', '2026-05-24 19:49:38.584926+00', '2026-05-24 19:49:38.58645+00', '2026-05-24 19:49:38.58645+00', '40e48114-5b95-4eca-87fa-01f23242aa3e'),
	('6ad088ba-0fbd-4180-80ae-a117b11afb4a', '6ad088ba-0fbd-4180-80ae-a117b11afb4a', '{"sub": "6ad088ba-0fbd-4180-80ae-a117b11afb4a", "email": "fiolchristian96@gmail.com", "fullname": "Christian", "username": "chricito02", "full_name": "Christian", "email_verified": true, "phone_verified": false, "profile_pic_url": "https://gravatar.com/avatar/?d=mp"}', 'email', '2026-05-24 19:52:33.550001+00', '2026-05-24 19:52:33.551358+00', '2026-05-24 19:52:33.551358+00', '3fb95c79-cee4-4255-977d-c728ff1772f5'),
	('7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{"sub": "7e96ecc2-2814-42da-bf7a-7d7a899e81ec", "email": "jcota_22@alu.uabcs.mx", "fullname": "ivan", "username": "iban_test", "full_name": "ivan", "email_verified": true, "phone_verified": false, "profile_pic_url": "https://gravatar.com/avatar/?d=mp"}', 'email', '2026-05-25 21:09:50.224484+00', '2026-05-25 21:09:50.224532+00', '2026-05-25 21:09:50.224532+00', '3c962568-8511-470e-a9f8-072df1137f56'),
	('0f99790f-05a5-4049-8605-3180bbe889cb', '0f99790f-05a5-4049-8605-3180bbe889cb', '{"sub": "0f99790f-05a5-4049-8605-3180bbe889cb", "email": "ivanroko109@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-05-25 23:07:18.667225+00', '2026-05-25 23:07:18.667271+00', '2026-05-25 23:07:18.667271+00', '0cbc4200-2f65-444c-a3c3-7be95603b29c');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('42e4d3f9-c4f3-4f38-baac-108a83d50364', 'c4c29d80-a62d-48f5-869f-cf03d90378fb', '2026-05-24 19:50:07.926499+00', '2026-05-24 19:50:07.926499+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1', '189.141.140.22', NULL, NULL, NULL, NULL, NULL),
	('f9b73931-ac55-456c-9f5c-0790ac242139', '6ad088ba-0fbd-4180-80ae-a117b11afb4a', '2026-05-24 19:52:46.373138+00', '2026-05-24 19:52:46.373138+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1', '189.141.140.22', NULL, NULL, NULL, NULL, NULL),
	('9e0d63ba-1f38-480c-b82f-2659445981f9', '6ad088ba-0fbd-4180-80ae-a117b11afb4a', '2026-05-24 19:52:59.79555+00', '2026-05-24 21:49:26.68698+00', NULL, 'aal1', NULL, '2026-05-24 21:49:26.68687', 'okhttp/4.12.0', '189.141.140.22', NULL, NULL, NULL, NULL, NULL),
	('3d800da0-b3dd-4137-9563-3317b2c4bda5', '0f99790f-05a5-4049-8605-3180bbe889cb', '2026-05-31 18:16:23.31874+00', '2026-05-31 18:16:23.31874+00', NULL, 'aal1', NULL, NULL, 'okhttp/4.12.0', '187.223.83.34', NULL, NULL, NULL, NULL, NULL),
	('b94ad47f-3c61-4844-b197-f711ded03e96', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-05-31 22:29:39.211765+00', '2026-05-31 22:29:39.211765+00', NULL, 'aal1', NULL, NULL, 'BirdifyApp/1 CFNetwork/3860.500.112 Darwin/25.4.0', '187.223.162.36', NULL, NULL, NULL, NULL, NULL),
	('af2efd1d-2f3b-4c0d-ad92-32e59f1ca51e', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-05-31 23:04:15.166926+00', '2026-06-05 21:32:16.415777+00', NULL, 'aal1', NULL, '2026-06-05 21:32:16.415667', 'BirdifyApp/1 CFNetwork/3860.500.112 Darwin/25.4.0', '177.230.104.71', NULL, NULL, NULL, NULL, NULL),
	('fb5d7a73-7b0a-46cb-8695-3844da073477', '0f99790f-05a5-4049-8605-3180bbe889cb', '2026-06-05 19:43:03.328245+00', '2026-06-06 01:23:05.462545+00', NULL, 'aal1', NULL, '2026-06-06 01:23:05.4624', 'okhttp/4.12.0', '187.223.132.170', NULL, NULL, NULL, NULL, NULL),
	('56531d77-6de8-4719-bf06-518e4c35a343', '0f99790f-05a5-4049-8605-3180bbe889cb', '2026-05-31 19:21:19.936663+00', '2026-06-06 01:24:22.378498+00', NULL, 'aal1', NULL, '2026-06-06 01:24:22.378377', 'okhttp/4.12.0', '187.223.132.170', NULL, NULL, NULL, NULL, NULL),
	('507a4e4e-dcad-472f-9c1b-ffd893695ba4', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:32.45066+00', '2026-06-06 01:28:32.45066+00', NULL, 'aal1', NULL, NULL, 'okhttp/4.12.0', '187.223.132.170', NULL, NULL, NULL, NULL, NULL),
	('b24ee6fc-3c57-4395-8bb3-1757cf8a54a1', 'c4c29d80-a62d-48f5-869f-cf03d90378fb', '2026-05-24 19:50:27.403234+00', '2026-05-25 21:46:50.118045+00', NULL, 'aal1', NULL, '2026-05-25 21:46:50.117933', 'Expo/1017756 CFNetwork/3860.500.112 Darwin/25.4.0', '187.223.166.109', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('3d800da0-b3dd-4137-9563-3317b2c4bda5', '2026-05-31 18:16:23.349159+00', '2026-05-31 18:16:23.349159+00', 'password', 'fbe0c198-0a13-4e33-8928-7566b901c700'),
	('56531d77-6de8-4719-bf06-518e4c35a343', '2026-05-31 19:21:20.018675+00', '2026-05-31 19:21:20.018675+00', 'password', '2c7858d7-acfe-4b6d-98a1-ee7a0e148241'),
	('42e4d3f9-c4f3-4f38-baac-108a83d50364', '2026-05-24 19:50:07.953332+00', '2026-05-24 19:50:07.953332+00', 'otp', '5e9de68c-2917-41dc-8d16-c72b97254270'),
	('b24ee6fc-3c57-4395-8bb3-1757cf8a54a1', '2026-05-24 19:50:27.405954+00', '2026-05-24 19:50:27.405954+00', 'password', 'dda20cf5-53b0-4707-807a-7bc68be86e51'),
	('b94ad47f-3c61-4844-b197-f711ded03e96', '2026-05-31 22:29:39.262625+00', '2026-05-31 22:29:39.262625+00', 'password', '7e3e01ad-ee76-4335-a5a1-956889ffbaa6'),
	('af2efd1d-2f3b-4c0d-ad92-32e59f1ca51e', '2026-05-31 23:04:15.188181+00', '2026-05-31 23:04:15.188181+00', 'password', '5aa55164-7f08-48fc-bb04-f6bd46cac399'),
	('fb5d7a73-7b0a-46cb-8695-3844da073477', '2026-06-05 19:43:03.381519+00', '2026-06-05 19:43:03.381519+00', 'password', '52d00bb8-075c-4ea2-aa3d-7158d7b491fa'),
	('507a4e4e-dcad-472f-9c1b-ffd893695ba4', '2026-06-06 01:28:32.486291+00', '2026-06-06 01:28:32.486291+00', 'password', 'f9e3a0c4-51e7-444e-a6d3-123b70c5cccd'),
	('f9b73931-ac55-456c-9f5c-0790ac242139', '2026-05-24 19:52:46.389857+00', '2026-05-24 19:52:46.389857+00', 'otp', '385549aa-5841-46e9-8e87-dbb3b9afd5e5'),
	('9e0d63ba-1f38-480c-b82f-2659445981f9', '2026-05-24 19:52:59.798476+00', '2026-05-24 19:52:59.798476+00', 'password', '84553917-afe3-4347-9d12-d3f58301875a');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 290, 'zpkv562sl3lq', 'c4c29d80-a62d-48f5-869f-cf03d90378fb', true, '2026-05-25 20:23:40.222436+00', '2026-05-25 21:46:50.087779+00', 'lfd7ph7yujco', 'b24ee6fc-3c57-4395-8bb3-1757cf8a54a1'),
	('00000000-0000-0000-0000-000000000000', 310, 'v5w5vmdwwhjw', 'c4c29d80-a62d-48f5-869f-cf03d90378fb', false, '2026-05-25 21:46:50.096543+00', '2026-05-25 21:46:50.096543+00', 'zpkv562sl3lq', 'b24ee6fc-3c57-4395-8bb3-1757cf8a54a1'),
	('00000000-0000-0000-0000-000000000000', 611, 'alz52kvipekl', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', true, '2026-06-01 00:08:28.260007+00', '2026-06-01 02:56:01.525144+00', 'bwoktoyxomts', 'af2efd1d-2f3b-4c0d-ad92-32e59f1ca51e'),
	('00000000-0000-0000-0000-000000000000', 614, 'dnf3amlkb3td', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', true, '2026-06-01 03:55:29.856524+00', '2026-06-01 04:55:40.124825+00', 'psp4hajxqwnw', 'af2efd1d-2f3b-4c0d-ad92-32e59f1ca51e'),
	('00000000-0000-0000-0000-000000000000', 617, 'yv5anztpuvet', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', true, '2026-06-03 06:28:50.854088+00', '2026-06-03 08:38:27.501748+00', 'hd3umqpbz6gr', 'af2efd1d-2f3b-4c0d-ad92-32e59f1ca51e'),
	('00000000-0000-0000-0000-000000000000', 623, 'u2c67pyu5eji', '0f99790f-05a5-4049-8605-3180bbe889cb', true, '2026-06-05 19:43:03.357812+00', '2026-06-05 20:45:06.854583+00', NULL, 'fb5d7a73-7b0a-46cb-8695-3844da073477'),
	('00000000-0000-0000-0000-000000000000', 626, '5qa62pnwn5zc', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', false, '2026-06-05 21:32:16.384702+00', '2026-06-05 21:32:16.384702+00', 'fe33rldkdiwx', 'af2efd1d-2f3b-4c0d-ad92-32e59f1ca51e'),
	('00000000-0000-0000-0000-000000000000', 607, 'pdafebugxaxl', '0f99790f-05a5-4049-8605-3180bbe889cb', true, '2026-05-31 19:21:19.984819+00', '2026-06-06 01:24:22.35049+00', NULL, '56531d77-6de8-4719-bf06-518e4c35a343'),
	('00000000-0000-0000-0000-000000000000', 629, 'pw3mxthqvmh4', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', false, '2026-06-06 01:28:32.473299+00', '2026-06-06 01:28:32.473299+00', NULL, '507a4e4e-dcad-472f-9c1b-ffd893695ba4'),
	('00000000-0000-0000-0000-000000000000', 605, 'dxz4iugudzsf', '0f99790f-05a5-4049-8605-3180bbe889cb', false, '2026-05-31 18:16:23.333188+00', '2026-05-31 18:16:23.333188+00', NULL, '3d800da0-b3dd-4137-9563-3317b2c4bda5'),
	('00000000-0000-0000-0000-000000000000', 608, 'gguhjkgi7exh', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', false, '2026-05-31 22:29:39.239555+00', '2026-05-31 22:29:39.239555+00', NULL, 'b94ad47f-3c61-4844-b197-f711ded03e96'),
	('00000000-0000-0000-0000-000000000000', 612, 'psp4hajxqwnw', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', true, '2026-06-01 02:56:01.536936+00', '2026-06-01 03:55:29.849085+00', 'alz52kvipekl', 'af2efd1d-2f3b-4c0d-ad92-32e59f1ca51e'),
	('00000000-0000-0000-0000-000000000000', 615, 'co4vuzfcj2ef', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', true, '2026-06-01 04:55:40.146073+00', '2026-06-02 19:07:16.503536+00', 'dnf3amlkb3td', 'af2efd1d-2f3b-4c0d-ad92-32e59f1ca51e'),
	('00000000-0000-0000-0000-000000000000', 618, 'rxac7lcwyt24', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', true, '2026-06-03 08:38:27.516323+00', '2026-06-05 05:15:24.075625+00', 'yv5anztpuvet', 'af2efd1d-2f3b-4c0d-ad92-32e59f1ca51e'),
	('00000000-0000-0000-0000-000000000000', 621, 'cdafpvobicpj', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', true, '2026-06-05 19:02:57.911109+00', '2026-06-05 20:05:01.925028+00', 'gyqvjazfufpf', 'af2efd1d-2f3b-4c0d-ad92-32e59f1ca51e'),
	('00000000-0000-0000-0000-000000000000', 624, 'fe33rldkdiwx', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', true, '2026-06-05 20:05:01.935706+00', '2026-06-05 21:32:16.372059+00', 'cdafpvobicpj', 'af2efd1d-2f3b-4c0d-ad92-32e59f1ca51e'),
	('00000000-0000-0000-0000-000000000000', 627, 'hxtzqbwk3ntd', '0f99790f-05a5-4049-8605-3180bbe889cb', false, '2026-06-06 01:23:05.435118+00', '2026-06-06 01:23:05.435118+00', 's5mwgvj5dm3f', 'fb5d7a73-7b0a-46cb-8695-3844da073477'),
	('00000000-0000-0000-0000-000000000000', 257, 'z3b4ouothyrl', 'c4c29d80-a62d-48f5-869f-cf03d90378fb', true, '2026-05-24 21:48:52.320287+00', '2026-05-25 19:23:34.896153+00', 'vxrqylzgcjax', 'b24ee6fc-3c57-4395-8bb3-1757cf8a54a1'),
	('00000000-0000-0000-0000-000000000000', 283, 'lfd7ph7yujco', 'c4c29d80-a62d-48f5-869f-cf03d90378fb', true, '2026-05-25 19:23:34.906522+00', '2026-05-25 20:23:40.213853+00', 'z3b4ouothyrl', 'b24ee6fc-3c57-4395-8bb3-1757cf8a54a1'),
	('00000000-0000-0000-0000-000000000000', 610, 'bwoktoyxomts', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', true, '2026-05-31 23:04:15.183398+00', '2026-06-01 00:08:28.242682+00', NULL, 'af2efd1d-2f3b-4c0d-ad92-32e59f1ca51e'),
	('00000000-0000-0000-0000-000000000000', 616, 'hd3umqpbz6gr', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', true, '2026-06-02 19:07:16.516037+00', '2026-06-03 06:28:50.826194+00', 'co4vuzfcj2ef', 'af2efd1d-2f3b-4c0d-ad92-32e59f1ca51e'),
	('00000000-0000-0000-0000-000000000000', 619, 'gyqvjazfufpf', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', true, '2026-06-05 05:15:24.093071+00', '2026-06-05 19:02:57.891688+00', 'rxac7lcwyt24', 'af2efd1d-2f3b-4c0d-ad92-32e59f1ca51e'),
	('00000000-0000-0000-0000-000000000000', 625, 's5mwgvj5dm3f', '0f99790f-05a5-4049-8605-3180bbe889cb', true, '2026-06-05 20:45:06.870878+00', '2026-06-06 01:23:05.422835+00', 'u2c67pyu5eji', 'fb5d7a73-7b0a-46cb-8695-3844da073477'),
	('00000000-0000-0000-0000-000000000000', 628, 'qis2ttau35ic', '0f99790f-05a5-4049-8605-3180bbe889cb', false, '2026-06-06 01:24:22.361965+00', '2026-06-06 01:24:22.361965+00', 'pdafebugxaxl', '56531d77-6de8-4719-bf06-518e4c35a343'),
	('00000000-0000-0000-0000-000000000000', 251, 'xoca7jfkbi2b', 'c4c29d80-a62d-48f5-869f-cf03d90378fb', false, '2026-05-24 19:50:07.939619+00', '2026-05-24 19:50:07.939619+00', NULL, '42e4d3f9-c4f3-4f38-baac-108a83d50364'),
	('00000000-0000-0000-0000-000000000000', 253, 'hntzazx3mzjw', '6ad088ba-0fbd-4180-80ae-a117b11afb4a', false, '2026-05-24 19:52:46.384781+00', '2026-05-24 19:52:46.384781+00', NULL, 'f9b73931-ac55-456c-9f5c-0790ac242139'),
	('00000000-0000-0000-0000-000000000000', 252, 'yjvf4udvdmuj', 'c4c29d80-a62d-48f5-869f-cf03d90378fb', true, '2026-05-24 19:50:27.404458+00', '2026-05-24 20:48:39.68086+00', NULL, 'b24ee6fc-3c57-4395-8bb3-1757cf8a54a1'),
	('00000000-0000-0000-0000-000000000000', 254, 'mq62v3ux5xmx', '6ad088ba-0fbd-4180-80ae-a117b11afb4a', true, '2026-05-24 19:52:59.796762+00', '2026-05-24 20:51:15.741292+00', NULL, '9e0d63ba-1f38-480c-b82f-2659445981f9'),
	('00000000-0000-0000-0000-000000000000', 255, 'vxrqylzgcjax', 'c4c29d80-a62d-48f5-869f-cf03d90378fb', true, '2026-05-24 20:48:39.693913+00', '2026-05-24 21:48:52.30657+00', 'yjvf4udvdmuj', 'b24ee6fc-3c57-4395-8bb3-1757cf8a54a1'),
	('00000000-0000-0000-0000-000000000000', 256, 'rcbsabxqxpvm', '6ad088ba-0fbd-4180-80ae-a117b11afb4a', true, '2026-05-24 20:51:15.745312+00', '2026-05-24 21:49:26.679864+00', 'mq62v3ux5xmx', '9e0d63ba-1f38-480c-b82f-2659445981f9'),
	('00000000-0000-0000-0000-000000000000', 258, 'mescoz2etbxn', '6ad088ba-0fbd-4180-80ae-a117b11afb4a', false, '2026-05-24 21:49:26.683156+00', '2026-05-24 21:49:26.683156+00', 'rcbsabxqxpvm', '9e0d63ba-1f38-480c-b82f-2659445981f9');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 629, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict YkD8IBzCX8ziaaRJfKyrdwBKaWYtTTeFUA1vZhzlJVA5ecQQMdK1m7CS0zzvuj4

RESET ALL;
