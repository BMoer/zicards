/**
 * Chinese TTS – robust implementation
 *
 * 1. Primary:  Google Translate TTS via <audio> element (works everywhere)
 * 2. Fallback: Web Speech API
 */

// ─── TTS via Supabase Edge Function (proxied Google Translate) ───────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

let currentAudio = null

function buildTtsUrl(text) {
  return `${SUPABASE_URL}/functions/v1/tts?text=${encodeURIComponent(text)}`
}

/**
 * Play Chinese TTS via Google Translate (returns a Promise)
 */
function speakViaProxy(text) {
  return new Promise((resolve, reject) => {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }

    const audio = new Audio(buildTtsUrl(text))
    currentAudio = audio

    audio.addEventListener('ended', () => {
      currentAudio = null
      resolve()
    })
    audio.addEventListener('error', () => {
      currentAudio = null
      reject(new Error('TTS proxy failed'))
    })

    // Timeout: if nothing plays within 5s, reject
    const timeout = setTimeout(() => {
      if (currentAudio === audio) {
        audio.pause()
        currentAudio = null
        reject(new Error('TTS proxy timeout'))
      }
    }, 5000)

    audio.addEventListener('playing', () => clearTimeout(timeout))

    audio.play().catch((err) => {
      clearTimeout(timeout)
      currentAudio = null
      reject(err)
    })
  })
}

// ─── Web Speech API (fallback) ───────────────────────────────────────

let zhVoice = null
let voiceLoaded = false

function loadVoice() {
  if (voiceLoaded) return
  if (typeof speechSynthesis === 'undefined') return
  const voices = speechSynthesis.getVoices()
  zhVoice =
    voices.find((v) => v.lang === 'zh-CN') ||
    voices.find((v) => v.lang.startsWith('zh')) ||
    null
  if (voices.length > 0) voiceLoaded = true
}

if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = loadVoice
  loadVoice()
}

function speakViaWebSpeech(text, rate = 0.8) {
  return new Promise((resolve, reject) => {
    if (typeof speechSynthesis === 'undefined') {
      return reject(new Error('Web Speech API unavailable'))
    }

    speechSynthesis.cancel()
    loadVoice()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = rate
    if (zhVoice) utterance.voice = zhVoice

    utterance.onend = resolve
    utterance.onerror = (e) => reject(new Error(e.error || 'Speech error'))

    // Some Android browsers need a small delay after cancel()
    setTimeout(() => {
      speechSynthesis.speak(utterance)
    }, 50)
  })
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Speak Chinese text – tries Google TTS first, falls back to Web Speech API.
 * Returns a Promise that resolves when done or rejects if all methods fail.
 *
 * @param {string} text - Chinese text to speak
 * @param {number} rate - Speech rate for Web Speech fallback (default 0.8)
 */
export async function speakChinese(text, rate = 0.8) {
  try {
    await speakViaProxy(text)
  } catch {
    // Proxy TTS failed – try Web Speech API
    await speakViaWebSpeech(text, rate)
  }
}

/**
 * Stop any currently playing audio
 */
export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.cancel()
  }
}

/**
 * Check if any TTS method is available
 */
export function isSpeechAvailable() {
  // Audio element is available in all modern browsers
  return typeof Audio !== 'undefined' || typeof speechSynthesis !== 'undefined'
}
