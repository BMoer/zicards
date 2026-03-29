import { useState } from 'react'
import { speakChinese, isSpeechAvailable } from '../utils/audio'

/**
 * A small speaker button that plays Chinese TTS
 * @param {string} text - Chinese text to speak (hanzi or word)
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export default function SpeakButton({ text, size = 'md' }) {
  const [playing, setPlaying] = useState(false)

  if (!isSpeechAvailable()) return null

  const sizeClasses = {
    sm: 'text-base w-7 h-7',
    md: 'text-lg w-9 h-9',
    lg: 'text-xl w-11 h-11',
  }

  const handleClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setPlaying(true)
    speakChinese(text)
    // Reset after typical duration
    setTimeout(() => setPlaying(false), 1500)
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-full transition-colors
        ${playing ? 'bg-terracotta/15 text-terracotta' : 'bg-ink/5 text-ink/40 hover:text-ink/60 hover:bg-ink/10'}
        ${sizeClasses[size]}`}
      title="Aussprache anhören"
      type="button"
    >
      🔊
    </button>
  )
}
