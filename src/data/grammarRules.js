/**
 * Grammar rule lookup for the word-order quiz feedback.
 *
 * When the diff engine determines the user misplaced a single word we
 * look it up here to show a short, didactic explanation instead of just
 * "Nicht ganz".
 *
 * Keep entries compact: one rule + one example. The example should be a
 * sentence the learner could plausibly meet at this stage (HSK 1-2-ish).
 */

const TIME_WORD_RULE = {
  title: 'Zeitangaben — Position im Satz',
  rule: 'Zeitwörter wie 今天 / 昨天 / 明天 / 现在 stehen vor dem Verb oder am Satzanfang — nie nach dem Verb.',
  example_zh: '我今天上课。',
  example_de: 'Ich habe heute Unterricht.',
}

export const GRAMMAR_RULES = {
  '都': {
    title: '都 — alle / beide',
    rule: '都 (dōu) steht direkt vor dem Verb und folgt dem (auch zusammengesetzten) Subjekt.',
    example_zh: '我妹妹和我弟弟都是学生。',
    example_de: 'Meine Schwester und mein Bruder sind beide Studenten.',
  },
  '也': {
    title: '也 — auch',
    rule: '也 (yě) steht zwischen Subjekt und Verb — niemals am Satzanfang.',
    example_zh: '我也是学生。',
    example_de: 'Ich bin auch Student.',
  },
  '还': {
    title: '还 — noch / außerdem',
    rule: '还 (hái) steht direkt vor dem Verb.',
    example_zh: '我还有一本书。',
    example_de: 'Ich habe noch ein Buch.',
  },
  '就': {
    title: '就 — gerade / dann',
    rule: '就 (jiù) steht vor dem Verb und drückt Unmittelbarkeit aus.',
    example_zh: '他就是我的老师。',
    example_de: 'Er ist mein Lehrer (genau der).',
  },
  '不': {
    title: '不 — Verneinung',
    rule: '不 (bù) steht direkt vor dem zu verneinenden Verb oder Adjektiv. Ausnahme: 有 wird mit 没 verneint, nicht mit 不.',
    example_zh: '我不是老师。',
    example_de: 'Ich bin nicht Lehrer.',
  },
  '没': {
    title: '没 — Verneinung von 有 / Vergangenheit',
    rule: '没 (méi) verneint 有 (haben) und vergangene Handlungen. „没有" niemals als „不有" schreiben.',
    example_zh: '我没有书。',
    example_de: 'Ich habe kein Buch.',
  },
  '吗': {
    title: '吗 — Ja/Nein-Fragepartikel',
    rule: '吗 (ma) steht am Satzende und macht aus einer Aussage eine Ja/Nein-Frage.',
    example_zh: '你是学生吗？',
    example_de: 'Bist du Student?',
  },
  '的': {
    title: '的 — Possessivpartikel',
    rule: '的 (de) verbindet Besitzer und Besessenes: Besitzer + 的 + Substantiv. Bei engen Beziehungen (Familie) kann 的 entfallen.',
    example_zh: '我的书',
    example_de: 'mein Buch',
  },
  '和': {
    title: '和 — und (zwischen Substantiven)',
    rule: '和 (hé) verbindet Substantive bzw. Nominalphrasen — nicht Sätze und nicht Verben.',
    example_zh: '我和你',
    example_de: 'ich und du',
  },
  '今天': TIME_WORD_RULE,
  '昨天': TIME_WORD_RULE,
  '明天': TIME_WORD_RULE,
  '现在': TIME_WORD_RULE,
}

/**
 * Look up the grammar rule for a misplaced word, or null if we don't
 * have one (then the UI falls back to a generic message).
 */
export function lookupGrammarRule(word) {
  return GRAMMAR_RULES[word] ?? null
}
