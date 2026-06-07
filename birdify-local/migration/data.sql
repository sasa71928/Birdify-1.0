INSERT INTO public.birds (common_name, scientific_name, description, season, habitat_info, ideal_zones) VALUES
('Águila Real', 'Aquila chrysaetos', 'Gran ave de presa de plumaje marrón oscuro y cabeza dorada.', 'Todo el año', 'Zonas montañosas y llanuras abiertas.', 'Montañas'),
('Colibrí Orejivioleta', 'Colibri coruscans', 'Pequeño y vibrante, con plumaje verde y orejas violetas.', 'Primavera y Verano', 'Bosques tropicales y jardines.', 'Selvas y zonas húmedas'),
('Tucán Toco', 'Ramphastos toco', 'Conocido por su enorme pico naranja y cuerpo negro.', 'Todo el año', 'Selvas y bosques tropicales.', 'Zonas tropicales'),
('Guacamayo Rojo', 'Ara macao', 'Loro grande y colorido, principalmente rojo con alas azules y amarillas.', 'Todo el año', 'Selvas densas.', 'Zonas tropicales'),
('Búho Nival', 'Bubo scandiacus', 'Ave rapaz nocturna de plumaje blanco.', 'Invierno', 'Tundra y zonas abiertas nevadas.', 'Tundra'),
('Pingüino Emperador', 'Aptenodytes forsteri', 'Ave marina no voladora adaptada al frío extremo.', 'Todo el año', 'Hielo antártico.', 'Zonas polares'),
('Flamenco Rosado', 'Phoenicopterus roseus', 'Ave zancuda de color rosa, pico curvado.', 'Verano', 'Lagunas saladas y humedales.', 'Humedales'),
('Cóndor de los Andes', 'Vultur gryphus', 'Una de las aves voladoras más grandes del mundo, carroñera.', 'Todo el año', 'Altas montañas y costas.', 'Cordillera de los Andes'),
('Pavo Real', 'Pavo cristatus', 'Conocido por la impresionante cola en forma de abanico de los machos.', 'Primavera', 'Bosques y zonas de cultivo.', 'Zonas templadas y cálidas'),
('Cisne Cuellinegro', 'Cygnus melancoryphus', 'Cisne sudamericano blanco con cabeza y cuello negros.', 'Todo el año', 'Lagos y humedales de agua dulce.', 'Lagos patagónicos'),
('Gorrión Común', 'Passer domesticus', 'Ave pequeña muy adaptada a entornos urbanos.', 'Todo el año', 'Zonas urbanas y rurales.', 'Ciudades y granjas'),
('Ruiseñor', 'Luscinia megarhynchos', 'Famoso por su melodioso canto nocturno.', 'Primavera y Verano', 'Bosques frondosos y jardines espesos.', 'Zonas boscosas'),
('Martín Pescador', 'Alcedo atthis', 'Ave pequeña, muy colorida, que pesca lanzándose al agua.', 'Todo el año', 'Ríos y lagos limpios.', 'Ríos'),
('Pelícano Blanco', 'Pelecanus onocrotalus', 'Gran ave acuática con una bolsa debajo del pico para pescar.', 'Todo el año', 'Lagos, deltas y costas.', 'Costas'),
('Golondrina Común', 'Hirundo rustica', 'Ave migratoria con cola ahorquillada.', 'Primavera y Verano', 'Campos abiertos cerca de construcciones humanas.', 'Zonas rurales'),
('Avestruz', 'Struthio camelus', 'Ave no voladora de gran tamaño y rápida corredora.', 'Todo el año', 'Sabanas y zonas semidesérticas.', 'Sabana'),
('Mirlo Común', 'Turdus merula', 'Ave oscura con pico amarillo, muy común en jardines.', 'Todo el año', 'Jardines, parques y bosques.', 'Zonas urbanas'),
('Halcón Peregrino', 'Falco peregrinus', 'Ave de presa conocida por su extrema velocidad en picada.', 'Todo el año', 'Acantilados y también rascacielos.', 'Acantilados y ciudades'),
('Cardenal Norteño', 'Cardinalis cardinalis', 'Ave cantora de color rojo brillante con cresta.', 'Todo el año', 'Jardines, bosques y matorrales.', 'Zonas arboladas'),
('Gaviota Reidora', 'Chroicocephalus ridibundus', 'Ave marina que frecuenta costas y aguas interiores.', 'Todo el año', 'Zonas costeras y humedales.', 'Costas y lagos')
ON CONFLICT DO NOTHING;


