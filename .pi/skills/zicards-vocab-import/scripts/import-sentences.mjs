#!/usr/bin/env node
// Usage: node import-sentences.mjs <lesson> <week> '[{"chinese":"...","pinyin":"...","german":"...","words":["..."],"gap_word":"...","gap_hint":"..."}]'
// Skips sentences that already exist in the DB (matched by chinese).

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
  console.error('Usage: node import-sentences.mjs <lesson> <week> <json-array>')
  console.error('Beispiel: node import-sentences.mjs "Lektion 2" 2 \'[{"chinese":"你好！","pinyin":"Nǐ hǎo!","german":"Hallo!","words":["你","好","！"],"gap_word":"好","gap_hint":"gut"}]\'')
  process.exit(1)
}

const week = parseInt(weekStr, 10)
let sentences
try {
  sentences = JSON.parse(jsonArg)
} catch (e) {
  console.error('Ungültiges JSON:', e.message)
  process.exit(1)
}

const required = ['chinese', 'pinyin', 'german', 'words', 'gap_word', 'gap_hint']
for (const s of sentences) {
  for (const field of required) {
    if (s[field] === undefined || s[field] === null || s[field] === '') {
      console.error(`Satz "${s.chinese ?? '?'}" fehlt Pflichtfeld: ${field}`)
      process.exit(1)
    }
  }
  if (!Array.isArray(s.words)) {
    console.error(`Satz "${s.chinese}" — words muss ein Array sein`)
    process.exit(1)
  }
  if (!s.words.includes(s.gap_word)) {
    console.error(`Satz "${s.chinese}" — gap_word "${s.gap_word}" nicht in words-Array enthalten`)
    process.exit(1)
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const { data: existing, error: fetchErr } = await supabase
  .from('sentences')
  .select('chinese')

if (fetchErr) {
  console.error('Fehler beim Laden der DB:', fetchErr.message)
  process.exit(1)
}

const existingSet = new Set(existing.map(r => r.chinese))
console.log(`DB enthält aktuell ${existingSet.size} Sätze.`)

const toInsert = sentences.filter(s => {
  if (existingSet.has(s.chinese)) {
    console.log(`⏭  Übersprungen (bereits vorhanden): ${s.chinese} — ${s.german}`)
    return false
  }
  return true
})

if (toInsert.length === 0) {
  console.log('✅ Alle Sätze bereits vorhanden. Nichts eingefügt.')
  process.exit(0)
}

const rows = toInsert.map(s => ({
  chinese: s.chinese,
  pinyin: s.pinyin,
  german: s.german,
  words: s.words,
  gap_word: s.gap_word,
  gap_hint: s.gap_hint,
  week,
  lesson,
}))

const { error: insertErr } = await supabase.from('sentences').insert(rows)

if (insertErr) {
  console.error('Fehler beim Einfügen:', insertErr.message)
  process.exit(1)
}

console.log(`✅ ${toInsert.length} Sätze eingefügt:`)
for (const s of toInsert) {
  console.log(`   ✚ ${s.chinese} — ${s.german}`)
}
