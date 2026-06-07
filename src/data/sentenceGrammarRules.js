/**
 * Grammatikregeln für den Deep-Learning-Satzmodus.
 *
 * Anders als die kompakten Wortstellungs-Hinweise in `grammarRules.js`
 * (eine Regel + ein Beispiel, für das Word-Order-Quiz) sind das die
 * vollständigen Buch-Grammatikregeln, die der Deep-Learning-Modus dem
 * Lernenden noch einmal in Erinnerung ruft, wenn er sich mit den
 * darüberliegenden Sätzen schwertut.
 *
 * Format pro Regel (vom Nutzer vorgegeben, 2026-06-07):
 *   - Titel + Erklärung
 *   - chinesische Zeichen immer in Simplified
 *   - Beispiele: immer EIN richtiges und EIN falsches, um die Regel zu
 *     erklären (`correct: true | false`, falsche mit `note` = warum falsch)
 *
 * STATUS: Regeln stammen wörtlich vom Nutzer; die Beispielsätze sind
 * Entwürfe (im Vokabular von L1–L6) und stehen unter Review-Vorbehalt.
 * Weitere Regeln werden laufend ergänzt — Struktur bleibt gleich.
 */

export const SENTENCE_GRAMMAR_RULES = [
  {
    id: 'ma-question',
    title: 'Die Fragepartikel 吗',
    summary:
      '吗 (ma) wird ans Ende eines Aussagesatzes gehängt und macht daraus eine Ja/Nein-Frage. Geantwortet wird mit der bejahenden oder der verneinenden Form.',
    examples: [
      { zh: '你是学生吗？', de: 'Bist du Student?', correct: true },
      {
        zh: '你吗是学生？',
        note: '吗 steht immer am Satzende, nie in der Satzmitte.',
        correct: false,
      },
    ],
  },
  {
    id: 'ye-adverb',
    title: 'Das Adverb 也',
    summary:
      '也 (yě) steht – wie Adverbien generell – vor dem Verb (也是, 也有). Trifft 也 auf weitere Adverbien, steht es vor ihnen: 也不是 (nicht 不也是).',
    examples: [
      { zh: '我也是学生。', de: 'Ich bin auch Student.', correct: true },
      {
        zh: '我是也学生。',
        note: '也 steht vor dem Verb 是, niemals danach.',
        correct: false,
      },
    ],
  },
  {
    id: 'de-structural',
    title: 'Die Strukturpartikel 的',
    summary:
      '的 (de) folgt einem Attribut, das ein Besitzverhältnis ausdrückt: Besitzer + 的 + Substantiv. Bei sehr engen Beziehungen (z. B. Familie) kann 的 entfallen.',
    examples: [
      { zh: '这是大卫的书。', de: 'Das ist Davids Buch.', correct: true },
      {
        zh: '这是大卫书。',
        note: 'Besitz braucht 的: 大卫的书.',
        correct: false,
      },
    ],
  },
  {
    id: 'you-sentence',
    title: 'Der 有-Satz',
    summary:
      'Sätze mit 有 (yǒu) als Prädikat („haben") drücken vor allem Besitz aus. Verneint wird mit 没有 statt 不有. In der Verneinung steht kein Zahl-Zählwort-Ausdruck vor dem Objekt.',
    examples: [
      { zh: '我有一本书。', de: 'Ich habe ein Buch.', correct: true },
      {
        zh: '我不有书。',
        note: '有 wird mit 没 verneint → 没有 (nie 不有). Außerdem in der Verneinung kein „一本": 我没有书, nicht 我没有一本书.',
        correct: false,
      },
    ],
  },
  {
    id: 'interrogative-pronoun',
    title: 'Fragen mit Fragepronomen',
    summary:
      '谁 (shéi) fragt nach „wer", 什么 (shénme) nach „was", 几 (jǐ) nach „wie viele". Die Wortstellung bleibt exakt wie im Aussagesatz — das Fragewort steht genau dort, wo die Antwort stünde. 谁 vor einem Nomen bekommt 的 dazwischen (谁的书 = wessen Buch), 什么 steht direkt vor dem Nomen (什么书). Zwischen 几 und dem Nomen steht ein Zählwort (几本书). 吗 wird in solchen Fragen nie verwendet.',
    examples: [
      { zh: '他是谁？', de: 'Wer ist er?', correct: true },
      { zh: '这是谁的书？', de: 'Wessen Buch ist das?', correct: true },
      { zh: '你有几本书？', de: 'Wie viele Bücher hast du?', correct: true },
      {
        zh: '他是谁吗？',
        note: 'Mit einem Fragepronomen steht kein zusätzliches 吗.',
        correct: false,
      },
      {
        zh: '这是谁书？',
        note: '谁 vor einem Nomen braucht 的 dazwischen: 谁的书.',
        correct: false,
      },
    ],
  },
  {
    id: 'pronoun-attributive',
    title: 'Personalpronomen als Attribut',
    summary:
      'Als Attribut drücken Personalpronomen Besitz aus und werden mit der Strukturpartikel 的 angeschlossen: 我的书 (mein Buch). Bezeichnet das Bezugswort eine Verwandtschaft oder die eigene Institution (Schule, Arbeitsstelle), ist 的 optional und entfällt umgangssprachlich oft: 我妈妈, 我们学校.',
    examples: [
      { zh: '这是我的书。', de: 'Das ist mein Buch.', correct: true },
      { zh: '我妈妈是老师。', de: 'Meine Mutter ist Lehrerin.', correct: true },
      {
        zh: '这是我书。',
        note: 'Bei Sachbesitz braucht es 的: 我的书.',
        correct: false,
      },
    ],
  },
  {
    id: 'ji-vs-duoshao',
    title: '几 oder 多少',
    summary:
      'Beide fragen nach einer Menge. 几 (jǐ) erwartet meist eine kleine Zahl (unter 10) und steht mit Zählwort vor dem Nomen (几个本子). 多少 (duōshao) fragt nach beliebig großen Mengen und braucht kein Zählwort (多少天).',
    examples: [
      { zh: '你有几个本子？', de: 'Wie viele Hefte hast du?', correct: true },
      { zh: '这个月有多少天？', de: 'Wie viele Tage hat dieser Monat?', correct: true },
      {
        zh: '你有几本子？',
        note: 'Nach 几 steht ein Zählwort: 几个本子.',
        correct: false,
      },
    ],
  },
]

/**
 * Regel per id nachschlagen, sonst null.
 */
export function getSentenceGrammarRule(id) {
  return SENTENCE_GRAMMAR_RULES.find((r) => r.id === id) ?? null
}
