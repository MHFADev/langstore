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
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function migrate() {
  console.log('');
  console.log('🚀 Lang STR - Supabase Auto Migration');
  console.log('======================================');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  // --- Read schema file ---
  const schemaPath = path.join(__dirname, '../src/lib/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Error: Schema file not found at ${schemaPath}`);
    process.exit(1);
  }
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  console.log('📄 Schema file loaded:', schemaPath);

  // --- Try Direct Postgres Connection (Recommended) ---
  if (databaseUrl) {
    console.log('🔗 Database URL detected. Using direct Postgres connection...');
    const client = new Client({ connectionString: databaseUrl });
    try {
      await client.connect();
      console.log('✅ Connected to Postgres directly');
      await client.query(schemaSql);
      console.log('🎉 Schema executed successfully via direct connection!');
      await client.end();
      return;
    } catch (pgErr) {
      console.warn('⚠️  Direct Postgres connection failed:', pgErr.message);
      console.log('🔄 Falling back to Supabase REST API...');
      if (client) await client.end().catch(() => {});
    }
  }

  // --- Fallback to Supabase REST/RPC ---
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Supabase URL or Service Role Key missing and no DATABASE_URL found.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  console.log('✅ Supabase client initialized');

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ sql: schemaSql }),
    });

    if (response.ok) {
      console.log('🎉 Schema executed successfully via RPC!');
      return;
    }

    const body = await response.json().catch(() => ({}));
    if (body?.message?.includes('function') || response.status === 404) {
      console.log('⚙️  exec_sql helper not found. Trying individual statement execution...');
      await runStatementsFallback(supabaseUrl, serviceRoleKey, schemaSql);
    } else {
      throw new Error(`RPC failed (${response.status}): ${JSON.stringify(body)}`);
    }
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.log('');
    console.log('💡 Tips:');
    console.log('   1. Pastikan exec_sql function sudah ada di Supabase Dashboard SQL Editor.');
    console.log('   2. ATAU tambahkan DATABASE_URL ke .env.local untuk koneksi langsung yang lebih stabil.');
    // Don't exit with 1 if it's already partially set up, but for now we keep it strict
    process.exit(1);
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

async function runStatementsFallback(supabaseUrl, serviceRoleKey, schemaSql) {
  const statements = splitSqlStatements(schemaSql);
  console.log(`   Executing ${statements.length} statements individually...`);
  console.log('   ⚠️  NOTE: Individual statement execution via REST still requires "exec_sql" function.');
  console.log('   Please run the SQL once in Supabase SQL Editor to bootstrap the system.');
  
  throw new Error('exec_sql function missing. Manual setup required once.');
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
