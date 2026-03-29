import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProgress(user) {
  const [progress, setProgress] = useState({}) // { characterId: record }
  const [loading, setLoading] = useState(true)

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress({})
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching progress:', error)
      setLoading(false)
      return
    }

    const map = {}
    for (const record of data || []) {
      map[record.character_id] = record
    }
    setProgress(map)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  /**
   * Mark a Stufe-0 character as "seen" → level 1
   */
  const markAsSeen = useCallback(
    async (characterId) => {
      if (!user) return

      const record = {
        user_id: user.id,
        character_id: characterId,
        level: 1,
        correct_streak: 0,
        incorrect_streak: 0,
        times_practiced: 0,
        last_practiced: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('user_progress')
        .upsert(record, { onConflict: 'user_id,character_id' })

      if (error) {
        console.error('Error marking as seen:', error)
        return
      }

      setProgress((prev) => ({ ...prev, [characterId]: record }))
    },
    [user]
  )

  /**
   * Update progress after answering a quiz question.
   * Returns { levelChange: number } (positive = up, negative = down, 0 = same)
   */
  const updateProgress = useCallback(
    async (characterId, isCorrect) => {
      if (!user) return { levelChange: 0 }

      const existing = progress[characterId]
      const record = existing
        ? { ...existing }
        : {
            user_id: user.id,
            character_id: characterId,
            level: 1,
            correct_streak: 0,
            incorrect_streak: 0,
            times_practiced: 0,
          }

      const oldLevel = record.level

      // Update streaks
      if (isCorrect) {
        record.correct_streak = (record.correct_streak || 0) + 1
        record.incorrect_streak = 0
      } else {
        record.incorrect_streak = (record.incorrect_streak || 0) + 1
        record.correct_streak = 0
      }

      // Level changes
      if (record.correct_streak >= 3) {
        record.level = Math.min(record.level + 1, 3) // max 3 in MVP
        record.correct_streak = 0
      }
      if (record.incorrect_streak >= 2) {
        record.level = Math.max(record.level - 1, 1) // min 1, never back to 0
        record.incorrect_streak = 0
      }

      // Metadata
      record.times_practiced = (record.times_practiced || 0) + 1
      record.last_practiced = new Date().toISOString()

      // Upsert
      const { error } = await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: user.id,
            character_id: characterId,
            level: record.level,
            correct_streak: record.correct_streak,
            incorrect_streak: record.incorrect_streak,
            times_practiced: record.times_practiced,
            last_practiced: record.last_practiced,
          },
          { onConflict: 'user_id,character_id' }
        )

      if (error) {
        console.error('Error updating progress:', error)
        return { levelChange: 0 }
      }

      setProgress((prev) => ({ ...prev, [characterId]: record }))

      return { levelChange: record.level - oldLevel }
    },
    [user, progress]
  )

  /**
   * Get progress stats for a week.
   */
  const getWeekProgress = useCallback(
    (weekCharacters) => {
      if (!weekCharacters) return { total: 0, mastered: 0 }
      const total = weekCharacters.length
      const mastered = weekCharacters.filter((c) => {
        const p = progress[c.id]
        return p && p.level >= 2
      }).length
      return { total, mastered }
    },
    [progress]
  )

  return { progress, loading, updateProgress, markAsSeen, getWeekProgress, refetch: fetchProgress }
}