-- ── SEEDING USUARIOS ──────────────────────────────────────────────────
-- Insertar en auth.users
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, is_anonymous
) VALUES 
(
    '00000000-0000-0000-0000-000000000000', '9ef1462b-9ffd-4845-bf3c-9fffcc9309cf', 
    'authenticated', 'authenticated', 'icofi775@gmail.com', 
    '$2a$10$0DY6wi6IPSuBMlvJGeTBwucVCjtvJYHayQHtkYkZx9mkgyxdqOby6', '2026-06-07 20:05:23.36855+00',
    '{"provider": "email", "providers": ["email"]}', 
    '{"fullname": "ivan23", "username": "ivan2", "profile_pic_url": "http://192.168.0.104:8000/storage/v1/object/public/avatars/9ef1462b-9ffd-4845-bf3c-9fffcc9309cf/1780865923460.jpeg"}',
    false, '2026-06-07 19:32:25.283101+00', '2026-06-07 22:04:31.084365+00', false
),
(
    '00000000-0000-0000-0000-000000000000', 'a4fe4b3f-ca04-481d-aff9-ac8ba8909dce', 
    'authenticated', 'authenticated', 'pepe@test.com', 
    '$2a$10$Yj1Ap4ZhSRNQ0s.amMbaxO05lXBeXegImubi2SLT0ZNOvLyjezzJC', '2026-06-07 20:00:00+00',
    '{"provider": "email", "providers": ["email"]}', 
    '{"fullname": "jsjs", "username": "jdiz", "profile_pic_url": "https://gravatar.com/avatar/?d=mp"}',
    false, '2026-06-07 19:50:53.599287+00', '2026-06-07 19:50:53.613039+00', false
),
(
    '00000000-0000-0000-0000-000000000000', 'f782cb90-a54c-473d-9d7a-8f921d23eb64', 
    'authenticated', 'authenticated', 'usuario3@test.com', 
    '$2a$10$Y5N7OoCJQkjHJVvYbPS0H.chURaBFkgK4PV4f/ejY2yTBnwttjNLK', '2026-06-07 20:00:00+00',
    '{"provider": "email", "providers": ["email"]}', 
    '{"fullname": "Usuario Tres", "username": "usuario3", "profile_pic_url": "https://gravatar.com/avatar/?d=mp"}',
    false, '2026-06-07 20:10:00+00', '2026-06-07 20:10:00+00', false
),
(
    '00000000-0000-0000-0000-000000000000', '8e0ec7d9-dbcb-460d-a810-ca6ad9f76aa3', 
    'authenticated', 'authenticated', 'jose23@gmail.com', 
    '$2a$10$jYbk0Gi7CZarEGKN0z92zuZOUsiKyms0Y/6Ecdy9kGX6NLTdWuxHK', '2026-06-07 22:12:00+00',
    '{"provider": "email", "providers": ["email"]}', 
    '{"fullname": "jose", "username": "joselito", "profile_pic_url": "https://gravatar.com/avatar/?d=mp"}',
    false, '2026-06-07 22:12:21.397116+00', '2026-06-07 22:12:21.407585+00', false
)
ON CONFLICT (id) DO NOTHING;

