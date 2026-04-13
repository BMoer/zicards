#!/usr/bin/env node
// Usage: node import-chars.mjs <lesson> <week> '[{"hanzi":"你","pinyin":"nǐ","pinyin_input":"ni3","meaning":"du","radical":"亻"},...]'
// Skips characters that already exist in the DB (matched by hanzi).

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Fehlende Env-Variablen: VITE_SUPABASE_URL und SUPABASE_SERVICE_KEY erforderlich.')
  console.error('Tipp: Aus dem Projektroot aufrufen oder env manuell setzen.')
  process.exit(1)
}

const [,, lesson, weekStr, jsonArg] = process.argv

if (!lesson || !weekStr || !jsonArg) {
  console.error('Usage: node import-chars.mjs <lesson> <week> <json-array>')
  console.error('Beispiel: node import-chars.mjs "Lektion 4" 4 \'[{"hanzi":"你",...}]\'')
  process.exit(1)
}

const week = parseInt(weekStr, 10)
let chars
try {
  chars = JSON.parse(jsonArg)
} catch (e) {
  console.error('Ungültiges JSON:', e.message)
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// 1. Bestehende Zeichen laden
const { data: existing, error: fetchErr } = await supabase
  .from('characters')
  .select('hanzi')

if (fetchErr) {
  console.error('Fehler beim Laden der DB:', fetchErr.message)
  process.exit(1)
}

const existingSet = new Set(existing.map(r => r.hanzi))
console.log(`DB enthält aktuell ${existingSet.size} Zeichen.`)

// 2. Filtern
const toInsert = chars.filter(c => {
  if (existingSet.has(c.hanzi)) {
    console.log(`⏭  Übersprungen (bereits vorhanden): ${c.hanzi} (${c.pinyin}) — ${c.meaning}`)
    return false
  }
  return true
})

if (toInsert.length === 0) {
  console.log('✅ Alle Zeichen bereits vorhanden. Nichts eingefügt.')
  process.exit(0)
}

// 3. Einfügen
const rows = toInsert.map(c => ({
  hanzi: c.hanzi,
  word: c.word ?? null,
  pinyin: c.pinyin,
  pinyin_word: c.pinyin_word ?? null,
  pinyin_input: c.pinyin_input,
  meaning: c.meaning,
  radical: c.radical ?? null,
  week,
  lesson,
}))

const { error: insertErr } = await supabase.from('characters').insert(rows)

if (insertErr) {
  console.error('Fehler beim Einfügen:', insertErr.message)
  process.exit(1)
}

console.log(`✅ ${toInsert.length} Zeichen eingefügt:`)
for (const c of toInsert) {
  console.log(`   ✚ ${c.hanzi} (${c.pinyin}) — ${c.meaning}`)
}
