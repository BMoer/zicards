import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSettings(user) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching settings:', error)
    }
    setSettings(data || null)
    setLoading(false)
  }, [user])

  // Der Fetch startet bewusst in einem Microtask statt direkt im Effect-Rumpf.
  // Ein synchroner State-Set im Effect erzwingt eine zweite Render-Runde noch im
  // selben Commit (React-Regel "Calling setState synchronously within an effect");
  // ueber `Promise.resolve().then` liegt der erste Set garantiert danach. Am
  // Verhalten aendert sich nichts, der Ladezustand erscheint einen Microtask spaeter.
  useEffect(() => { Promise.resolve().then(fetchSettings) }, [fetchSettings])

  const updateSettings = useCallback(
    async (updates) => {
      if (!user) return
      const record = {
        user_id: user.id,
        ...settings,
        ...updates,
      }
      const { data, error } = await supabase
        .from('user_settings')
        .upsert(record, { onConflict: 'user_id' })
        .select()
        .single()

      if (error) {
        console.error('Error updating settings:', error)
        return
      }
      setSettings(data)
    },
    [user, settings]
  )

  return { settings, loading, updateSettings }
}
