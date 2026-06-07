SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict OCPJqk8qEGOlOU64Sorskmvy9iuUPt1mT0QYrMldMLfF6E3y7q3Adov6xfypfMJ

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
-- Data for Name: birds; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."birds" ("id", "common_name", "scientific_name", "description", "season", "habitat_info", "ideal_zones") VALUES
	('7ee45d51-9155-419b-8691-b78a14cc8179', 'Cardenal Rojo', 'Cardinalis cardinalis', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('f6ba8be2-89dc-4d2c-99e7-e022b74273c4', 'Colibrí Garganta Rubí', 'Archilochus colubris', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('14840a73-c5a3-45c9-b38d-029ff438aa32', 'Petirrojo Americano', 'Turdus migratorius', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('e169d8c5-80b7-4faf-a6d3-1eae657c04a8', 'robin', 'robin sp.', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('0d583d3f-3f52-4f3a-9437-2e6cfe6f6a9e', 'Mordecai', 'Mordecai sp.', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('f64428e0-cde4-43e8-9114-88456f11da05', 'Águila Calva', 'Haliaeetus leucocephalus', 'Registrado offline.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('707a1456-7503-4ddf-882e-3debfd59d705', 'Azulejo', 'Cyanocitta cristata', 'Registrado offline.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('a8c56487-d0e6-434e-ac77-27057b393e29', 'Águila Calvah', 'Águila Calvah sp.', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('1f804ddb-a44a-4d39-8947-8b5d3a038a09', 'Jsjsj', 'Jsjsj sp.', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('2bf10589-570b-465f-8666-0beaabb38fcc', 'Petirrobo Americano', 'Turdus migratorius', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('f6263e08-0037-4ac0-9df6-91be5caa42c4', 'Paloma Huilota', 'Zenaida macroura', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('e74ea131-b356-4fd1-b3ae-296a833b4c65', 'Aa', 'Aa sp.', 'Registrado offline.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('e60dc327-9eae-4e5c-bec2-c16796fc0576', 'Pelícano Café ', 'Pelícano Café  sp.', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('100e00f6-aacf-4544-b46a-20e758a95984', 'Carpintero del Desierto', 'Carpintero del Desierto sp.', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('1873ff71-4635-4c61-b9df-c309416ca206', 'aves', 'aves sp.', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('bdccdcd0-b6d3-4116-8818-bd68cf17f7d2', 'prueba delete', 'prueba delete sp.', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('ea3dffe8-1ede-4bab-97fd-042b40cf6c06', 'modal error', 'modal error sp.', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('b4404f8b-a3f8-47ec-ade8-09ea772b18da', 'Calandrio', 'Calandrio sp.', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido'),
	('01aae71f-95a1-4488-a47a-02736a073e32', 'Garza', 'Garza sp.', 'Registrado dinámicamente durante un avistamiento.', 'Desconocido', 'Desconocido', 'Desconocido');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "email", "username", "fullname", "bio", "profile_pic_url", "is_private", "is_verified", "user_level", "created_at", "expo_push_token", "notification_settings", "push_notifications", "email_notifications") VALUES
	('7e96ecc2-2814-42da-bf7a-7d7a899e81ec', 'jcota_22@alu.uabcs.mx', 'iban_test', 'ivan', 'Tamborsito', 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/avatars/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779745933617.jpeg', false, true, 'general', '2026-05-25 21:17:29.561314+00', NULL, '{}', '[{"id": "1", "desc": "Alerts for rare birds in your area", "icon": "eye-outline", "title": "New Sighting", "active": true}, {"id": "2", "desc": "When someone replies to your journal", "icon": "chatbubble-outline", "title": "New Comment", "active": true}, {"id": "3", "desc": "Stay updated on your community", "icon": "person-add-outline", "title": "New Follower", "active": true}, {"id": "4", "desc": "Private conversations", "icon": "mail-outline", "title": "Direct Messages", "active": true}]', '[{"id": "5", "desc": "Summary of activity and sightings", "icon": "book-outline", "title": "Weekly Digest", "active": true}, {"id": "6", "desc": "Login alerts and password changes", "icon": "shield-checkmark-outline", "title": "Account Security", "active": true}]'),
	('3b392ef7-f898-4b54-9cf5-f9547775471a', 'osalazar_22@alu.uabcs.mx', 'osasa7', 'Oscar Eduardo Salazar Salas', NULL, 'https://gravatar.com/avatar/?d=mp', false, true, 'general', '2026-05-14 06:26:24.075258+00', NULL, '{}', '{}', '{}'),
	('0f99790f-05a5-4049-8605-3180bbe889cb', 'ivanroko109@gmail.com', 'ivanroko109', 'Ivancho', NULL, 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/avatars/0f99790f-05a5-4049-8605-3180bbe889cb/1779958405626.jpeg', false, false, 'general', '2026-05-25 23:07:39.888115+00', NULL, '{}', '[{"id": "1", "desc": "Alerts for rare birds in your area", "icon": "eye-outline", "title": "New Sighting", "active": false}, {"id": "2", "desc": "When someone replies to your journal", "icon": "chatbubble-outline", "title": "New Comment", "active": false}, {"id": "3", "desc": "Stay updated on your community", "icon": "person-add-outline", "title": "New Follower", "active": true}, {"id": "4", "desc": "Private conversations", "icon": "mail-outline", "title": "Direct Messages", "active": true}]', '{}'),
	('dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', 'osalazarsalas@gmail.com', 'sasilla7', 'Oscar Eduardo Salazar Salas', NULL, NULL, false, false, 'general', '2026-05-18 17:38:32.049214+00', NULL, '{}', '{}', '{}'),
	('c4c29d80-a62d-48f5-869f-cf03d90378fb', 'fiolc5173@gmail.com', 'chricito1', 'Christian', NULL, NULL, false, false, 'general', '2026-05-24 19:49:38.53871+00', NULL, '{}', '{}', '{}'),
	('6ad088ba-0fbd-4180-80ae-a117b11afb4a', 'fiolchristian96@gmail.com', 'chricito02', 'Christian', NULL, NULL, false, false, 'general', '2026-05-24 19:52:33.529361+00', NULL, '{}', '{}', '{}');


--
-- Data for Name: sightings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sightings" ("id", "user_id", "bird_id", "description", "latitude", "longitude", "is_location_private", "photo_url", "sighting_date", "created_at", "updated_at") VALUES
	('80b50a47-46b9-4804-a6be-7ef0ea7af36f', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', 'f6263e08-0037-4ac0-9df6-91be5caa42c4', 'fesf', 24.142093, -110.289478, false, 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780092733761_0.jpeg', '2026-05-29 22:12:14.448+00', '2026-05-29 22:20:55.255662+00', '2026-05-29 22:20:55.255662+00'),
	('39017eec-6d41-4bc8-8d6a-bc90a7e3c12b', '0f99790f-05a5-4049-8605-3180bbe889cb', 'b4404f8b-a3f8-47ec-ade8-09ea772b18da', '', 24.102756, -110.316141, false, 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/0f99790f-05a5-4049-8605-3180bbe889cb/1780691731407_0.jpeg', '2026-06-05 20:35:33.66+00', '2026-06-05 20:35:33.919735+00', '2026-06-05 20:35:33.919735+00'),
	('e894a41f-75c3-47d9-9bca-dc3acfacad4a', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', 'f6ba8be2-89dc-4d2c-99e7-e022b74273c4', 'Colibrí en mi planta', 24.135000, -110.312800, false, 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780274400063_0.jpg', '2026-06-01 00:40:00.75+00', '2026-06-01 00:40:00.845694+00', '2026-06-01 00:40:00.845694+00'),
	('572b978c-c5b7-49a8-9713-af67fef1ea51', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', 'e60dc327-9eae-4e5c-bec2-c16796fc0576', 'En balandra caminando ', 24.310921, -110.325845, false, 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780283961469_0.jpg', '2026-06-01 03:19:22.621+00', '2026-06-01 03:19:22.691626+00', '2026-06-01 03:19:58.689+00'),
	('18fa0644-4a80-486a-a378-60cc107d9df9', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '100e00f6-aacf-4544-b46a-20e758a95984', 'Caminado por el malecón with de homies', 24.163857, -110.316316, false, 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780285019108_0.jpg', '2026-06-01 03:36:59.79+00', '2026-06-01 03:36:59.865293+00', '2026-06-01 03:37:48.347+00'),
	('192be8f2-8608-47e8-bac1-ebca9200ef48', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '1873ff71-4635-4c61-b9df-c309416ca206', 'aaa', 24.142600, -110.312800, false, 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780285160789_0.jpg', '2026-06-01 03:39:21.427+00', '2026-06-01 03:39:21.506093+00', '2026-06-01 03:39:21.506093+00'),
	('8a117c73-8830-4d1e-ac5e-37f4fe7ed6cc', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', 'bdccdcd0-b6d3-4116-8818-bd68cf17f7d2', 'delete', 24.142600, -110.312800, false, 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780285938716_0.jpg', '2026-06-01 03:52:19.569+00', '2026-06-01 03:52:19.630883+00', '2026-06-01 03:52:19.630883+00'),
	('da495aff-39fd-408d-9761-f49ee718f3f4', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2bf10589-570b-465f-8666-0beaabb38fcc', '', 24.142600, -110.312800, false, 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780286230564_0.jpeg', '2026-06-01 03:57:11.2+00', '2026-06-01 03:57:11.292632+00', '2026-06-01 03:57:11.292632+00'),
	('b1d2895e-c05d-4fd3-b2a7-63d009ebc9b9', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2bf10589-570b-465f-8666-0beaabb38fcc', 'fefe', 24.142600, -110.312800, false, 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780708906075_0.jpeg', '2026-06-06 01:21:47.757+00', '2026-06-06 01:30:47.645821+00', '2026-06-06 01:30:47.645821+00'),
	('0a8570d2-591c-4e8b-9c0c-18d752a9de18', '0f99790f-05a5-4049-8605-3180bbe889cb', '01aae71f-95a1-4488-a47a-02736a073e32', 'Jajsjs', 24.142600, -110.312800, false, 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/0f99790f-05a5-4049-8605-3180bbe889cb/1780709477154_0.jpeg', '2026-06-06 01:31:18.03+00', '2026-06-06 01:31:18.304534+00', '2026-06-06 01:31:18.304534+00'),
	('b7edb488-6bed-434c-83fb-ee1d82e80d86', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '7ee45d51-9155-419b-8691-b78a14cc8179', 'Ayay', 24.133458, -110.320269, false, '["https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779956733132_0.jpeg","https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779956733927_1.jpeg","https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779956734400_2.jpeg","https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779956734809_3.jpeg","https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779956735203_4.jpeg"]', '2026-05-28 08:25:35.676+00', '2026-05-28 08:25:36.217489+00', '2026-05-28 08:25:36.217489+00'),
	('25704146-2ee3-4de9-ad3b-9b3a3ca68dc9', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '7ee45d51-9155-419b-8691-b78a14cc8179', '', 24.142600, -110.312800, false, 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780018286296_0.jpeg', '2026-05-29 01:31:27.016+00', '2026-05-29 01:31:27.115955+00', '2026-05-29 01:31:27.115955+00'),
	('6eae95ec-de9a-49c0-8122-3a0bafb3199e', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '7ee45d51-9155-419b-8691-b78a14cc8179', '', 24.142600, -110.312800, false, '["https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780018862598_0.jpeg","https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780018863341_1.jpeg"]', '2026-05-29 01:41:03.633+00', '2026-05-29 01:41:03.714705+00', '2026-05-29 01:41:03.714705+00'),
	('b6021183-f4c1-4bf2-bc10-4deaa9417666', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '7ee45d51-9155-419b-8691-b78a14cc8179', 'Shjs', 24.133522, -110.322758, false, 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780019071824_0.jpeg', '2026-05-29 01:44:32.584+00', '2026-05-29 01:44:32.687787+00', '2026-05-29 01:44:32.687787+00'),
	('d48bdf82-6a95-42f0-ba17-f4a25f5e0a96', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '7ee45d51-9155-419b-8691-b78a14cc8179', 'lok', 24.135042, -110.318139, false, 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780090986181_0.jpeg', '2026-05-29 21:43:08.895+00', '2026-05-29 21:51:49.650368+00', '2026-05-29 21:51:49.650368+00'),
	('49459980-15de-441d-800a-d3682fc217aa', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '7ee45d51-9155-419b-8691-b78a14cc8179', 'dad', 24.121835, -110.303246, false, 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/Sightings/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780091022034_0.jpeg', '2026-05-29 21:43:42.73+00', '2026-05-29 21:52:23.439518+00', '2026-05-29 21:52:23.439518+00');


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."comments" ("id", "sighting_id", "user_id", "parent_comment_id", "content", "is_subcomment", "created_at", "updated_at") VALUES
	('8a9d5c9d-e823-4452-896f-5fbde90c9058', 'b7edb488-6bed-434c-83fb-ee1d82e80d86', '0f99790f-05a5-4049-8605-3180bbe889cb', NULL, 'Jajaj', false, '2026-05-28 08:27:08.318617+00', '2026-05-28 08:27:08.318617+00'),
	('bbce70e8-52c2-4ca8-b448-267f5546e26d', 'b7edb488-6bed-434c-83fb-ee1d82e80d86', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', NULL, 'Hejs', false, '2026-05-29 03:50:04.892061+00', '2026-05-29 03:50:04.892061+00'),
	('03d62038-d8fc-42e3-a163-26a38a3645d0', 'b6021183-f4c1-4bf2-bc10-4deaa9417666', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', NULL, 'Hola', false, '2026-05-29 04:14:47.544285+00', '2026-05-29 04:14:47.544285+00'),
	('5b96fe95-e0b1-4a43-bf43-ad9a2e2337b2', '25704146-2ee3-4de9-ad3b-9b3a3ca68dc9', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', NULL, 'Hi', false, '2026-05-29 04:32:46.058888+00', '2026-05-29 04:32:46.058888+00');


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."conversations" ("id", "name", "description", "avatar_url", "is_group", "created_by", "created_at") VALUES
	('7b19591f-4e1e-4867-8d33-c178d45bff8c', NULL, NULL, NULL, false, '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-31 18:46:26.148826+00'),
	('f4470469-94ad-4337-a3d2-edddc64366b3', NULL, NULL, NULL, false, '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-31 19:23:07.737893+00'),
	('ea082d0a-4be3-437c-a070-9a57d2dcc3fb', 'Tilines', 'Jeje', 'https://fkeqiaunrfgvkpfuenpp.supabase.co/storage/v1/object/public/group-avatars/7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780255704629.jpg', true, '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-31 19:28:25.79453+00'),
	('1759751b-68ed-40c5-949c-0c99dd3c4d76', NULL, NULL, NULL, false, 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-06-05 05:30:46.496732+00'),
	('692d7ca1-9a72-42cb-b2a3-e201f8855c98', NULL, NULL, NULL, false, '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:29:24.182303+00');


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."messages" ("id", "conversation_id", "sender_id", "content", "image_url", "reply_to_id", "created_at", "is_deleted", "deleted_for") VALUES
	('9fb42732-e058-49d8-856a-9fb95d811a1e', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', 'Hola', NULL, NULL, '2026-05-31 18:46:29.977151+00', false, '{}'),
	('edf8dd2a-b29c-4402-ae3f-3fb343da91b5', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', 'Ey', NULL, NULL, '2026-05-31 18:46:35.84652+00', false, '{}'),
	('ab5b6900-1baa-4ba2-91d9-2d2a90de7e56', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', 'E', NULL, NULL, '2026-05-31 18:46:41.30409+00', false, '{}'),
	('b49ac5c5-3b48-4e60-9747-2d9c2d4bac54', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'hola', NULL, NULL, '2026-05-31 18:47:08.26457+00', false, '{}'),
	('e16333ae-9214-499a-9cbd-f6207fc5cb29', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'er', NULL, NULL, '2026-05-31 18:47:11.978796+00', false, '{}'),
	('807026ca-0d1c-472b-90b0-6e8ffa08425d', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'df', NULL, NULL, '2026-05-31 18:47:16.715365+00', false, '{}'),
	('2122156b-f324-4e57-8244-b3a3b77bbe84', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'dsda', NULL, NULL, '2026-05-31 18:47:19.53447+00', false, '{}'),
	('0f2fa350-5262-48b9-a51a-fb198b94cbf3', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'x', NULL, NULL, '2026-05-31 18:47:20.728675+00', false, '{}'),
	('7f9d5ce6-fc1c-489c-81a0-ddf924e8f3f8', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'x', NULL, NULL, '2026-05-31 18:47:22.283629+00', false, '{}'),
	('63d66c85-7e14-49c6-9128-51e4e9e51a98', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'x', NULL, NULL, '2026-05-31 18:47:23.747307+00', false, '{}'),
	('6a12a3c7-069e-401d-81fd-629bf9d39275', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'xd', NULL, NULL, '2026-05-31 18:47:26.712095+00', false, '{}'),
	('adde5f0f-ba0c-4d44-8aea-8ddb9f1766f9', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'fr', NULL, NULL, '2026-05-31 18:47:28.094445+00', false, '{}'),
	('16ec2568-5569-417e-82b9-8059d16d1765', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'gt', NULL, NULL, '2026-05-31 18:47:29.430827+00', false, '{}'),
	('32e9e20d-05bb-4243-a650-e3b3807d7763', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'uy', NULL, NULL, '2026-05-31 18:47:30.817048+00', false, '{}'),
	('1eeb2c30-67f5-4e04-ad9f-c5a401cb9551', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'yt', NULL, NULL, '2026-05-31 18:47:32.289727+00', false, '{}'),
	('80db9ddd-17f7-424e-80db-1eaacd6d2867', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'iuy', NULL, NULL, '2026-05-31 18:47:33.754537+00', false, '{}'),
	('17f4fa11-582e-472d-b053-e3187eddffbd', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', 'Ho', NULL, NULL, '2026-05-31 18:47:59.306135+00', false, '{}'),
	('e37beaa6-cb7c-4ac0-ad30-7c8234b5d274', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'fe', NULL, NULL, '2026-05-31 18:48:39.171534+00', false, '{}'),
	('87d06b6f-b4a9-4c50-8240-26a3d380f48a', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'dw', NULL, NULL, '2026-05-31 18:51:50.829988+00', false, '{}'),
	('96d13dbd-8b6c-4e30-91d4-ea70cbed3c3a', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'ahhh', NULL, NULL, '2026-05-31 18:52:01.779502+00', false, '{}'),
	('68cb1f41-3e88-4e67-af8f-f4a3a92a3bde', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', 'Vj', NULL, NULL, '2026-05-31 18:52:26.547312+00', false, '{}'),
	('f53a9c46-e5e0-4345-84b1-eb5f0427db0e', 'ea082d0a-4be3-437c-a070-9a57d2dcc3fb', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', 'Hola', NULL, NULL, '2026-05-31 19:28:36.171552+00', false, '{}'),
	('1471d52c-0cd1-4c7b-a40b-d597b61924d2', 'ea082d0a-4be3-437c-a070-9a57d2dcc3fb', '0f99790f-05a5-4049-8605-3180bbe889cb', 'yepa', NULL, NULL, '2026-05-31 19:29:06.86589+00', false, '{}'),
	('91924363-f11a-49bf-bce3-91a031304fd6', 'ea082d0a-4be3-437c-a070-9a57d2dcc3fb', '0f99790f-05a5-4049-8605-3180bbe889cb', 'fe', NULL, NULL, '2026-05-31 19:29:18.954533+00', false, '{}'),
	('54364bc6-0643-4cdf-9502-e34504ee8f04', '1759751b-68ed-40c5-949c-0c99dd3c4d76', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', 'Hola', NULL, NULL, '2026-06-05 05:30:52.946874+00', false, '{}'),
	('1ea39642-e95d-4660-bb49-b12b441c568d', 'f4470469-94ad-4337-a3d2-edddc64366b3', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', 'A', NULL, NULL, '2026-06-05 17:41:06.416159+00', false, '{}'),
	('fd07bdf4-a2aa-4f31-8769-6cc5a056ee09', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'Hola', NULL, NULL, '2026-06-05 19:43:09.084655+00', false, '{}'),
	('f2308759-b6f1-4a69-89c5-c68c74bfcf70', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', 'Ey', NULL, NULL, '2026-06-05 19:43:33.872332+00', false, '{}'),
	('31fd5337-713f-41e8-866f-30581053b76e', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'Hola', NULL, NULL, '2026-06-05 20:31:41.504248+00', false, '{}'),
	('c8b2f34a-36be-431e-a649-92980bda3cde', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'Hola', NULL, NULL, '2026-06-05 20:46:51.047272+00', false, '{}'),
	('e8106be7-cebb-4d8a-9efc-7bae2681f71b', '692d7ca1-9a72-42cb-b2a3-e201f8855c98', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', 'fef', NULL, NULL, '2026-06-06 01:29:29.024598+00', false, '{}'),
	('a8e230ca-ed9d-4a26-baa8-5bb732849c4d', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'Holi', NULL, NULL, '2026-06-06 01:29:46.632041+00', false, '{}'),
	('1ed8061f-ce3d-4ee8-872b-c80388c6446f', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'No se actualiza?', NULL, NULL, '2026-06-06 01:30:03.465314+00', false, '{}');


--
-- Data for Name: conversation_member_states; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."conversation_member_states" ("id", "conversation_id", "user_id", "last_read_message_id", "last_read_at", "created_at", "updated_at", "visible_message_id", "visible_message_created_at") VALUES
	('6274aff6-7bd3-4fc3-8ba0-23ced4354cdc', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', 'f2308759-b6f1-4a69-89c5-c68c74bfcf70', '2026-06-05 20:31:35.004+00', '2026-05-31 18:46:43.595749+00', '2026-06-06 01:30:07.514836+00', '17f4fa11-582e-472d-b053-e3187eddffbd', '2026-05-31 18:47:59.306135+00'),
	('d3440ee5-6b93-47f4-a500-c60be19d4a80', 'ea082d0a-4be3-437c-a070-9a57d2dcc3fb', '0f99790f-05a5-4049-8605-3180bbe889cb', 'f53a9c46-e5e0-4345-84b1-eb5f0427db0e', '2026-05-31 19:20:13.319+00', '2026-05-31 19:28:58.712191+00', '2026-05-31 19:28:59.895127+00', 'f53a9c46-e5e0-4345-84b1-eb5f0427db0e', '2026-05-31 19:28:36.171552+00'),
	('c96d2103-9bc3-47be-bbba-cdf3d0b8e9ec', 'ea082d0a-4be3-437c-a070-9a57d2dcc3fb', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '91924363-f11a-49bf-bce3-91a031304fd6', '2026-05-31 19:29:23.742+00', '2026-05-31 19:28:37.847047+00', '2026-05-31 19:29:25.232035+00', 'f53a9c46-e5e0-4345-84b1-eb5f0427db0e', '2026-05-31 19:28:36.171552+00'),
	('c8f43d08-4b8b-44ff-a548-0602da1d7887', '1759751b-68ed-40c5-949c-0c99dd3c4d76', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', NULL, NULL, '2026-06-05 05:30:54.736232+00', '2026-06-05 05:30:54.736232+00', '54364bc6-0643-4cdf-9502-e34504ee8f04', '2026-06-05 05:30:52.946874+00'),
	('16fe4068-7619-47f5-a1b6-3dba4c2a9c8f', '1759751b-68ed-40c5-949c-0c99dd3c4d76', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '54364bc6-0643-4cdf-9502-e34504ee8f04', '2026-06-05 17:39:53.251+00', '2026-06-05 17:39:53.513404+00', '2026-06-05 17:39:54.779583+00', '54364bc6-0643-4cdf-9502-e34504ee8f04', '2026-06-05 05:30:52.946874+00'),
	('6c51462d-db97-4fa4-8fc3-a31610b55161', 'f4470469-94ad-4337-a3d2-edddc64366b3', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', NULL, NULL, '2026-06-05 17:41:08.565854+00', '2026-06-05 17:41:08.565854+00', '1ea39642-e95d-4660-bb49-b12b441c568d', '2026-06-05 17:41:06.416159+00'),
	('c4043391-61ca-48c7-8d6e-ec9f1dbc83a7', '7b19591f-4e1e-4867-8d33-c178d45bff8c', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '31fd5337-713f-41e8-866f-30581053b76e', '2026-06-05 20:31:49.813+00', '2026-05-31 18:46:31.62414+00', '2026-06-05 20:31:51.886935+00', '16ec2568-5569-417e-82b9-8059d16d1765', '2026-05-31 18:47:29.430827+00');


--
-- Data for Name: conversation_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."conversation_members" ("conversation_id", "user_id", "joined_at", "role") VALUES
	('7b19591f-4e1e-4867-8d33-c178d45bff8c', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-31 18:46:26.294385+00', 'admin'),
	('7b19591f-4e1e-4867-8d33-c178d45bff8c', '0f99790f-05a5-4049-8605-3180bbe889cb', '2026-05-31 18:46:26.294385+00', 'member'),
	('f4470469-94ad-4337-a3d2-edddc64366b3', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-31 19:23:07.872729+00', 'admin'),
	('f4470469-94ad-4337-a3d2-edddc64366b3', '6ad088ba-0fbd-4180-80ae-a117b11afb4a', '2026-05-31 19:23:07.872729+00', 'member'),
	('ea082d0a-4be3-437c-a070-9a57d2dcc3fb', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-31 19:28:25.914135+00', 'admin'),
	('ea082d0a-4be3-437c-a070-9a57d2dcc3fb', '0f99790f-05a5-4049-8605-3180bbe889cb', '2026-05-31 19:28:25.914135+00', 'member'),
	('ea082d0a-4be3-437c-a070-9a57d2dcc3fb', '6ad088ba-0fbd-4180-80ae-a117b11afb4a', '2026-05-31 19:28:25.914135+00', 'member'),
	('1759751b-68ed-40c5-949c-0c99dd3c4d76', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-06-05 05:30:46.676658+00', 'admin'),
	('692d7ca1-9a72-42cb-b2a3-e201f8855c98', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:29:24.31121+00', 'admin'),
	('692d7ca1-9a72-42cb-b2a3-e201f8855c98', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-06-06 01:29:24.31121+00', 'member');


--
-- Data for Name: follows; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."follows" ("follower_id", "following_id", "created_at") VALUES
	('0f99790f-05a5-4049-8605-3180bbe889cb', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 08:30:25.721488+00'),
	('7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '0f99790f-05a5-4049-8605-3180bbe889cb', '2026-05-29 00:26:06.383274+00'),
	('7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '6ad088ba-0fbd-4180-80ae-a117b11afb4a', '2026-05-29 05:32:39.474338+00'),
	('dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-05 05:30:37.008799+00');


--
-- Data for Name: message_reads; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."message_reads" ("id", "message_id", "user_id", "read_at") VALUES
	('0eaca4e0-60d7-4498-a1ab-c8250bc9f7d2', 'b49ac5c5-3b48-4e60-9747-2d9c2d4bac54', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('1c404f50-2d38-40e0-aff5-5e4a388ce8e1', 'e16333ae-9214-499a-9cbd-f6207fc5cb29', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('9cb5bb87-ea9d-4577-935a-81bd85a2963b', '807026ca-0d1c-472b-90b0-6e8ffa08425d', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('0aaf07d6-fddd-4e7e-bfca-58604b9c9ab8', '2122156b-f324-4e57-8244-b3a3b77bbe84', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('0a2c3d9e-b457-48e6-acc6-fe5a1a63aef2', '0f2fa350-5262-48b9-a51a-fb198b94cbf3', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('07fcb1c0-ef7d-40a1-8ce4-244c21f8b979', '7f9d5ce6-fc1c-489c-81a0-ddf924e8f3f8', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('21d9d7e6-c932-4b65-b4bf-97c42d9149f6', '63d66c85-7e14-49c6-9128-51e4e9e51a98', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('88a94b48-d702-43f5-b069-7e5ea59658f3', '6a12a3c7-069e-401d-81fd-629bf9d39275', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('2583719c-02c0-4f85-b495-62de20a84281', 'adde5f0f-ba0c-4d44-8aea-8ddb9f1766f9', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('d58c7e4b-ab56-4248-a148-a129c2bf5b30', '16ec2568-5569-417e-82b9-8059d16d1765', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('0ce55e21-433f-4a69-8007-8292e7347462', '32e9e20d-05bb-4243-a650-e3b3807d7763', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('fc8706b8-2c55-4254-83fe-db4fc65d8402', '1eeb2c30-67f5-4e04-ad9f-c5a401cb9551', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('fc48d8b2-961e-4027-acf9-6fdb31b2b130', '80db9ddd-17f7-424e-80db-1eaacd6d2867', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('5bbbcf46-f6ad-41f2-b4a3-6978f1aa3bac', 'e37beaa6-cb7c-4ac0-ad30-7c8234b5d274', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('6df46492-6ef6-47c3-a37f-72490dd16128', '87d06b6f-b4a9-4c50-8240-26a3d380f48a', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('11aaddcc-e6e1-4548-a17a-8c9a416f90ec', '96d13dbd-8b6c-4e30-91d4-ea70cbed3c3a', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('ea9ec01a-a019-49c0-927a-422a1cdcc824', 'fd07bdf4-a2aa-4f31-8769-6cc5a056ee09', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('bd2dee8b-6498-4211-b72d-9a01eb63ac61', '31fd5337-713f-41e8-866f-30581053b76e', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('fb0c5475-1d15-4c81-8c6c-9a2de24cbe4c', 'c8b2f34a-36be-431e-a649-92980bda3cde', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:42.358091+00'),
	('b0b0eb55-1a20-40b8-80a6-52e092aec5d7', '1471d52c-0cd1-4c7b-a40b-d597b61924d2', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:46.660464+00'),
	('c0d5b522-99fd-47db-adae-d629fcfff620', '91924363-f11a-49bf-bce3-91a031304fd6', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:28:46.660464+00'),
	('f37e76a5-3807-4361-9301-71ae8feb726b', 'a8e230ca-ed9d-4a26-baa8-5bb732849c4d', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:29:54.771457+00'),
	('eaa65d4b-24f1-439f-9de2-2788108ea8db', '1ed8061f-ce3d-4ee8-872b-c80388c6446f', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:30:14.977651+00');


--
-- Data for Name: reactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."reactions" ("user_id", "sighting_id", "created_at") VALUES
	('0f99790f-05a5-4049-8605-3180bbe889cb', 'b7edb488-6bed-434c-83fb-ee1d82e80d86', '2026-05-28 08:27:03.865179+00'),
	('7e96ecc2-2814-42da-bf7a-7d7a899e81ec', 'b7edb488-6bed-434c-83fb-ee1d82e80d86', '2026-05-28 09:59:07.897704+00'),
	('7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '25704146-2ee3-4de9-ad3b-9b3a3ca68dc9', '2026-05-29 04:32:29.135986+00'),
	('7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '6eae95ec-de9a-49c0-8122-3a0bafb3199e', '2026-05-29 06:27:05.869568+00'),
	('7e96ecc2-2814-42da-bf7a-7d7a899e81ec', 'b6021183-f4c1-4bf2-bc10-4deaa9417666', '2026-05-29 21:01:52.511067+00'),
	('dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', 'da495aff-39fd-408d-9761-f49ee718f3f4', '2026-06-05 05:30:23.428062+00'),
	('7e96ecc2-2814-42da-bf7a-7d7a899e81ec', 'da495aff-39fd-408d-9761-f49ee718f3f4', '2026-06-05 17:40:43.917237+00'),
	('7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '8a117c73-8830-4d1e-ac5e-37f4fe7ed6cc', '2026-06-05 17:40:45.639709+00');


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_blocks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('avatars', 'avatars', NULL, '2026-05-19 03:08:37.893106+00', '2026-05-19 03:08:37.893106+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('Sightings', 'Sightings', NULL, '2026-05-19 03:49:33.56103+00', '2026-05-19 03:49:33.56103+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('chat-images', 'chat-images', NULL, '2026-05-24 19:08:56.474706+00', '2026-05-24 19:08:56.474706+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('group-avatars', 'group-avatars', NULL, '2026-05-28 09:25:03.244742+00', '2026-05-28 09:25:03.244742+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('061ececa-9c0a-4da4-b531-b905f4922d27', 'avatars', 'cb9c5158-93f9-4bf5-83b4-bb1921b40a91/1779161144699.jpeg', 'cb9c5158-93f9-4bf5-83b4-bb1921b40a91', '2026-05-19 03:25:45.821091+00', '2026-05-19 03:25:45.821091+00', '2026-05-19 03:25:45.821091+00', '{"eTag": "\"6f8182362a62fc39757694560dc34a69\"", "size": 553745, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-19T03:25:46.000Z", "contentLength": 553745, "httpStatusCode": 200}', 'd76692fa-57a9-4fe0-a062-192a2e9c791f', 'cb9c5158-93f9-4bf5-83b4-bb1921b40a91', '{}'),
	('29e479af-2440-44a0-ad1e-136c0bd9c847', 'avatars', '0f99790f-05a5-4049-8605-3180bbe889cb/1779958405626.jpeg', '0f99790f-05a5-4049-8605-3180bbe889cb', '2026-05-28 08:53:27.088357+00', '2026-05-28 08:53:27.088357+00', '2026-05-28 08:53:27.088357+00', '{"eTag": "\"da3fb96e307515d4cce931fb7e21b6ce\"", "size": 707673, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T08:53:28.000Z", "contentLength": 707673, "httpStatusCode": 200}', '701893d2-4397-41a6-8a64-e8ba360c1879', '0f99790f-05a5-4049-8605-3180bbe889cb', '{}'),
	('dcfca573-53b1-4dd1-8d61-d75f0c296ddc', 'avatars', 'cb9c5158-93f9-4bf5-83b4-bb1921b40a91/1779161166922.jpeg', 'cb9c5158-93f9-4bf5-83b4-bb1921b40a91', '2026-05-19 03:26:07.948163+00', '2026-05-19 03:26:07.948163+00', '2026-05-19 03:26:07.948163+00', '{"eTag": "\"6f8182362a62fc39757694560dc34a69\"", "size": 553745, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-19T03:26:08.000Z", "contentLength": 553745, "httpStatusCode": 200}', 'd98645e2-236a-40e5-8344-f574f99b9729', 'cb9c5158-93f9-4bf5-83b4-bb1921b40a91', '{}'),
	('481fb26d-568d-44b0-9b81-33bc80079434', 'Sightings', 'cb9c5158-93f9-4bf5-83b4-bb1921b40a91/1779164420757.jpeg', 'cb9c5158-93f9-4bf5-83b4-bb1921b40a91', '2026-05-19 04:20:21.255575+00', '2026-05-19 04:20:21.255575+00', '2026-05-19 04:20:21.255575+00', '{"eTag": "\"33ed4d04f32c2b91d50bba7061bd6c4b\"", "size": 39279, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-19T04:20:22.000Z", "contentLength": 39279, "httpStatusCode": 200}', 'f613eb84-a37c-4f56-9bad-127ecb0f5685', 'cb9c5158-93f9-4bf5-83b4-bb1921b40a91', '{}'),
	('dcd86548-5a6a-44e7-8b7b-ac5d5c166f2e', 'group-avatars', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780026687732.jpg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-29 03:51:28.487621+00', '2026-05-29 03:51:28.487621+00', '2026-05-29 03:51:28.487621+00', '{"eTag": "\"a344870153ba5f8f4179fff81caaf6d8\"", "size": 81335, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-05-29T03:51:29.000Z", "contentLength": 81335, "httpStatusCode": 200}', '64190064-fa20-4d1e-9ae2-4039652dbbec', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('ec47c8c6-c924-4573-ac9d-a1c67adf538e', 'avatars', '09520d38-e5dd-4eda-a260-5fc45720d36c/1779166588094.jpeg', '09520d38-e5dd-4eda-a260-5fc45720d36c', '2026-05-19 04:56:28.826143+00', '2026-05-19 04:56:28.826143+00', '2026-05-19 04:56:28.826143+00', '{"eTag": "\"ee836d14313fafffc4de0c98575c113f\"", "size": 183109, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-19T04:56:29.000Z", "contentLength": 183109, "httpStatusCode": 200}', '81b571b0-60f2-4d72-b6ab-1fd67ce419f3', '09520d38-e5dd-4eda-a260-5fc45720d36c', '{}'),
	('42682075-4c6f-4294-a32b-6359548de2d2', 'Sightings', '09520d38-e5dd-4eda-a260-5fc45720d36c/1779168761528.jpeg', '09520d38-e5dd-4eda-a260-5fc45720d36c', '2026-05-19 05:32:42.051437+00', '2026-05-19 05:32:42.051437+00', '2026-05-19 05:32:42.051437+00', '{"eTag": "\"37a7a12afd04ce0ebfe3b26bf44dc9bf\"", "size": 48850, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-19T05:32:43.000Z", "contentLength": 48850, "httpStatusCode": 200}', '97bb5d11-1b56-44e0-b4af-e4d26b80f886', '09520d38-e5dd-4eda-a260-5fc45720d36c', '{}'),
	('3527de9e-53b5-45ed-af07-8b34f7a9ba3c', 'group-avatars', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780255704629.jpg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-31 19:28:25.603857+00', '2026-05-31 19:28:25.603857+00', '2026-05-31 19:28:25.603857+00', '{"eTag": "\"3cdcac1beef3934bc55a8930ee4972d2\"", "size": 40010, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-31T19:28:26.000Z", "contentLength": 40010, "httpStatusCode": 200}', '5e58bb03-2c84-433b-afd9-f56d65c88d57', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('4a10a23e-8e36-428b-9c2a-defcebef083e', 'Sightings', '09520d38-e5dd-4eda-a260-5fc45720d36c/1779168935531.jpeg', '09520d38-e5dd-4eda-a260-5fc45720d36c', '2026-05-19 05:35:36.056534+00', '2026-05-19 05:35:36.056534+00', '2026-05-19 05:35:36.056534+00', '{"eTag": "\"f6cec00926b5baac4bcff0df255961f7\"", "size": 53172, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-19T05:35:37.000Z", "contentLength": 53172, "httpStatusCode": 200}', 'dcfa29f2-7649-4628-a5cc-c564001b7ebc', '09520d38-e5dd-4eda-a260-5fc45720d36c', '{}'),
	('5451bf29-b000-4671-b320-8c1010dcef2b', 'Sightings', '09520d38-e5dd-4eda-a260-5fc45720d36c/1779168991676.jpeg', '09520d38-e5dd-4eda-a260-5fc45720d36c', '2026-05-19 05:36:32.472329+00', '2026-05-19 05:36:32.472329+00', '2026-05-19 05:36:32.472329+00', '{"eTag": "\"0a83f489ae5cb2fb3176e82374e0c5c4\"", "size": 437053, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-19T05:36:33.000Z", "contentLength": 437053, "httpStatusCode": 200}', '9eea0123-37f5-401a-935b-61df8545063a', '09520d38-e5dd-4eda-a260-5fc45720d36c', '{}'),
	('aab19106-9b33-44b9-911f-0f2dc4e5ee71', 'Sightings', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780271909643.jpg', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-05-31 23:58:30.417259+00', '2026-05-31 23:58:30.417259+00', '2026-05-31 23:58:30.417259+00', '{"eTag": "\"b04bfc6ea906070975465b6cd69f1731\"", "size": 438208, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-31T23:58:31.000Z", "contentLength": 438208, "httpStatusCode": 200}', 'fb1bff45-1597-467a-8b3b-5b8d9256e274', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('0e620154-f6e6-4690-8292-b73a933c610f', 'Sightings', '09520d38-e5dd-4eda-a260-5fc45720d36c/1779169071401.jpeg', '09520d38-e5dd-4eda-a260-5fc45720d36c', '2026-05-19 05:37:52.133365+00', '2026-05-19 05:37:52.133365+00', '2026-05-19 05:37:52.133365+00', '{"eTag": "\"2ea98f09edb1b27f25cb4e51f948725c\"", "size": 145225, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-19T05:37:53.000Z", "contentLength": 145225, "httpStatusCode": 200}', '1bf72845-54ea-42eb-899c-75292f59bb15', '09520d38-e5dd-4eda-a260-5fc45720d36c', '{}'),
	('daf7d285-be04-482a-923e-c4b270b658bd', 'Sightings', 'cb9c5158-93f9-4bf5-83b4-bb1921b40a91/1779171359326.jpeg', 'cb9c5158-93f9-4bf5-83b4-bb1921b40a91', '2026-05-19 06:16:00.325715+00', '2026-05-19 06:16:00.325715+00', '2026-05-19 06:16:00.325715+00', '{"eTag": "\"7bfd2ab4ed38e1e3fd76d4a41b51d63b\"", "size": 614840, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-19T06:16:01.000Z", "contentLength": 614840, "httpStatusCode": 200}', 'c21dc596-f179-414a-9af6-a8ea58353ce5', 'cb9c5158-93f9-4bf5-83b4-bb1921b40a91', '{}'),
	('94d501b0-f5f4-4f59-92d7-e9dcd7768cf3', 'avatars', 'cb9c5158-93f9-4bf5-83b4-bb1921b40a91/1779171411836.jpeg', 'cb9c5158-93f9-4bf5-83b4-bb1921b40a91', '2026-05-19 06:16:53.015866+00', '2026-05-19 06:16:53.015866+00', '2026-05-19 06:16:53.015866+00', '{"eTag": "\"092a23573883d628cb8c2a4129d4f5e6\"", "size": 1094966, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-19T06:16:53.000Z", "contentLength": 1094966, "httpStatusCode": 200}', '5feb211c-e528-4965-86aa-d69f77d5d275', 'cb9c5158-93f9-4bf5-83b4-bb1921b40a91', '{}'),
	('e9db4762-4d34-4354-ac5b-e0e71cba1b63', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779964731189_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 10:38:52.252834+00', '2026-05-28 10:38:52.252834+00', '2026-05-28 10:38:52.252834+00', '{"eTag": "\"8127d9c4806a9d063badc4ff87d085b4\"", "size": 67521, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T10:38:53.000Z", "contentLength": 67521, "httpStatusCode": 200}', '94fc88e2-dfe6-49b8-9637-1ccc0a88f8fd', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('0a3e0f0c-f547-4b75-b849-d7b07658558e', 'Sightings', '3b392ef7-f898-4b54-9cf5-f9547775471a/1779622406874.jpg', '3b392ef7-f898-4b54-9cf5-f9547775471a', '2026-05-24 11:33:27.524241+00', '2026-05-24 11:33:27.524241+00', '2026-05-24 11:33:27.524241+00', '{"eTag": "\"5de24a5b60480aed70a1facce633fe85\"", "size": 285021, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-24T11:33:28.000Z", "contentLength": 285021, "httpStatusCode": 200}', 'c929eec4-7981-46eb-bea9-ea6acba66f97', '3b392ef7-f898-4b54-9cf5-f9547775471a', '{}'),
	('879bce77-8d2b-4057-84ca-e0fa31a824b0', 'Sightings', '3b392ef7-f898-4b54-9cf5-f9547775471a/1779622487688.jpg', '3b392ef7-f898-4b54-9cf5-f9547775471a', '2026-05-24 11:34:48.089985+00', '2026-05-24 11:34:48.089985+00', '2026-05-24 11:34:48.089985+00', '{"eTag": "\"7ccd0ec8b3258952e3cb61c05e846c29\"", "size": 238221, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-24T11:34:49.000Z", "contentLength": 238221, "httpStatusCode": 200}', 'e8073a3f-6d39-4e95-a810-088c334ee518', '3b392ef7-f898-4b54-9cf5-f9547775471a', '{}'),
	('779d4a3a-2eae-4a5c-a253-95b294c67a12', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779964731858_1.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 10:38:52.658639+00', '2026-05-28 10:38:52.658639+00', '2026-05-28 10:38:52.658639+00', '{"eTag": "\"f248ec53e0e1d38b525dd8d7472aa42f\"", "size": 146174, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T10:38:53.000Z", "contentLength": 146174, "httpStatusCode": 200}', 'ed53f36c-35f7-40d6-8dfc-159edca06eba', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('ef6198bf-59cc-4739-b853-edb9aab1969e', 'Sightings', '3b392ef7-f898-4b54-9cf5-f9547775471a/1779622494120.jpg', '3b392ef7-f898-4b54-9cf5-f9547775471a', '2026-05-24 11:34:54.523672+00', '2026-05-24 11:34:54.523672+00', '2026-05-24 11:34:54.523672+00', '{"eTag": "\"7ccd0ec8b3258952e3cb61c05e846c29\"", "size": 238221, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-24T11:34:55.000Z", "contentLength": 238221, "httpStatusCode": 200}', '55212c75-8fd9-4022-9318-d79ec4aa2bca', '3b392ef7-f898-4b54-9cf5-f9547775471a', '{}'),
	('164aaa9a-3587-4619-9ca3-427fccde07de', 'Sightings', '3b392ef7-f898-4b54-9cf5-f9547775471a/1779676831445.png', '3b392ef7-f898-4b54-9cf5-f9547775471a', '2026-05-25 02:40:32.077495+00', '2026-05-25 02:40:32.077495+00', '2026-05-25 02:40:32.077495+00', '{"eTag": "\"b3c4ab58619a2e1d1beea092a7e86393\"", "size": 101721, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-05-25T02:40:33.000Z", "contentLength": 101721, "httpStatusCode": 200}', '40a39103-585a-4e3f-b41d-245827f2443b', '3b392ef7-f898-4b54-9cf5-f9547775471a', '{}'),
	('98926e42-920f-46af-809d-ba58d594526d', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779964732266_2.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 10:38:52.9913+00', '2026-05-28 10:38:52.9913+00', '2026-05-28 10:38:52.9913+00', '{"eTag": "\"23d9afd9b8bec89417e075535c660abd\"", "size": 62228, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T10:38:53.000Z", "contentLength": 62228, "httpStatusCode": 200}', 'fb6272f7-1819-4c77-8351-c5b13aeb4b28', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('6ea116ea-88a7-4205-81bd-cfb32dea6a5f', 'Sightings', '3b392ef7-f898-4b54-9cf5-f9547775471a/1779690926006.jpg', '3b392ef7-f898-4b54-9cf5-f9547775471a', '2026-05-25 06:35:26.998306+00', '2026-05-25 06:35:26.998306+00', '2026-05-25 06:35:26.998306+00', '{"eTag": "\"14495892ee1496777946ef0bf53e284c\"", "size": 594974, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-25T06:35:27.000Z", "contentLength": 594974, "httpStatusCode": 200}', '8ca02f65-cf5b-498e-af92-41b42ca1db7a', '3b392ef7-f898-4b54-9cf5-f9547775471a', '{}'),
	('9e8fc908-07a7-4d32-b26c-6252ed8e1722', 'avatars', 'e6d84709-7fb8-4068-ac62-fdddf24d439b/1779740520926.jpeg', 'e6d84709-7fb8-4068-ac62-fdddf24d439b', '2026-05-25 20:22:01.826359+00', '2026-05-25 20:22:01.826359+00', '2026-05-25 20:22:01.826359+00', '{"eTag": "\"b580d18bfa24a7fe3c9125fcf566d568\"", "size": 169145, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-25T20:22:02.000Z", "contentLength": 169145, "httpStatusCode": 200}', '1781dbdd-eea6-4a6e-b6a9-ab7d79b7b747', 'e6d84709-7fb8-4068-ac62-fdddf24d439b', '{}'),
	('7e8caa6a-cc8c-4569-9222-26586659ba2c', 'Sightings', 'e6d84709-7fb8-4068-ac62-fdddf24d439b/1779740563916.jpeg', 'e6d84709-7fb8-4068-ac62-fdddf24d439b', '2026-05-25 20:22:45.504815+00', '2026-05-25 20:22:45.504815+00', '2026-05-25 20:22:45.504815+00', '{"eTag": "\"8bcb972ccd28062a1fbcb8d54b43f377\"", "size": 873593, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-25T20:22:46.000Z", "contentLength": 873593, "httpStatusCode": 200}', '43d09f40-10d0-4a37-a493-27b6710b18f2', 'e6d84709-7fb8-4068-ac62-fdddf24d439b', '{}'),
	('850e43be-5475-4e72-a162-3e61f50ecf6f', 'avatars', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779745933617.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-25 21:52:14.682556+00', '2026-05-25 21:52:14.682556+00', '2026-05-25 21:52:14.682556+00', '{"eTag": "\"f9863211332c486ee64edce3cfd6ba8a\"", "size": 181991, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-25T21:52:15.000Z", "contentLength": 181991, "httpStatusCode": 200}', 'c663767a-6721-4cf7-95f9-9619e4ad1a39', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('b689831a-6ac7-4a11-8d23-bc50bebad3eb', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779749725758.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-25 22:55:26.631558+00', '2026-05-25 22:55:26.631558+00', '2026-05-25 22:55:26.631558+00', '{"eTag": "\"d6e5e030a3ea7e4c5ee387769a9fe2bf\"", "size": 152103, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-25T22:55:27.000Z", "contentLength": 152103, "httpStatusCode": 200}', '7e7121fe-e97d-4ba7-bb46-1fee27285a0e', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('484406cd-17b5-45f9-b720-5d8098387a00', 'group-avatars', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780003381680.jpg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 21:23:02.460243+00', '2026-05-28 21:23:02.460243+00', '2026-05-28 21:23:02.460243+00', '{"eTag": "\"8fcecedbe342af57902866b20c7564d9\"", "size": 31113, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T21:23:03.000Z", "contentLength": 31113, "httpStatusCode": 200}', 'c31316da-a909-47d4-8225-8933bd70a63f', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('43e82cde-9bb5-414f-83ca-46b961c0244e', 'Sightings', '3b392ef7-f898-4b54-9cf5-f9547775471a/1779782604944.jpg', '3b392ef7-f898-4b54-9cf5-f9547775471a', '2026-05-26 08:03:25.578808+00', '2026-05-26 08:03:25.578808+00', '2026-05-26 08:03:25.578808+00', '{"eTag": "\"f676dfe79dfdd2035d540d6d689c88a5\"", "size": 503732, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-26T08:03:26.000Z", "contentLength": 503732, "httpStatusCode": 200}', '5ec4121c-a142-47f1-a039-80b484e9c5f2', '3b392ef7-f898-4b54-9cf5-f9547775471a', '{}'),
	('577e179c-353d-46f2-9f40-7fb862382249', 'Sightings', '3b392ef7-f898-4b54-9cf5-f9547775471a/1779817251918.jpg', '3b392ef7-f898-4b54-9cf5-f9547775471a', '2026-05-26 17:40:52.533393+00', '2026-05-26 17:40:52.533393+00', '2026-05-26 17:40:52.533393+00', '{"eTag": "\"04ffb400de86f27f924aec85e1929503\"", "size": 442062, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-26T17:40:53.000Z", "contentLength": 442062, "httpStatusCode": 200}', '8ff278f9-9c3e-478d-aec1-67e3336064ef', '3b392ef7-f898-4b54-9cf5-f9547775471a', '{}'),
	('c32e21dc-6784-45f1-a271-4474d6418d3d', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780035983152_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-29 06:26:23.776168+00', '2026-05-29 06:26:23.776168+00', '2026-05-29 06:26:23.776168+00', '{"eTag": "\"ccc23121a4af0b8620775aff2b5ca554\"", "size": 157327, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-29T06:26:24.000Z", "contentLength": 157327, "httpStatusCode": 200}', 'e805a63e-4f63-4aff-9f3c-944767282d61', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('8ca56e73-f38b-4307-a7f1-10d19c00bd51', 'Sightings', '3b392ef7-f898-4b54-9cf5-f9547775471a/1779817254146.jpg', '3b392ef7-f898-4b54-9cf5-f9547775471a', '2026-05-26 17:40:54.864865+00', '2026-05-26 17:40:54.864865+00', '2026-05-26 17:40:54.864865+00', '{"eTag": "\"04ffb400de86f27f924aec85e1929503\"", "size": 442062, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-26T17:40:55.000Z", "contentLength": 442062, "httpStatusCode": 200}', '75db74cc-a82a-46db-88b8-8cdc8b07165b', '3b392ef7-f898-4b54-9cf5-f9547775471a', '{}'),
	('361a6dd1-586c-4b56-a3e6-7baf923b4b19', 'Sightings', '3b392ef7-f898-4b54-9cf5-f9547775471a/1779818597525.jpg', '3b392ef7-f898-4b54-9cf5-f9547775471a', '2026-05-26 18:03:18.180945+00', '2026-05-26 18:03:18.180945+00', '2026-05-26 18:03:18.180945+00', '{"eTag": "\"04ffb400de86f27f924aec85e1929503\"", "size": 442062, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-26T18:03:19.000Z", "contentLength": 442062, "httpStatusCode": 200}', 'f39f63b5-de26-46d3-8efa-0298a5df327f', '3b392ef7-f898-4b54-9cf5-f9547775471a', '{}'),
	('e934d27a-6855-417f-a6b6-087dd1a5abc3', 'Sightings', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780268775246_0.jpg', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-05-31 23:06:15.831459+00', '2026-05-31 23:06:15.831459+00', '2026-05-31 23:06:15.831459+00', '{"eTag": "\"de23aa066c2df125f5980b2174368364\"", "size": 427912, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-31T23:06:16.000Z", "contentLength": 427912, "httpStatusCode": 200}', '1f60e44c-d2da-438f-91c4-f4458f1d4eac', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('de962452-fcc9-45e7-b743-115dec64bb75', 'Sightings', '3b392ef7-f898-4b54-9cf5-f9547775471a/1779818598710.jpg', '3b392ef7-f898-4b54-9cf5-f9547775471a', '2026-05-26 18:03:19.232895+00', '2026-05-26 18:03:19.232895+00', '2026-05-26 18:03:19.232895+00', '{"eTag": "\"2ab07a74c34c72098f90d81502d247c7\"", "size": 382848, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-26T18:03:20.000Z", "contentLength": 382848, "httpStatusCode": 200}', 'b74a0f78-c3ad-46c7-8077-464b2384f090', '3b392ef7-f898-4b54-9cf5-f9547775471a', '{}'),
	('5ee102cc-1439-4cc1-8877-fae25623afc2', 'Sightings', '3b392ef7-f898-4b54-9cf5-f9547775471a/1779818985563.jpg', '3b392ef7-f898-4b54-9cf5-f9547775471a', '2026-05-26 18:09:46.351986+00', '2026-05-26 18:09:46.351986+00', '2026-05-26 18:09:46.351986+00', '{"eTag": "\"fdcfddba5261adb40490b06e1df91860\"", "size": 530044, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-26T18:09:47.000Z", "contentLength": 530044, "httpStatusCode": 200}', 'ef58f692-75f1-403e-b365-a3120c59690b', '3b392ef7-f898-4b54-9cf5-f9547775471a', '{}'),
	('d1c6cb48-6029-432a-b876-1c88b4177282', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779840987247_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-27 00:16:27.745794+00', '2026-05-27 00:16:27.745794+00', '2026-05-27 00:16:27.745794+00', '{"eTag": "\"00a37222eeba36157b00afd8040abac0\"", "size": 102047, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-27T00:16:28.000Z", "contentLength": 102047, "httpStatusCode": 200}', '7fc05bfd-72e7-4f12-b18b-78fb868037b0', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('3fcf3232-4215-4a00-908c-ed4e672acd49', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779840987850_1.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-27 00:16:28.081049+00', '2026-05-27 00:16:28.081049+00', '2026-05-27 00:16:28.081049+00', '{"eTag": "\"f4f9631c78a040a7c62055d214f3960a\"", "size": 64604, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-27T00:16:29.000Z", "contentLength": 64604, "httpStatusCode": 200}', 'db7d90cb-4634-4b09-87cf-999cf9706552', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('82282e00-bf90-475d-880c-8127645f652a', 'group-avatars', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780003930317.jpg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 21:32:11.246578+00', '2026-05-28 21:32:11.246578+00', '2026-05-28 21:32:11.246578+00', '{"eTag": "\"a792e3ecebda50f4fff4138b9a9261e3\"", "size": 137435, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-05-28T21:32:12.000Z", "contentLength": 137435, "httpStatusCode": 200}', 'c0bbfa71-7882-4729-9714-79f0f501233c', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('0a1bbe9e-3ead-4244-ad16-51662c9b4263', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779840988174_2.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-27 00:16:28.478062+00', '2026-05-27 00:16:28.478062+00', '2026-05-27 00:16:28.478062+00', '{"eTag": "\"a3b21ab9d6ac06a2c63d46f81d1d27d8\"", "size": 123166, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-27T00:16:29.000Z", "contentLength": 123166, "httpStatusCode": 200}', 'f7effedb-9756-49ff-a127-6d2cf6aaa209', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('e36f5427-9fbe-4d44-9d27-5433d78840ce', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779848244117_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-27 02:17:24.66738+00', '2026-05-27 02:17:24.66738+00', '2026-05-27 02:17:24.66738+00', '{"eTag": "\"42ce2ce3dc04582401910a2d9d243b94\"", "size": 194238, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-27T02:17:25.000Z", "contentLength": 194238, "httpStatusCode": 200}', 'b8e3bde9-dcfd-439d-a5c3-f31d0a379720', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('d55e423d-e21d-4d9c-a710-684510356ff9', 'group-avatars', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780004451500.jpg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 21:40:52.384094+00', '2026-05-28 21:40:52.384094+00', '2026-05-28 21:40:52.384094+00', '{"eTag": "\"a792e3ecebda50f4fff4138b9a9261e3\"", "size": 137435, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-05-28T21:40:53.000Z", "contentLength": 137435, "httpStatusCode": 200}', '2c21ab30-dcaa-458e-8efd-0ce26f2d171b', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('3971f8fd-52a2-48f7-bdca-57c3d7f472d9', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779857463882_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-27 04:51:04.436142+00', '2026-05-27 04:51:04.436142+00', '2026-05-27 04:51:04.436142+00', '{"eTag": "\"6fe987d2b07c00cc478add5b10470030\"", "size": 142674, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-27T04:51:05.000Z", "contentLength": 142674, "httpStatusCode": 200}', '8af86e39-5060-4b41-956d-94ee2af2b3e0', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('8668fca7-6d4e-4b02-8ab4-3143723bbbaa', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779857464499_1.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-27 04:51:05.03309+00', '2026-05-27 04:51:05.03309+00', '2026-05-27 04:51:05.03309+00', '{"eTag": "\"77eb663b86c681e19f6b43c59ec26511\"", "size": 289472, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-27T04:51:05.000Z", "contentLength": 289472, "httpStatusCode": 200}', '01931c2e-8591-4019-8c8b-ea224ed520f7', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('eb32de4f-6f84-41cc-8025-ae0dad08011e', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780090986181_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-29 21:51:48.650389+00', '2026-05-29 21:51:48.650389+00', '2026-05-29 21:51:48.650389+00', '{"eTag": "\"7a87a1d28021190d7b17b92e132bb647\"", "size": 27937, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-29T21:51:49.000Z", "contentLength": 27937, "httpStatusCode": 200}', 'b3486ee8-e379-4587-8f46-0c4d76f5276f', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('765d860a-05aa-4192-8f78-99a2031c9351', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779857465091_2.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-27 04:51:05.491871+00', '2026-05-27 04:51:05.491871+00', '2026-05-27 04:51:05.491871+00', '{"eTag": "\"64fe577b18f9bc1ef8cf8325584d6b9d\"", "size": 86092, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-27T04:51:06.000Z", "contentLength": 86092, "httpStatusCode": 200}', 'a6daaffc-df14-42ee-ac4b-1637545d4c2b', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('9dfb3938-4deb-4ab3-9b63-69afcf16eeba', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779857465567_3.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-27 04:51:05.938437+00', '2026-05-27 04:51:05.938437+00', '2026-05-27 04:51:05.938437+00', '{"eTag": "\"17b7542d36ad263799fb9bcaaee8deab\"", "size": 179455, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-27T04:51:06.000Z", "contentLength": 179455, "httpStatusCode": 200}', 'd11c10f9-d20b-4094-a7e1-955886a954d0', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('fcab2783-785f-4028-ae7a-2973b497011e', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779857466025_4.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-27 04:51:06.361979+00', '2026-05-27 04:51:06.361979+00', '2026-05-27 04:51:06.361979+00', '{"eTag": "\"d2f1c6a64089f1255db3683f77ad924d\"", "size": 149662, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-27T04:51:07.000Z", "contentLength": 149662, "httpStatusCode": 200}', '4cb0001a-1ecd-42fa-8068-1b18944d02a3', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('4121dad4-1409-4d5a-be5d-51da6739decd', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779920103064_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-27 22:15:03.974116+00', '2026-05-27 22:15:03.974116+00', '2026-05-27 22:15:03.974116+00', '{"eTag": "\"cdf1a3074808e99c3058a85fb63816ec\"", "size": 195371, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-27T22:15:04.000Z", "contentLength": 195371, "httpStatusCode": 200}', '10c6596e-29b3-46a8-8a25-9c92e2524e20', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('69094742-9992-430d-9e04-305ff2c1386a', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779920103808_1.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-27 22:15:04.721265+00', '2026-05-27 22:15:04.721265+00', '2026-05-27 22:15:04.721265+00', '{"eTag": "\"d22ae1c557d25b330cc66f51ec2d63c1\"", "size": 273153, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-27T22:15:05.000Z", "contentLength": 273153, "httpStatusCode": 200}', '18199eb0-9a54-41c1-af21-42019a3f19fa', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('321c8607-d32c-4488-8b49-d4fdad83da99', 'group-avatars', '0f99790f-05a5-4049-8605-3180bbe889cb/1780015648921.jpg', '0f99790f-05a5-4049-8605-3180bbe889cb', '2026-05-29 00:47:29.715761+00', '2026-05-29 00:47:29.715761+00', '2026-05-29 00:47:29.715761+00', '{"eTag": "\"a344870153ba5f8f4179fff81caaf6d8\"", "size": 81335, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2026-05-29T00:47:30.000Z", "contentLength": 81335, "httpStatusCode": 200}', 'b1749f01-20a3-467f-9c79-4786640b4c0f', '0f99790f-05a5-4049-8605-3180bbe889cb', '{}'),
	('c15f5446-daff-4dc7-82d9-c8456e559211', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779920104408_2.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-27 22:15:05.940073+00', '2026-05-27 22:15:05.940073+00', '2026-05-27 22:15:05.940073+00', '{"eTag": "\"2db8d3791511bd5d88510b768c6bdf87\"", "size": 1172274, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-27T22:15:06.000Z", "contentLength": 1172274, "httpStatusCode": 200}', '9f5ba027-0b59-4f1e-b5c9-1714626979ea', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('51523a38-e086-49c3-b43e-a60437292152', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780091022034_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-29 21:52:23.203072+00', '2026-05-29 21:52:23.203072+00', '2026-05-29 21:52:23.203072+00', '{"eTag": "\"7a87a1d28021190d7b17b92e132bb647\"", "size": 27937, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-29T21:52:24.000Z", "contentLength": 27937, "httpStatusCode": 200}', '3113483f-6091-41df-a85d-6c5b7a83de4f', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('4ec75b61-a596-4d2c-9088-5a8064f0bb45', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779920105633_3.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-27 22:15:06.701822+00', '2026-05-27 22:15:06.701822+00', '2026-05-27 22:15:06.701822+00', '{"eTag": "\"019c84ddd7ae87aa5fa14311601b9e77\"", "size": 747397, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-27T22:15:07.000Z", "contentLength": 747397, "httpStatusCode": 200}', 'bb902085-ba0f-4196-bb8e-6ca62fd6dec8', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('5c01da65-5daa-4531-96a9-5bad9abf98ed', 'Sightings', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780271184103.jpg', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-05-31 23:46:24.765234+00', '2026-05-31 23:46:24.765234+00', '2026-05-31 23:46:24.765234+00', '{"eTag": "\"e2ad7ffa190e19bddd431f674db98391\"", "size": 527693, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-31T23:46:25.000Z", "contentLength": 527693, "httpStatusCode": 200}', 'fa19af7a-e128-4455-acb5-07cfea1b51d6', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('4b80b517-abf7-4884-8a73-4acf567401b2', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779920106401_4.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-27 22:15:07.448728+00', '2026-05-27 22:15:07.448728+00', '2026-05-27 22:15:07.448728+00', '{"eTag": "\"3f3674bca28c36acab1decbd37cddc7d\"", "size": 734425, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-27T22:15:08.000Z", "contentLength": 734425, "httpStatusCode": 200}', '4743ba66-6488-4ef9-bda7-0cf1155eb422', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('0ae66d1e-711f-4a1a-843e-a9009fcc0e39', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779920107154_5.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-27 22:15:08.445484+00', '2026-05-27 22:15:08.445484+00', '2026-05-27 22:15:08.445484+00', '{"eTag": "\"098d6beedec9ba9f6b1e74c8602de746\"", "size": 1167185, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-27T22:15:09.000Z", "contentLength": 1167185, "httpStatusCode": 200}', '74a24a4a-3ad5-4a09-96a5-94e57d13ec61', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('f9eded53-7ce0-491f-94e9-1fcb93a78931', 'Sightings', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780274400063_0.jpg', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-06-01 00:40:00.575961+00', '2026-06-01 00:40:00.575961+00', '2026-06-01 00:40:00.575961+00', '{"eTag": "\"feff4151182382135e8af109f2a00d42\"", "size": 391532, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-01T00:40:01.000Z", "contentLength": 391532, "httpStatusCode": 200}', 'fc124e67-0174-41f6-86d1-10a6003613e7', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('e86a51a6-8cfc-4710-90cd-dda6243a926c', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779943891475_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 04:51:32.702443+00', '2026-05-28 04:51:32.702443+00', '2026-05-28 04:51:32.702443+00', '{"eTag": "\"af9a5d3f156f7256cc1b39df96d65849\"", "size": 166095, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T04:51:33.000Z", "contentLength": 166095, "httpStatusCode": 200}', '3ae113cf-8f54-40a7-add2-12ce9aa3a854', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('9d951a03-729c-45dd-a362-4b9b67cae432', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779943892437_1.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 04:51:33.170657+00', '2026-05-28 04:51:33.170657+00', '2026-05-28 04:51:33.170657+00', '{"eTag": "\"1b0044e8be2564ef2f9a2835713684bc\"", "size": 114286, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T04:51:34.000Z", "contentLength": 114286, "httpStatusCode": 200}', '6cbc6b58-8ec2-4b26-a847-7ca56efb983c', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('af813174-17f5-444a-a05f-82477cdb6501', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779943921691_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 04:52:02.880661+00', '2026-05-28 04:52:02.880661+00', '2026-05-28 04:52:02.880661+00', '{"eTag": "\"af9a5d3f156f7256cc1b39df96d65849\"", "size": 166095, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T04:52:03.000Z", "contentLength": 166095, "httpStatusCode": 200}', '492caeb1-b4a5-4416-8ee0-b58465d481c7', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('5b6a5d6b-be89-473c-b4b3-cd76c9a7ecb4', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779943922633_1.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 04:52:03.356008+00', '2026-05-28 04:52:03.356008+00', '2026-05-28 04:52:03.356008+00', '{"eTag": "\"1b0044e8be2564ef2f9a2835713684bc\"", "size": 114286, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T04:52:04.000Z", "contentLength": 114286, "httpStatusCode": 200}', '87663f84-e117-4649-b111-2de0956281a8', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('e99a27bc-b9a2-4652-865f-0c004443a4eb', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779944789409_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 05:06:30.552829+00', '2026-05-28 05:06:30.552829+00', '2026-05-28 05:06:30.552829+00', '{"eTag": "\"1b0044e8be2564ef2f9a2835713684bc\"", "size": 114286, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T05:06:31.000Z", "contentLength": 114286, "httpStatusCode": 200}', '5e381d11-0c2d-42b0-a56a-2be22aded316', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('3bbd051d-7b21-4626-acf5-d15fa5860383', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780018286296_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-29 01:31:26.856323+00', '2026-05-29 01:31:26.856323+00', '2026-05-29 01:31:26.856323+00', '{"eTag": "\"21febc2f3d5646caee19e0fa54808734\"", "size": 150919, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-29T01:31:27.000Z", "contentLength": 150919, "httpStatusCode": 200}', 'dec26e34-bde0-425b-9024-0fbd9a1d0428', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('0aeedb16-8166-4d0a-ad38-518848fe6840', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779945003692_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 05:10:04.60738+00', '2026-05-28 05:10:04.60738+00', '2026-05-28 05:10:04.60738+00', '{"eTag": "\"af9a5d3f156f7256cc1b39df96d65849\"", "size": 166095, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T05:10:05.000Z", "contentLength": 166095, "httpStatusCode": 200}', 'e68e76f6-48a3-4986-aa03-e094f7e63b33', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('c78c4052-077e-44aa-b5af-dc4d79dd8772', 'avatars', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779952894422.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 07:21:35.201936+00', '2026-05-28 07:21:35.201936+00', '2026-05-28 07:21:35.201936+00', '{"eTag": "\"e7d9b53cde25c6ca9192803c085a8a12\"", "size": 66356, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T07:21:36.000Z", "contentLength": 66356, "httpStatusCode": 200}', 'f7b70cec-e3a7-444c-b8a7-fbc05d3bc1b8', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('4d4f5972-6ec8-4979-bb88-4b13f4c85fe5', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780019071824_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-29 01:44:32.493619+00', '2026-05-29 01:44:32.493619+00', '2026-05-29 01:44:32.493619+00', '{"eTag": "\"21febc2f3d5646caee19e0fa54808734\"", "size": 150919, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-29T01:44:33.000Z", "contentLength": 150919, "httpStatusCode": 200}', '233a60da-9202-42d6-80c7-e3f6bdae5acf', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('da2e8502-618b-4faf-9e04-4f45191e4b3c', 'avatars', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779954526052.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 07:48:46.945202+00', '2026-05-28 07:48:46.945202+00', '2026-05-28 07:48:46.945202+00', '{"eTag": "\"c79e4ab68fda7e24cda30b658300d163\"", "size": 137345, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T07:48:47.000Z", "contentLength": 137345, "httpStatusCode": 200}', 'ce6f3381-d195-46ff-bb55-86e6ee5506ee', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('04fb45bb-f7af-47ac-8eec-e895c2b52438', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779956733132_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 08:25:34.124148+00', '2026-05-28 08:25:34.124148+00', '2026-05-28 08:25:34.124148+00', '{"eTag": "\"af9a5d3f156f7256cc1b39df96d65849\"", "size": 166095, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T08:25:35.000Z", "contentLength": 166095, "httpStatusCode": 200}', '25ebcae8-61ce-48a9-8568-050a37e79727', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('72867a8c-aeb4-481b-936c-65eae7f788f1', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780092647382_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-29 22:19:28.752433+00', '2026-05-29 22:19:28.752433+00', '2026-05-29 22:19:28.752433+00', '{"eTag": "\"7a87a1d28021190d7b17b92e132bb647\"", "size": 27937, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-29T22:19:29.000Z", "contentLength": 27937, "httpStatusCode": 200}', '146d1e41-961a-46dd-bda1-531e6964e970', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('da46734f-0bf0-4867-855c-7c0a3b1097bb', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779956733927_1.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 08:25:34.738764+00', '2026-05-28 08:25:34.738764+00', '2026-05-28 08:25:34.738764+00', '{"eTag": "\"1b0044e8be2564ef2f9a2835713684bc\"", "size": 114286, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T08:25:35.000Z", "contentLength": 114286, "httpStatusCode": 200}', '3da212e9-a7d0-437f-a70f-8e12baebdc42', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('d0bde459-e949-4ea7-ac05-b54a3828bd92', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779956734400_2.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 08:25:35.174376+00', '2026-05-28 08:25:35.174376+00', '2026-05-28 08:25:35.174376+00', '{"eTag": "\"af9a5d3f156f7256cc1b39df96d65849\"", "size": 166095, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T08:25:36.000Z", "contentLength": 166095, "httpStatusCode": 200}', '4dd7d1e0-ffff-4168-8af8-e44ff2f0f286', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('3583f9f2-72d7-4b30-9ae9-7da1f6621a28', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779956734809_3.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 08:25:35.551513+00', '2026-05-28 08:25:35.551513+00', '2026-05-28 08:25:35.551513+00', '{"eTag": "\"1b0044e8be2564ef2f9a2835713684bc\"", "size": 114286, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T08:25:36.000Z", "contentLength": 114286, "httpStatusCode": 200}', '527aa22b-baa3-4e41-be75-d8dcf2cc0d50', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('314778f4-b255-41e3-b264-ab56e1f9d6b3', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1779956735203_4.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-28 08:25:36.051289+00', '2026-05-28 08:25:36.051289+00', '2026-05-28 08:25:36.051289+00', '{"eTag": "\"cdf1a3074808e99c3058a85fb63816ec\"", "size": 195371, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-28T08:25:36.000Z", "contentLength": 195371, "httpStatusCode": 200}', '9b9976a2-a687-4117-b5df-19246d509ecd', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('d135138c-ee26-40d1-a197-0293040b4b18', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780018862598_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-29 01:41:03.269317+00', '2026-05-29 01:41:03.269317+00', '2026-05-29 01:41:03.269317+00', '{"eTag": "\"21febc2f3d5646caee19e0fa54808734\"", "size": 150919, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-29T01:41:04.000Z", "contentLength": 150919, "httpStatusCode": 200}', '76aa5963-4b6c-4c6a-9a7f-a89bc2c103bc', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('088dfba2-b1e4-49ff-a9fa-6b5e35ca1b6a', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780018863341_1.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-29 01:41:03.567345+00', '2026-05-29 01:41:03.567345+00', '2026-05-29 01:41:03.567345+00', '{"eTag": "\"8d1990074dcd004809ef2f853ec070d5\"", "size": 20310, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-29T01:41:04.000Z", "contentLength": 20310, "httpStatusCode": 200}', 'ec25da63-85a9-4887-88eb-3d7503bfea34', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('2708dcee-9721-4228-80ab-cf55e06ef5de', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780092681335_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-29 22:20:02.579124+00', '2026-05-29 22:20:02.579124+00', '2026-05-29 22:20:02.579124+00', '{"eTag": "\"7a87a1d28021190d7b17b92e132bb647\"", "size": 27937, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-29T22:20:03.000Z", "contentLength": 27937, "httpStatusCode": 200}', '6e5a6a94-df69-4f0a-80f1-81d73b52c69b', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('4c2d1e7c-4ea6-4125-87e4-f90bbf6d35e8', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780092733761_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-05-29 22:20:55.06196+00', '2026-05-29 22:20:55.06196+00', '2026-05-29 22:20:55.06196+00', '{"eTag": "\"7a87a1d28021190d7b17b92e132bb647\"", "size": 27937, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-29T22:20:55.000Z", "contentLength": 27937, "httpStatusCode": 200}', '45a6bde5-969e-4f54-b302-3ebf69a77a73', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('c5bba63a-5e54-4221-8e47-a5c0e3aef339', 'Sightings', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780271909530.jpg', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-05-31 23:58:30.389776+00', '2026-05-31 23:58:30.389776+00', '2026-05-31 23:58:30.389776+00', '{"eTag": "\"b04bfc6ea906070975465b6cd69f1731\"", "size": 438208, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-31T23:58:31.000Z", "contentLength": 438208, "httpStatusCode": 200}', 'b1fe82d8-1415-40b0-ab95-914e8030af12', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('4f3d7ad4-623a-4444-91bc-52262ce21af5', 'Sightings', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780271909552.jpg', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-05-31 23:58:30.441781+00', '2026-05-31 23:58:30.441781+00', '2026-05-31 23:58:30.441781+00', '{"eTag": "\"b04bfc6ea906070975465b6cd69f1731\"", "size": 438208, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-31T23:58:31.000Z", "contentLength": 438208, "httpStatusCode": 200}', 'd7516ba0-ae4a-40ca-8bfe-35c9aee8dc44', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('8ba8ece0-fb3e-4346-ac42-e5b6f09b4665', 'Sightings', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780274144969_0.jpg', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-06-01 00:35:45.451267+00', '2026-06-01 00:35:45.451267+00', '2026-06-01 00:35:45.451267+00', '{"eTag": "\"5e34bc69c402d9c04be4fe7fc6ababee\"", "size": 343069, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-01T00:35:46.000Z", "contentLength": 343069, "httpStatusCode": 200}', 'f175ec48-389a-430d-8545-9b3e319a5938', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('0d1fed97-90c1-4292-9a49-6fbc37d958c4', 'Sightings', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780274150596_0.jpg', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-06-01 00:35:51.003422+00', '2026-06-01 00:35:51.003422+00', '2026-06-01 00:35:51.003422+00', '{"eTag": "\"5e34bc69c402d9c04be4fe7fc6ababee\"", "size": 343069, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-01T00:35:51.000Z", "contentLength": 343069, "httpStatusCode": 200}', 'f2b13de4-8f7b-4f9d-a61c-5b9e39a811d4', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('e670e0a5-34fc-4d16-aad1-63b5d4966a61', 'Sightings', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780275577242.heic', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-06-01 00:59:38.07841+00', '2026-06-01 00:59:38.07841+00', '2026-06-01 00:59:38.07841+00', '{"eTag": "\"170ccf89e6d4d04e5753a5063bf47337\"", "size": 952761, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-01T00:59:38.000Z", "contentLength": 952761, "httpStatusCode": 200}', 'bdd3eefd-36e9-49ca-91a5-533b0cad7a9a', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('36191214-10e4-4b18-bbef-a7d54499310d', 'Sightings', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780283961469_0.jpg', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-06-01 03:19:22.462124+00', '2026-06-01 03:19:22.462124+00', '2026-06-01 03:19:22.462124+00', '{"eTag": "\"dbc3bf67bb8e634e380c1b2c84bbe94a\"", "size": 367534, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-01T03:19:23.000Z", "contentLength": 367534, "httpStatusCode": 200}', '0bdc5d87-1e19-4c10-ac42-00b1290e8900', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('193d4b69-b06e-4120-a7bb-f2dfd83d0c8b', 'avatars', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780284298212.jpg', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-06-01 03:24:58.838646+00', '2026-06-01 03:24:58.838646+00', '2026-06-01 03:24:58.838646+00', '{"eTag": "\"e3f0e65778745de245981e2cdeea35e2\"", "size": 435235, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-01T03:24:59.000Z", "contentLength": 435235, "httpStatusCode": 200}', '7d422ff0-2ca5-4c68-a5f7-4f2f2f194aca', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('27270c4f-eddf-4013-8d80-9c70feea5c96', 'Sightings', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780285019108_0.jpg', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-06-01 03:36:59.659392+00', '2026-06-01 03:36:59.659392+00', '2026-06-01 03:36:59.659392+00', '{"eTag": "\"cc306e8834fdf8b881acf71cc9395b4a\"", "size": 358427, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-01T03:37:00.000Z", "contentLength": 358427, "httpStatusCode": 200}', 'a0de0a05-0e2e-461a-8042-de0db98adbee', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('4234af57-f7c9-4b28-82bd-bbbbfc3f81b6', 'Sightings', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780285160789_0.jpg', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-06-01 03:39:21.317048+00', '2026-06-01 03:39:21.317048+00', '2026-06-01 03:39:21.317048+00', '{"eTag": "\"deba661d3a7256c551d2e6558a56b551\"", "size": 319024, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-01T03:39:22.000Z", "contentLength": 319024, "httpStatusCode": 200}', '463a94a3-d2b5-47b9-b7a0-d42cf55ed421', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('83ac85c4-5838-47c5-844f-e00bb638ed39', 'Sightings', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780285938716_0.jpg', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-06-01 03:52:19.343663+00', '2026-06-01 03:52:19.343663+00', '2026-06-01 03:52:19.343663+00', '{"eTag": "\"1bd2fb687ebfce5615e1009ca895c570\"", "size": 311508, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-01T03:52:20.000Z", "contentLength": 311508, "httpStatusCode": 200}', '22fc04f5-183c-45df-b859-5015fa2b271f', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('4c188afa-007e-4f2f-84b9-d58d0cfcf835', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780285989529_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-01 03:53:10.005187+00', '2026-06-01 03:53:10.005187+00', '2026-06-01 03:53:10.005187+00', '{"eTag": "\"0c3470c4fc52944c0da7787a7ddcfb30\"", "size": 138708, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-01T03:53:10.000Z", "contentLength": 138708, "httpStatusCode": 200}', '646c6edc-7ad6-4332-9e73-025ef315a872', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('6cc468d5-6e1a-4c2e-aa21-ff9b0bdbdf60', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780286230564_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-01 03:57:11.085957+00', '2026-06-01 03:57:11.085957+00', '2026-06-01 03:57:11.085957+00', '{"eTag": "\"3d4b9b7603e04b13291fb3615319d246\"", "size": 142474, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-01T03:57:12.000Z", "contentLength": 142474, "httpStatusCode": 200}', 'b8943903-e1c0-40c3-a5d7-06588c8e301f', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('e4c56751-9df2-4e34-be72-147e841db47d', 'Sightings', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780286421556_0.jpg', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-06-01 04:00:22.359063+00', '2026-06-01 04:00:22.359063+00', '2026-06-01 04:00:22.359063+00', '{"eTag": "\"495e6d6725e597a63bed02079558a380\"", "size": 334896, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-01T04:00:23.000Z", "contentLength": 334896, "httpStatusCode": 200}', '32f20736-06ed-4dd6-a92f-b570f987589b', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('3ee45515-5e24-4c59-b92e-7b4073288f28', 'Sightings', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3/1780289098150_0.jpg', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '2026-06-01 04:44:58.951498+00', '2026-06-01 04:44:58.951498+00', '2026-06-01 04:44:58.951498+00', '{"eTag": "\"0d24d2188fbe7f899199c95164bbed99\"", "size": 361213, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-01T04:44:59.000Z", "contentLength": 361213, "httpStatusCode": 200}', '7bb8bf8c-cc23-4cc6-9d1c-afa39014be69', 'dc8e0ffd-57c0-4017-adbe-83e1b17cfea3', '{}'),
	('45be9ef8-88fa-41d0-9ddc-2916c56dd61f', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780683556437_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-05 18:19:20.003858+00', '2026-06-05 18:19:20.003858+00', '2026-06-05 18:19:20.003858+00', '{"eTag": "\"7f73c3eae3611b283e16c664f5a15adf\"", "size": 546856, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-05T18:19:20.000Z", "contentLength": 546856, "httpStatusCode": 200}', '6f9ca40b-28e2-4eca-b7e1-ece4d1d34dbb', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('46b3cbe6-f577-4051-8612-3240b7468894', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780683560016_1.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-05 18:19:21.999094+00', '2026-06-05 18:19:21.999094+00', '2026-06-05 18:19:21.999094+00', '{"eTag": "\"c8abfd742aa193d257aa8db566a28856\"", "size": 529589, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-05T18:19:22.000Z", "contentLength": 529589, "httpStatusCode": 200}', 'f94c6791-8566-45e2-9227-135bf5256c82', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('9de93a97-95f0-4ba9-8c71-1bbd66a1add7', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780683561986_2.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-05 18:19:23.968766+00', '2026-06-05 18:19:23.968766+00', '2026-06-05 18:19:23.968766+00', '{"eTag": "\"95a2e7ff193abfdbdba2528c6a562262\"", "size": 551470, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-05T18:19:24.000Z", "contentLength": 551470, "httpStatusCode": 200}', 'bbaf30a7-8d59-429f-84dd-a23f8c904b1a', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('967923a0-6c2a-41ca-a946-b98a6cdf769a', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780683564004_3.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-05 18:19:26.682632+00', '2026-06-05 18:19:26.682632+00', '2026-06-05 18:19:26.682632+00', '{"eTag": "\"c129afb3e133a6f824823d3f586d9de8\"", "size": 508182, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-05T18:19:27.000Z", "contentLength": 508182, "httpStatusCode": 200}', '97d8ca9d-3bca-48db-b1b7-1e7e3fe644bb', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('9899a20c-8b73-4828-84c5-e14c28ca10e9', 'Sightings', '0f99790f-05a5-4049-8605-3180bbe889cb/1780691731407_0.jpeg', '0f99790f-05a5-4049-8605-3180bbe889cb', '2026-06-05 20:35:33.635709+00', '2026-06-05 20:35:33.635709+00', '2026-06-05 20:35:33.635709+00', '{"eTag": "\"c8abfd742aa193d257aa8db566a28856\"", "size": 529589, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-05T20:35:34.000Z", "contentLength": 529589, "httpStatusCode": 200}', 'cefcd9a9-6b1d-4016-b290-1b865d197a41', '0f99790f-05a5-4049-8605-3180bbe889cb', '{}'),
	('18feb476-34ad-4a3b-a307-9fc247e7fda6', 'Sightings', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec/1780708906075_0.jpeg', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '2026-06-06 01:30:47.472589+00', '2026-06-06 01:30:47.472589+00', '2026-06-06 01:30:47.472589+00', '{"eTag": "\"7a87a1d28021190d7b17b92e132bb647\"", "size": 27937, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-06T01:30:48.000Z", "contentLength": 27937, "httpStatusCode": 200}', '8c568102-4a09-414b-9658-497d7a708599', '7e96ecc2-2814-42da-bf7a-7d7a899e81ec', '{}'),
	('c91dc83d-fa4d-4808-9df2-19bbb36f5031', 'Sightings', '0f99790f-05a5-4049-8605-3180bbe889cb/1780709477154_0.jpeg', '0f99790f-05a5-4049-8605-3180bbe889cb', '2026-06-06 01:31:18.099779+00', '2026-06-06 01:31:18.099779+00', '2026-06-06 01:31:18.099779+00', '{"eTag": "\"0f17b7f9cbcfa148615751770fc03d62\"", "size": 664526, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-06T01:31:18.000Z", "contentLength": 664526, "httpStatusCode": 200}', 'f6b2c322-a501-409b-abe3-d89d3fd962bf', '0f99790f-05a5-4049-8605-3180bbe889cb', '{}');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 629, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict OCPJqk8qEGOlOU64Sorskmvy9iuUPt1mT0QYrMldMLfF6E3y7q3Adov6xfypfMJ

RESET ALL;
