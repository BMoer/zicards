import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AKTIV_TAGE = 7
const TAG_MS = 86400000

/**
 * Alle drei Hooks hier folgen demselben Muster: der Ladezustand wird aus den
 * Daten *abgeleitet* statt vor dem Fetch gesetzt. Ein `setLoading(true)` direkt
 * im Effect-Rumpf löst synchron einen zweiten Render aus — genau das meldet die
 * React-Regel „Calling setState synchronously within an effect". Indem der State
 * mitführt, *für welchen Schlüssel* er gilt, ergibt sich „lädt gerade" aus dem
 * Vergleich mit dem aktuell angeforderten Schlüssel, und der einzige State-Set
 * passiert nach dem `await`.
 */

export function useAdmin(user, authLoading) {
  const [checked, setChecked] = useState({ forUser: undefined, isAdmin: false })

  const key = authLoading ? undefined : (user?.id ?? null)
  const isAdmin = checked.forUser === key ? checked.isAdmin : false
  const loading = authLoading || (key !== null && checked.forUser !== key)

  useEffect(() => {
    if (authLoading || !user) return
    let active = true
    supabase.rpc('is_admin').then(({ data, error }) => {
      console.log('is_admin result:', { data, error })
      if (active) setChecked({ forUser: user.id, isAdmin: !error && !!data })
    })
    return () => { active = false }
  }, [user, authLoading])

  return { isAdmin, loading }
}

export function useAdminUsers() {
  const [state, setState] = useState({ loaded: false, users: [], error: null, aktivCount: 0 })

  const fetch = useCallback(async () => {
    const { data, error } = await supabase.rpc('admin_get_users')
    if (error) {
      console.error('Admin fetch users error:', error)
      setState({ loaded: true, users: [], error: error.message, aktivCount: 0 })
      return
    }
    const users = data || []
    // Der Stichtag wird hier beim Laden genommen, nicht beim Rendern im
    // Dashboard: `Date.now()` im Render ist eine unreine Funktion und liefert
    // zwischen zwei Renders unbemerkt andere Zahlen.
    const jetzt = Date.now()
    const aktivCount = users.filter(
      (u) => u.last_activity && (jetzt - new Date(u.last_activity).getTime()) / TAG_MS <= AKTIV_TAGE
    ).length
    setState({ loaded: true, users, error: null, aktivCount })
  }, [])

  // Der Fetch startet bewusst in einem Microtask statt direkt im Effect-Rumpf.
  // Ein synchroner State-Set im Effect erzwingt eine zweite Render-Runde noch im
  // selben Commit (React-Regel "Calling setState synchronously within an effect");
  // ueber `Promise.resolve().then` liegt der erste Set garantiert danach. Am
  // Verhalten aendert sich nichts, der Ladezustand erscheint einen Microtask spaeter.
  useEffect(() => { Promise.resolve().then(fetch) }, [fetch])

  return {
    users: state.users,
    loading: !state.loaded,
    error: state.error,
    refetch: fetch,
    aktivCount: state.aktivCount,
    inaktivCount: state.users.length - state.aktivCount,
  }
}

export function useAdminUserDetail(userId) {
  const [state, setState] = useState({ forUser: null, chars: [], sentences: [] })

  const loading = state.forUser !== userId

  useEffect(() => {
    if (!userId) return
    let active = true
    Promise.all([
      supabase.rpc('admin_get_user_chars', { p_user_id: userId }),
      supabase.rpc('admin_get_user_sentences', { p_user_id: userId }),
    ]).then(([charRes, sentRes]) => {
      if (!active) return
      setState({
        forUser: userId,
        chars: charRes.data || [],
        sentences: sentRes.data || [],
      })
    })
    return () => { active = false }
  }, [userId])

  return { chars: state.chars, sentences: state.sentences, loading }
}
