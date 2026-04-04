import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { calculateNextReview } from '../utils/spaced'
import { cacheSentProgress, getCachedSentProgress, queueUpdate, getPendingUpdates, clearPendingUpdates } from '../utils/offlineCache'

/**
 * Sentence progress hook – same streak/level logic as character progress.
 * Level 0 = new (show sentence), Level 1 = word order, Level 2 = fill gap, Level 3 = translate
 */
export function useSentenceProgress(user) {
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress({})
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('sentence_progress')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching sentence progress:', error)
      const cached = getCachedSentProgress()
      if (cached) {
        console.log('Using cached sentence progress')
        setProgress(cached)
        setLoading(false)
        return
      }
      setLoading(false)
      return
    }
    const map = {}
    for (const r of data || []) {
      map[r.sentence_id] = r
    }
    setProgress(map)
    cacheSentProgress(map)

    // Sync pending
    const pending = getPendingUpdates().filter((u) => u.type === 'sent')
    if (pending.length > 0) {
      for (const update of pending) {
        await supabase.from('sentence_progress').upsert(update.record, { onConflict: 'user_id,sentence_id' })
      }
      clearPendingUpdates()
      console.log(`Synced ${pending.length} offline sentence updates`)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const markAsSeen = useCallback(
    async (sentenceId) => {
      if (!user) return
      const record = {
        user_id: user.id,
        sentence_id: sentenceId,
        level: 1,
        correct_streak: 0,
        incorrect_streak: 0,
        times_practiced: 0,
        last_practiced: new Date().toISOString(),
        next_review: calculateNextReview(0),
      }
      const { error } = await supabase
        .from('sentence_progress')
        .upsert(record, { onConflict: 'user_id,sentence_id' })
      if (error) console.error('Error marking sentence as seen:', error)
      setProgress((prev) => ({ ...prev, [sentenceId]: record }))
    },
    [user]
  )

  const updateProgress = useCallback(
    async (sentenceId, isCorrect) => {
      if (!user) return { levelChange: 0 }
      const existing = progress[sentenceId]
      const record = existing
        ? { ...existing }
        : {
            user_id: user.id,
            sentence_id: sentenceId,
            level: 1,
            correct_streak: 0,
            incorrect_streak: 0,
            times_practiced: 0,
          }
      const oldLevel = record.level

      if (isCorrect) {
        record.correct_streak = (record.correct_streak || 0) + 1
        record.incorrect_streak = 0
      } else {
        record.incorrect_streak = (record.incorrect_streak || 0) + 1
        record.correct_streak = 0
      }

      if (record.correct_streak >= 3) {
        record.level = Math.min(record.level + 1, 3)
        record.correct_streak = 0
      }
      if (record.incorrect_streak >= 2) {
        record.level = Math.max(record.level - 1, 1)
        record.incorrect_streak = 0
      }

      record.times_practiced = (record.times_practiced || 0) + 1
      record.last_practiced = new Date().toISOString()

      // Spaced repetition
      if (isCorrect) {
        record.next_review = calculateNextReview(record.correct_streak)
      } else {
        record.next_review = calculateNextReview(0)
      }

      const upsertData = {
        user_id: user.id,
        sentence_id: sentenceId,
        level: record.level,
        correct_streak: record.correct_streak,
        incorrect_streak: record.incorrect_streak,
        times_practiced: record.times_practiced,
        last_practiced: record.last_practiced,
        next_review: record.next_review,
      }

      const { error } = await supabase
        .from('sentence_progress')
        .upsert(upsertData, { onConflict: 'user_id,sentence_id' })

      if (error) {
        console.error('Error updating sentence progress (queuing):', error)
        queueUpdate({ type: 'sent', record: upsertData })
      }

      setProgress((prev) => {
        const updated = { ...prev, [sentenceId]: record }
        cacheSentProgress(updated)
        return updated
      })
      return { levelChange: record.level - oldLevel }
    },
    [user, progress]
  )

  const getWeekProgress = useCallback(
    (weekSentences) => {
      if (!weekSentences) return { total: 0, mastered: 0, lapsed: 0, level1: 0, level2: 0 }
      const now = new Date()
      const total = weekSentences.length
      let mastered = 0
      let lapsed = 0
      let level1 = 0
      let level2 = 0
      for (const s of weekSentences) {
        const p = progress[s.id]
        if (!p || p.level < 1) continue
        if (!p.next_review || new Date(p.next_review) <= now) {
          lapsed++
        } else if (p.level >= 3) {
          mastered++
        } else if (p.level === 2) {
          level2++
        } else {
          level1++
        }
      }
      return { total, mastered, lapsed, level1, level2 }
    },
    [progress]
  )

  return { progress, loading, updateProgress, markAsSeen, getWeekProgress }
}
