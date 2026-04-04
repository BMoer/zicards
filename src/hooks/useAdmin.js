import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAdmin(user, authLoading) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait until auth is resolved before deciding
    if (authLoading) return
    if (!user) {
      setIsAdmin(false)
      setLoading(false)
      return
    }
    setLoading(true)
    supabase.rpc('is_admin').then(({ data, error }) => {
      console.log('is_admin result:', { data, error })
      setIsAdmin(!error && !!data)
      setLoading(false)
    })
  }, [user, authLoading])

  return { isAdmin, loading }
}

export function useAdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_get_users')
    if (error) {
      setError(error.message)
      console.error('Admin fetch users error:', error)
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { users, loading, error, refetch: fetch }
}

export function useAdminUserDetail(userId) {
  const [chars, setChars] = useState([])
  const [sentences, setSentences] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      supabase.rpc('admin_get_user_chars', { p_user_id: userId }),
      supabase.rpc('admin_get_user_sentences', { p_user_id: userId }),
    ]).then(([charRes, sentRes]) => {
      if (charRes.data) setChars(charRes.data)
      if (sentRes.data) setSentences(sentRes.data)
      setLoading(false)
    })
  }, [userId])

  return { chars, sentences, loading }
}
