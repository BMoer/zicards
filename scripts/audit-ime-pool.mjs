#!/usr/bin/env node
/**
 * Audit: every Hànzì that appears in any sentence MUST be reachable via the
 * IME pool (curriculum single-char rows + commonCharacters.js). Otherwise
 * the gap/translate quizzes for that sentence are unsolvable — the user
 * types pinyin and the picker simply does not contain the target char.
 *
 * Reproduces the buildPool logic in src/utils/imeCandidates.js: only
 * single-char curriculum rows make it into the pool (compound rows like
 * 什么 are skipped because IMEs pick one char at a time).
 *
 * Run: `node scripts/audit-ime-pool.mjs` from repo root.
 * Exit 0 = all clean. Exit 1 = at least one missing char.
 */
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..')
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    })
)
const url = env.VITE_SUPABASE_URL
const key = env.SUPABASE_SERVICE_KEY
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL / SUPABASE_SERVICE_KEY in .env')
  process.exit(2)
}

async function q(p) {
  const r = await fetch(url + '/rest/v1/' + p, {
    headers: { apikey: key, Authorization: 'Bearer ' + key },
  })
  return r.json()
}

const sents = await q('sentences?select=chinese,gap_word')
const chars = await q('characters?select=hanzi')

const cur = new Set()
for (const c of chars) {
  if ([...c.hanzi].length === 1) cur.add(c.hanzi)
}

const txt = fs.readFileSync(path.join(ROOT, 'src/data/commonCharacters.js'), 'utf8')
const common = new Set()
const re = /hanzi:\s*'([一-鿿])'/g
let m
while ((m = re.exec(txt))) common.add(m[1])

const HAN = /[一-鿿]/
const missing = new Map()
for (const s of sents) {
  for (const ch of [...s.chinese]) {
    if (!HAN.test(ch)) continue
    if (!cur.has(ch) && !common.has(ch)) {
      const list = missing.get(ch) ?? []
      list.push(s.chinese)
      missing.set(ch, list)
    }
  }
}

console.log(`IME pool: ${cur.size} curriculum + ${common.size} common = ${cur.size + common.size} chars`)
console.log(`Sentence chars missing from IME pool: ${missing.size}`)
for (const [ch, sentArr] of missing) {
  console.log(`  ${ch} — used in ${sentArr.length} sentence(s):`)
  for (const s of sentArr.slice(0, 3)) console.log(`    ${s}`)
  if (sentArr.length > 3) console.log(`    … +${sentArr.length - 3} more`)
}

process.exit(missing.size === 0 ? 0 : 1)
