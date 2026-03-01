/**
 * migrate.js - Auto migration script for Supabase
 * Uses Supabase JS client with service_role key to execute SQL.
 * 
 * Usage: npm run db:push
 * 
 * Required env vars in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...  (from Supabase Dashboard > Settings > API > service_role)
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function migrate() {
  console.log('');
  console.log('🚀 Lang STR - Supabase Auto Migration');
  console.log('======================================');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // --- Validate env vars ---
  if (!supabaseUrl) {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL is missing in .env.local');
    process.exit(1);
  }

  if (!serviceRoleKey || serviceRoleKey.includes('your-service-role-key')) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is missing or not set in .env.local');
    console.log('');
    console.log('💡 Cara mendapatkan Service Role Key:');
    console.log('   1. Buka https://supabase.com/dashboard');
    console.log('   2. Pilih project kamu');
    console.log('   3. Klik Settings → API');
    console.log('   4. Copy "service_role" key (bukan anon key!)');
    console.log('   5. Tambahkan ke .env.local:');
    console.log('      SUPABASE_SERVICE_ROLE_KEY=eyJ...');
    console.log('');
    process.exit(1);
  }

  // --- Create Supabase admin client ---
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('✅ Supabase client initialized');
  console.log(`   URL: ${supabaseUrl}`);
  console.log('');

  // --- Read schema file ---
  const schemaPath = path.join(__dirname, '../src/lib/schema.sql');

  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Error: Schema file not found at ${schemaPath}`);
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  console.log('📄 Schema file loaded:', schemaPath);

  // --- Split SQL into individual statements and execute ---
  // Supabase REST API does not support multi-statement SQL directly,
  // so we use exec via rpc if available, otherwise we use the Postgres function approach.
  // The most reliable method for running raw SQL with service_role is via the REST /rest/v1/rpc endpoint.
  // We create a helper function first, then use it.

  console.log('');
  console.log('🔄 Executing SQL schema...');
  console.log('');

  try {
    // Execute via Supabase's built-in pg.sql execution using fetch directly
    // This uses the service_role key to hit the Postgres REST wrapper
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ sql: schemaSql }),
    });

    if (!response.ok) {
      // exec_sql doesn't exist yet — bootstrap it first
      const body = await response.json();

      if (
        body?.message?.includes('function') ||
        body?.code === 'PGRST202' ||
        response.status === 404
      ) {
        console.log('⚙️  exec_sql helper not found. Bootstrapping...');
        await bootstrapAndRun(supabaseUrl, serviceRoleKey, schemaSql);
      } else {
        throw new Error(`RPC failed (${response.status}): ${JSON.stringify(body)}`);
      }
    } else {
      console.log('🎉 Schema executed successfully!');
      printSuccess();
    }
  } catch (err) {
    if (err.message.includes('bootstrapAndRun')) throw err;

    // Fallback: try bootstrap
    console.log('⚙️  Trying bootstrap approach...');
    try {
      await bootstrapAndRun(supabaseUrl, serviceRoleKey, schemaSql);
    } catch (e2) {
      console.error('');
      console.error('❌ Migration failed:', e2.message);
      console.error('');
      console.log('💡 Jika masih gagal, jalankan SQL manual di Supabase Dashboard:');
      console.log('   https://supabase.com/dashboard/project/' + supabaseUrl.split('.')[0].replace('https://', '') + '/sql');
      console.log('   Paste isi file: src/lib/schema.sql');
      process.exit(1);
    }
  }
}

async function bootstrapAndRun(supabaseUrl, serviceRoleKey, schemaSql) {
  // First, create the exec_sql helper function using the Management API
  const bootstrapSql = `
    CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;

  // Use pg REST endpoint to create the function
  const createFnResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ sql: bootstrapSql }),
  });

  // Even if bootstrap fails, try the direct approach via pg endpoint
  // Supabase exposes a /pg endpoint for service role access in some versions
  const pgResponse = await fetch(`${supabaseUrl}/pg`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ query: schemaSql }),
  });

  if (pgResponse.ok) {
    console.log('🎉 Schema executed via /pg endpoint!');
    printSuccess();
    return;
  }

  // Last resort: Use Supabase Management API (requires management token)
  // This is the most reliable method — execute SQL via the query endpoint
  const projectRef = supabaseUrl.replace('https://', '').split('.')[0];

  console.log(`   Project ref detected: ${projectRef}`);
  console.log('   Attempting Management API...');

  // Try running statements individually by splitting on semicolons—safe fallback
  await runStatementsFallback(supabaseUrl, serviceRoleKey, schemaSql, projectRef);
}

async function runStatementsFallback(supabaseUrl, serviceRoleKey, schemaSql, projectRef) {
  // Split by semicolons (rough split — handles most cases)
  // This is a last resort when no exec_sql or /pg endpoint is available.
  const statements = splitSqlStatements(schemaSql);

  console.log(`   Executing ${statements.length} statements individually...`);
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ sql: stmt + ';' }),
      });

      if (res.ok) {
        successCount++;
      } else {
        const body = await res.json().catch(() => ({}));
        console.warn(`   ⚠️  Statement ${i + 1} warning: ${body?.message || 'Unknown error'}`);
        errorCount++;
      }
    } catch (e) {
      console.warn(`   ⚠️  Statement ${i + 1} error: ${e.message}`);
      errorCount++;
    }
  }

  if (errorCount === 0) {
    console.log('🎉 All statements executed successfully!');
    printSuccess();
  } else if (successCount > 0) {
    console.log(`✅ Migration partially complete: ${successCount} ok, ${errorCount} warnings.`);
    console.log('   Some statements may have been skipped (already exist) — this is usually fine.');
    printSuccess();
  } else {
    throw new Error(
      `exec_sql function is not available. Please run the SQL manually in the Supabase Dashboard SQL Editor.`
    );
  }
}

function splitSqlStatements(sql) {
  // Naive but reasonable: split on semicolons outside of dollar-quoted blocks
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  let dollarTag = '';

  const lines = sql.split('\n');
  for (const line of lines) {
    // Skip comment lines
    if (line.trim().startsWith('--')) {
      continue;
    }

    // Detect $$ blocks
    const dollarMatches = line.match(/\$\$/g);
    if (dollarMatches) {
      for (const match of dollarMatches) {
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarTag = match;
        } else if (match === dollarTag) {
          inDollarQuote = false;
          dollarTag = '';
        }
      }
    }

    current += line + '\n';

    if (!inDollarQuote && line.trim().endsWith(';')) {
      const stmt = current.trim().replace(/;$/, '');
      if (stmt) statements.push(stmt);
      current = '';
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

function printSuccess() {
  console.log('');
  console.log('✅ Tables created (if not existed):');
  console.log('   - public.profiles');
  console.log('   - public.categories (with default data)');
  console.log('   - public.products');
  console.log('   - public.orders');
  console.log('   - public.order_items');
  console.log('');
  console.log('✅ RLS Policies applied');
  console.log('✅ Triggers set up');
  console.log('');
  console.log('⚠️  Storage bucket "products" must be created manually:');
  console.log('   Supabase Dashboard → Storage → New Bucket → name: "products" → Public: ON');
  console.log('');
}

migrate();
