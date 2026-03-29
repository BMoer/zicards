import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { speakChinese, stopSpeaking, isSpeechAvailable } from '../utils/audio'

const AudioContext = createContext()

const STORAGE_KEY = 'zicards-audio-enabled'

export function AudioProvider({ children }) {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    // Default to true if never set
    return stored === null ? true : stored === 'true'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled))
  }, [enabled])

  const toggle = useCallback(() => setEnabled((v) => !v), [])

  const autoSpeak = useCallback(
    (text, rate) => {
      if (enabled) speakChinese(text, rate)
    },
    [enabled]
  )

  return (
    <AudioContext.Provider value={{ enabled, toggle, autoSpeak }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  return useContext(AudioContext)
}

/**
 * Toggle button for the header
 */
export function AudioToggle() {
  const { enabled, toggle } = useAudio()

  if (!isSpeechAvailable()) return null

  return (
    <button
      onClick={toggle}
      className={`text-lg w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
        enabled ? 'text-ink/70 hover:text-ink' : 'text-ink/25 hover:text-ink/40'
      }`}
      title={enabled ? 'Ton aus' : 'Ton an'}
    >
      {enabled ? '🔊' : '🔇'}
    </button>
  )
}
