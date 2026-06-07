const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'http://192.168.0.104:8000';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceKey) {
  console.error('No key');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);
async function createUser() {
  const email = 'test_user_' + Math.floor(Math.random() * 10000) + '@example.com';
  const password = 'password123';
  const username = 'TestUser' + Math.floor(Math.random() * 1000);
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { username, fullname: 'Test User Automático' }
  });
  if (error) {
    console.error(error.message);
  } else {
    console.log('? Usuario creado exitosamente!');
    console.log('Email:', email);
    console.log('Contraseña:', password);
  }
}
createUser();
