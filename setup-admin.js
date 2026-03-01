/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createAdminUser() {
  const email = 'admin@langstr.com';
  const password = 'PasswordAdmin123!';

  console.log(`Mencoba membuat Admin User dengan Email: ${email}`);

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { role: 'admin' }
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
         console.log('User admin sudah ada. Mencoba update password...');
         const { data: usersData } = await supabase.auth.admin.listUsers();
         const existingUser = usersData?.users.find(u => u.email === email);
         
         if (existingUser) {
             const { error: updateError } = await supabase.auth.admin.updateUserById(
                 existingUser.id,
                 { password: password }
             );
             if (updateError) throw updateError;
             console.log(`✅ Password untuk ${email} berhasil direset ke: ${password}`);
         }
      } else {
          throw authError;
      }
    } else {
        console.log(`✅ User admin berhasil dibuat!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    }
  } catch (err) {
    console.error('❌ Terjadi kesalahan:', err);
  }
}

createAdminUser();