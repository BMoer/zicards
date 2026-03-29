import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { cacheSentences, getCachedSentences } from '../utils/offlineCache'

export function useSentences() {
  const [sentences, setSentences] = useState([])
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSentences()
  }, [])

  async function fetchSentences() {
    setLoading(true)
    let { data, error } = await supabase
      .from('sentences')
      .select('*')
      .order('week')
      .order('id')

    if (error) {
      console.error('Error fetching sentences:', error)
      const cached = getCachedSentences()
      if (cached) {
        console.log('Using cached sentences')
        data = cached
      } else {
        setLoading(false)
        return
      }
    } else {
      cacheSentences(data)
    }

    setSentences(data || [])

    // Group by week
    const weekMap = {}
    for (const s of data || []) {
      if (!weekMap[s.week]) {
        weekMap[s.week] = {
          week: s.week,
          lesson: s.lesson,
          sentences: [],
        }
      }
      weekMap[s.week].sentences.push(s)
    }

    setWeeks(Object.values(weekMap).sort((a, b) => a.week - b.week))
    setLoading(false)
  }

  return { sentences, weeks, loading }
}
