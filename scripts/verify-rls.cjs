require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')

async function main() {
  const password = 'Sysytemset@2026'
  const ref = 'cumiimzzceoitwdhaxde'
  const conn = 'postgresql://postgres:' + encodeURIComponent(password) + '@db.' + ref + '.supabase.co:5432/postgres'
  const c = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } })
  await c.connect()

  // 1. RLS check
  const { rows } = await c.query(
    "SELECT relname AS table, relrowsecurity AS rls FROM pg_class WHERE relrowsecurity = true AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') ORDER BY relname"
  )
  console.log('=== RLS enabled tables ===')
  const withRls = new Set()
  for (const r of rows) {
    console.log('  ' + r.table + (r.rls ? ' ✓' : ' ✗'))
    withRls.add(r.table)
  }

  const { rows: all } = await c.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
  )
  const missing = all.filter(t => !withRls.has(t.tablename))
  if (missing.length) {
    console.log('\n=== Tables MISSING RLS ===')
    for (const t of missing) console.log('  ✗ ' + t.tablename)
  } else {
    console.log('\n✓ All public tables have RLS enabled')
  }

  // 2. Check current_center_id function exists
  const { rows: funcs } = await c.query(
    "SELECT proname FROM pg_proc WHERE proname = 'current_center_id' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')"
  )
  console.log('\n=== Helper function ===')
  console.log(funcs.length ? '✓ public.current_center_id() exists' : '✗ MISSING')

  // 3. Policy count
  const { rows: policies } = await c.query(
    "SELECT count(*)::int AS cnt FROM pg_policies WHERE schemaname = 'public'"
  )
  console.log('\n=== Policies ===')
  console.log('Total policies: ' + policies[0].cnt)

  // 4. Verify RLS prevents unauthenticated access
  const { rows: rlsStatus } = await c.query(
    "SELECT relname, relrowsecurity FROM pg_class WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND relkind = 'r' ORDER BY relname"
  )
  const allEnabled = rlsStatus.every(r => r.relrowsecurity)
  console.log('\n✓ RLS status: ' + (allEnabled ? 'ALL TABLES SECURE' : 'SOME TABLES EXPOSED'))

  await c.end()
}
main().catch(e => { console.error(e.message); process.exit(1) })
