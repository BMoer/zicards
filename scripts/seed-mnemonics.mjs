#!/usr/bin/env node
/**
 * One-off seed script for the public.mnemonics table.
 * Reads the legacy hard-coded data from src/utils/mnemonics.legacy.js (a
 * snapshot of the old in-code mnemonics) and upserts every row into
 * Supabase via PostgREST.
 *
 * Prereqs:
 *   1. Run supabase/mnemonics-schema.sql in the Supabase SQL Editor.
 *   2. .env contains VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY.
 *
 * Run:
 *   node scripts/seed-mnemonics.mjs
 *
 * Idempotent: uses Prefer: resolution=merge-duplicates so re-running just
 * updates existing rows.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env without bringing in dotenv as a dep
const envPath = resolve(__dirname, '../.env')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)

const SUPABASE_URL = env.VITE_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env')
  process.exit(1)
}

// Dynamic import of the legacy data file (ESM via ?raw not supported in node;
// we use a relative import path to the snapshot module)
const dataModule = await import(resolve(__dirname, '../src/utils/mnemonics.legacy.js'))
const data = dataModule.MNEMONICS_LEGACY

const rows = Object.entries(data).map(([hanzi, { parts, mnemonic }]) => ({
  hanzi,
  mnemonic,
  parts: parts || [],
}))

console.log(`Seeding ${rows.length} mnemonics → ${SUPABASE_URL}/rest/v1/mnemonics`)

const res = await fetch(`${SUPABASE_URL}/rest/v1/mnemonics`, {
  method: 'POST',
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=minimal',
  },
  body: JSON.stringify(rows),
})

if (!res.ok) {
  const body = await res.text()
  console.error(`Seed failed (${res.status}): ${body}`)
  process.exit(1)
}

console.log(`✓ Seeded ${rows.length} mnemonics.`)
