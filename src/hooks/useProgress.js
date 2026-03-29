import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { calculateNextReview } from '../utils/spaced'
import { cacheCharProgress, getCachedCharProgress, queueUpdate, getPendingUpdates, clearPendingUpdates } from '../utils/offlineCache'

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
      const cached = getCachedCharProgress()
      if (cached) {
        console.log('Using cached char progress')
        setProgress(cached)
        setLoading(false)
        return
      }
      setLoading(false)
      return
    }

    const map = {}
    for (const record of data || []) {
      map[record.character_id] = record
    }
    setProgress(map)
    cacheCharProgress(map)

    // Sync any pending offline updates
    syncPendingUpdates()
    setLoading(false)
  }, [user])

  // Sync pending offline updates when back online
  const syncPendingUpdates = useCallback(async () => {
    const pending = getPendingUpdates().filter((u) => u.type === 'char')
    if (pending.length === 0) return
    for (const update of pending) {
      await supabase
        .from('user_progress')
        .upsert(update.record, { onConflict: 'user_id,character_id' })
    }
    clearPendingUpdates()
    console.log(`Synced ${pending.length} offline char updates`)
  }, [])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  // Sync when coming back online
  useEffect(() => {
    const handleOnline = () => syncPendingUpdates()
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [syncPendingUpdates])

  /**
   * Mark a Stufe-0 character as "seen" → level 1
   */
  const markAsSeen = useCallback(
    async (characterId) => {
      if (!user) return

      const now = new Date().toISOString()
      const record = {
        user_id: user.id,
        character_id: characterId,
        level: 1,
        correct_streak: 0,
        incorrect_streak: 0,
        times_practiced: 0,
        last_practiced: now,
        next_review: calculateNextReview(0),
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
   * isCorrect: true (correct), false (wrong), 'half' (partial – no streak change)
   * Returns { levelChange: number }
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

      // Update streaks – 'half' correct = no streak changes
      if (isCorrect === 'half') {
        // Don't touch streaks – neutral result
      } else if (isCorrect) {
        record.correct_streak = (record.correct_streak || 0) + 1
        record.incorrect_streak = 0
      } else {
        record.incorrect_streak = (record.incorrect_streak || 0) + 1
        record.correct_streak = 0
      }

      // Level changes
      if (record.correct_streak >= 3) {
        record.level = Math.min(record.level + 1, 3)
        record.correct_streak = 0
      }
      if (record.incorrect_streak >= 2) {
        record.level = Math.max(record.level - 1, 1)
        record.incorrect_streak = 0
      }

      // Metadata
      record.times_practiced = (record.times_practiced || 0) + 1
      record.last_practiced = new Date().toISOString()

      // Spaced repetition: calculate next review
      if (isCorrect === 'half') {
        // Keep current next_review (don't push out, don't reset)
      } else if (isCorrect) {
        record.next_review = calculateNextReview(record.correct_streak)
      } else {
        // Wrong → review again soon (4 hours)
        record.next_review = calculateNextReview(0)
      }

      const upsertData = {
        user_id: user.id,
        character_id: characterId,
        level: record.level,
        correct_streak: record.correct_streak,
        incorrect_streak: record.incorrect_streak,
        times_practiced: record.times_practiced,
        last_practiced: record.last_practiced,
        next_review: record.next_review,
      }

      const { error } = await supabase
        .from('user_progress')
        .upsert(upsertData, { onConflict: 'user_id,character_id' })

      if (error) {
        console.error('Error updating progress (queuing for offline sync):', error)
        queueUpdate({ type: 'char', record: upsertData })
      }

      // Always update local state (works offline)
      setProgress((prev) => {
        const updated = { ...prev, [characterId]: record }
        cacheCharProgress(updated)
        return updated
      })

      return { levelChange: record.level - oldLevel }
    },
    [user, progress]
  )

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
