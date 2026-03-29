/**
 * Chinese TTS using Web Speech API
 */

let zhVoice = null
let voiceLoaded = false

function loadVoice() {
  if (voiceLoaded) return
  const voices = speechSynthesis.getVoices()
  // Prefer zh-CN voices, fallback to any zh voice
  zhVoice =
    voices.find((v) => v.lang === 'zh-CN') ||
    voices.find((v) => v.lang.startsWith('zh')) ||
    null
  if (voices.length > 0) voiceLoaded = true
}

// Voices load async in some browsers
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = loadVoice
  loadVoice()
}

/**
 * Speak a Chinese text (hanzi or word)
 * @param {string} text - Chinese text to speak
 * @param {number} rate - Speech rate (0.5-2, default 0.8 for clarity)
 */
export function speakChinese(text, rate = 0.8) {
  if (typeof speechSynthesis === 'undefined') return

  // Cancel any ongoing speech
  speechSynthesis.cancel()

  loadVoice()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.rate = rate
  if (zhVoice) utterance.voice = zhVoice

  speechSynthesis.speak(utterance)
}

/**
 * Check if speech synthesis is available
 */
export function isSpeechAvailable() {
  return typeof speechSynthesis !== 'undefined'
}