-- Insertar en auth.identities
INSERT INTO auth.identities (
    id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
) VALUES
(
    '5370d5d0-efd7-4d9d-b01b-592f6e57590b', '9ef1462b-9ffd-4845-bf3c-9fffcc9309cf', 
    '9ef1462b-9ffd-4845-bf3c-9fffcc9309cf', 'email', 
    '{"sub": "9ef1462b-9ffd-4845-bf3c-9fffcc9309cf", "email": "icofi775@gmail.com", "email_verified": false, "phone_verified": false}',
    '2026-06-07 19:32:25.283101+00', '2026-06-07 19:32:25.283101+00', '2026-06-07 19:32:25.283101+00'
),
(
    '079d2823-d7ff-48fd-8271-eb933cfce9a2', 'a4fe4b3f-ca04-481d-aff9-ac8ba8909dce', 
    'a4fe4b3f-ca04-481d-aff9-ac8ba8909dce', 'email', 
    '{"sub": "a4fe4b3f-ca04-481d-aff9-ac8ba8909dce", "email": "pepe@test.com", "email_verified": false, "phone_verified": false}',
    '2026-06-07 19:50:53.599287+00', '2026-06-07 19:50:53.599287+00', '2026-06-07 19:50:53.599287+00'
),
(
    'e9227183-12ad-48ca-b649-623b70cb3e23', 'f782cb90-a54c-473d-9d7a-8f921d23eb64', 
    'f782cb90-a54c-473d-9d7a-8f921d23eb64', 'email', 
    '{"sub": "f782cb90-a54c-473d-9d7a-8f921d23eb64", "email": "usuario3@test.com", "email_verified": false, "phone_verified": false}',
    '2026-06-07 20:10:00+00', '2026-06-07 20:10:00+00', '2026-06-07 20:10:00+00'
),
(
    '019338c5-4246-4465-8f4f-1117e908ef14', '8e0ec7d9-dbcb-460d-a810-ca6ad9f76aa3', 
    '8e0ec7d9-dbcb-460d-a810-ca6ad9f76aa3', 'email', 
    '{"sub": "8e0ec7d9-dbcb-460d-a810-ca6ad9f76aa3", "email": "jose23@gmail.com", "email_verified": false, "phone_verified": false}',
    '2026-06-07 22:12:21.397116+00', '2026-06-07 22:12:21.397116+00', '2026-06-07 22:12:21.397116+00'
)
ON CONFLICT (id) DO NOTHING;

-- Insertar en public.users
INSERT INTO public.users (
    id, email, username, fullname, profile_pic_url, is_private, is_verified, user_level, created_at
) VALUES 
(
    '9ef1462b-9ffd-4845-bf3c-9fffcc9309cf', 'icofi775@gmail.com', 'ivan2', 'ivan23', 
    'http://192.168.0.104:8000/storage/v1/object/public/avatars/9ef1462b-9ffd-4845-bf3c-9fffcc9309cf/1780865923460.jpeg', 
    false, false, 'general', '2026-06-07 20:13:08.714643+00'
),
(
    'a4fe4b3f-ca04-481d-aff9-ac8ba8909dce', 'pepe@test.com', 'jdiz', 'jsjs', 
    'https://gravatar.com/avatar/?d=mp', 
    false, false, 'general', '2026-06-07 19:50:53.599287+00'
),
(
    'f782cb90-a54c-473d-9d7a-8f921d23eb64', 'usuario3@test.com', 'usuario3', 'Usuario Tres', 
    'https://gravatar.com/avatar/?d=mp', 
    false, false, 'general', '2026-06-07 20:10:00+00'
),
(
    '8e0ec7d9-dbcb-460d-a810-ca6ad9f76aa3', 'jose23@gmail.com', 'joselito', 'jose', 
    'https://gravatar.com/avatar/?d=mp', 
    false, false, 'general', '2026-06-07 22:12:21.397116+00'
)
ON CONFLICT (id) DO NOTHING;

