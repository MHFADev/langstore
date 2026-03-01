/**
 * migrate.js - Robust Auto Migration for Supabase
 * Features:
 * 1.  Direct Postgres support (via DATABASE_URL).
 * 2.  REST/RPC fallback (via SUPABASE_URL + SERVICE_ROLE_KEY).
 * 3.  Migrations tracking table (_migrations).
 * 4.  Support for incremental migrations in `scripts/migrations/*.sql`.
 * 5.  Idempotent schema execution.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const crypto = require('crypto');
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

async function runSql(sql, client = null) {
  if (client) {
    return await client.query(sql);
  }
  
  // REST RPC Fallback
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`RPC exec_sql failed (${response.status}): ${errorBody.message || JSON.stringify(errorBody)}`);
  }
  return true;
}

async function getAppliedMigrations(client = null) {
  const query = "SELECT name FROM _migrations";
  if (client) {
    try {
      const { rows } = await client.query(query);
      return rows.map(r => r.name);
    } catch (e) {
      if (e.message.includes('relation "_migrations" does not exist')) return [];
      throw e;
    }
  }

  // RPC variant for listing migrations
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql: "SELECT name FROM public._migrations" }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data.map(r => r.name) : [];
    }
    return [];
  } catch (e) {
    return [];
  }
}

async function main() {
  console.log('🚀 Supabase Migration Engine starting...');
  console.log('----------------------------------------');

  let client = null;
  if (DATABASE_URL) {
    console.log('🔗 Connecting to direct Postgres...');
    client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
    console.log('✅ Connected.');
  } else {
    console.log('🔄 No direct DB URL, using REST API fallback.');
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.warn('⚠️  Warning: Missing Supabase credentials. Skipping database migration during build.');
      console.log('   Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment.');
      return; // Exit gracefully
    }
  }

  try {
    // 1. Ensure migrations table exists
    await runSql(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `, client);

    const applied = await getAppliedMigrations(client);
    
    // 2. Process schema.sql as "initial_schema"
    const schemaPath = path.join(__dirname, '../src/lib/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const hash = crypto.createHash('md5').update(schemaSql).digest('hex');
      const migrationName = `schema_v_${hash.substring(0, 8)}`;

      if (!applied.includes(migrationName)) {
        console.log(`📄 Applying updated schema.sql (${migrationName})...`);
        await runSql(schemaSql, client);
        await runSql(`INSERT INTO _migrations (name) VALUES ('${migrationName}')`, client);
        console.log('🎉 Schema applied.');
      } else {
        console.log('⏭️  Schema.sql unchanged. Skipping.');
      }
    }

    // 3. Process incremental migrations in scripts/migrations/
    const migrationDir = path.join(__dirname, 'migrations');
    if (fs.existsSync(migrationDir)) {
      const files = fs.readdirSync(migrationDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      for (const file of files) {
        if (!applied.includes(file)) {
          console.log(`📦 Applying incremental migration: ${file}...`);
          const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');
          await runSql(sql, client);
          await runSql(`INSERT INTO _migrations (name) VALUES ('${file}')`, client);
          console.log(`✅ ${file} applied.`);
        }
      }
    }

    console.log('----------------------------------------');
    console.log('✨ All migrations are up to date!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    if (client) await client.end();
  }
}

main();
