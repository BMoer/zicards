import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { cacheCharacters, getCachedCharacters, cacheSentences, getCachedSentences } from '../utils/offlineCache'

/**
 * Combined hook that fetches characters and sentences, grouped into unified lessons.
 * Each lesson has { week, lesson, characters, sentences }.
 */
export function useLessons() {
  const [characters, setCharacters] = useState([])
  const [sentences, setSentences] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)

    const [charResult, sentResult] = await Promise.all([
      supabase.from('characters').select('*').order('week').order('id'),
      supabase.from('sentences').select('*').order('week').order('id'),
    ])

    let charData = charResult.data
    let sentData = sentResult.data

    if (charResult.error) {
      console.error('Error fetching characters:', charResult.error)
      charData = getCachedCharacters() || []
    } else {
      cacheCharacters(charData)
    }

    if (sentResult.error) {
      console.error('Error fetching sentences:', sentResult.error)
      sentData = getCachedSentences() || []
    } else {
      cacheSentences(sentData)
    }

    setCharacters(charData)
    setSentences(sentData)

    // Group into lessons by week
    const lessonMap = {}
    for (const char of charData) {
      if (!lessonMap[char.week]) {
        lessonMap[char.week] = { week: char.week, lesson: char.lesson, characters: [], sentences: [] }
      }
      lessonMap[char.week].characters.push(char)
    }
    for (const sent of sentData) {
      if (!lessonMap[sent.week]) {
        lessonMap[sent.week] = { week: sent.week, lesson: sent.lesson, characters: [], sentences: [] }
      }
      lessonMap[sent.week].sentences.push(sent)
    }

    setLessons(Object.values(lessonMap).sort((a, b) => a.week - b.week))
    setLoading(false)
  }

  return { characters, sentences, lessons, loading }
}
