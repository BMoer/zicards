import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCharacters() {
  const [characters, setCharacters] = useState([])
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCharacters()
  }, [])

  async function fetchCharacters() {
    setLoading(true)
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .order('week')
      .order('id')

    if (error) {
      console.error('Error fetching characters:', error)
      setLoading(false)
      return
    }

    setCharacters(data || [])

    // Group by week
    const weekMap = {}
    for (const char of data || []) {
      if (!weekMap[char.week]) {
        weekMap[char.week] = {
          week: char.week,
          lesson: char.lesson,
          characters: [],
        }
      }
      weekMap[char.week].characters.push(char)
    }

    setWeeks(
      Object.values(weekMap).sort((a, b) => a.week - b.week)
    )
    setLoading(false)
  }

  return { characters, weeks, loading }
}
