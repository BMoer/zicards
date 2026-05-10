import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { cacheMnemonics, getCachedMnemonics } from '../utils/offlineCache'

/**
 * Fetches all mnemonics from Supabase and exposes them as a hanzi-keyed map.
 * Result shape: { [hanzi]: { mnemonic, parts } } — same shape MnemonicCard
 * has always consumed.
 *
 * Used to be a hardcoded 595-LOC file (src/utils/mnemonics.js); migrated to
 * the `public.mnemonics` table so editors can fix copy in the DB without a
 * deploy. Falls back to localStorage when offline so existing users keep
 * seeing their mnemonics on next launch.
 */
export function useMnemonics() {
  const [mnemonics, setMnemonics] = useState(() => getCachedMnemonics() || {})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      const { data, error } = await supabase
        .from('mnemonics')
        .select('hanzi, mnemonic, parts')

      if (cancelled) return

      if (error) {
        console.error('Error fetching mnemonics:', error)
        // keep whatever cache we already have
        setLoading(false)
        return
      }

      const map = {}
      for (const row of data) {
        map[row.hanzi] = { mnemonic: row.mnemonic, parts: row.parts || [] }
      }
      setMnemonics(map)
      cacheMnemonics(map)
      setLoading(false)
    }

    fetchAll()
    return () => { cancelled = true }
  }, [])

  return { mnemonics, loading }
}
