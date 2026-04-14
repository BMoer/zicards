import { useState, useCallback, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { supabase } from '../lib/supabase'

export default function FeedbackButton({ user }) {
  const [capturing, setCapturing] = useState(false)
  const [open, setOpen] = useState(false)
  const [screenshot, setScreenshot] = useState(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)

  useEffect(() => {
    const handleFocusIn = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        setInputFocused(true)
      }
    }
    const handleFocusOut = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        setInputFocused(false)
      }
    }
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)
    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [])

  const capture = useCallback(async () => {
    // Hide button before capturing
    setCapturing(true)
    await new Promise((r) => setTimeout(r, 120))
    try {
      const canvas = await html2canvas(document.body, {
        scale: 0.5,
        useCORS: true,
        logging: false,
      })
      setScreenshot(canvas.toDataURL('image/jpeg', 0.65))
    } catch (e) {
      console.error('Screenshot failed:', e)
      setScreenshot(null)
    }
    setCapturing(false)
    setOpen(true)
  }, [])

  const cancel = () => {
    setOpen(false)
    setComment('')
    setScreenshot(null)
  }

  const submit = useCallback(async () => {
    if (!comment.trim() || submitting) return
    setSubmitting(true)
    const { error } = await supabase.from('feedback').insert({
      user_id: user.id,
      comment: comment.trim(),
      screenshot_data: screenshot,
      page_url: window.location.href,
    })
    if (error) {
      console.error('Feedback submit failed:', error)
      setSubmitting(false)
      return
    }
    setDone(true)
    setTimeout(() => {
      setDone(false)
      cancel()
    }, 2000)
    setSubmitting(false)
  }, [comment, screenshot, submitting, user])

  if (!user) return null

  return (
    <>
      {/* Floating button — hidden while capturing or input is focused (prevents mobile keyboard overlap) */}
      {!capturing && !open && !inputFocused && (
        <button
          onClick={capture}
          title="Feedback geben"
          className="fixed bottom-5 right-4 z-40 bg-ink/80 text-paper text-xs px-3 py-2 rounded-full shadow-md hover:bg-ink transition-colors"
        >
          💬 Feedback
        </button>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-paper rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl">
            {done ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">✓</p>
                <p className="font-medium">Danke für dein Feedback!</p>
              </div>
            ) : (
              <>
                <h2 className="font-bold text-lg">Feedback</h2>

                {screenshot && (
                  <img
                    src={screenshot}
                    alt="Screenshot"
                    className="w-full rounded-lg border border-ink/10 max-h-44 object-cover object-top"
                  />
                )}
                {!screenshot && (
                  <p className="text-xs text-ink/40">Kein Screenshot verfügbar.</p>
                )}

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Was läuft nicht? Was könnte besser sein?"
                  rows={4}
                  autoFocus
                  className="w-full px-3 py-2 border border-ink/20 rounded-lg text-sm resize-none focus:outline-none focus:border-ink/40 transition-colors"
                />

                <div className="flex gap-2">
                  <button
                    onClick={cancel}
                    className="flex-1 py-2.5 border border-ink/20 rounded-lg text-sm hover:bg-ink/5 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={submit}
                    disabled={!comment.trim() || submitting}
                    className="flex-1 py-2.5 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
                  >
                    {submitting ? '…' : 'Senden'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
