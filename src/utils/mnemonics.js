/**
 * Eselsbrücken für chinesische Zeichen
 * Aufbau: Zeichen → { parts: Bestandteile, mnemonic: Merksatz }
 *
 * parts: Array von { char, meaning } – die Bausteine des Zeichens
 * mnemonic: kreativer Merksatz, der die Teile verbindet
 */

const mnemonics = {
  // === LEKTION 1 ===
  '叫': {
    parts: [{ char: '口', meaning: 'Mund' }, { char: '丩', meaning: 'verschlungen' }],
    mnemonic: 'Der Mund (口) ruft einen verschlungenen Namen – so heißt man!',
  },
  '我': {
    parts: [{ char: '手', meaning: 'Hand' }, { char: '戈', meaning: 'Hellebarde' }],
    mnemonic: 'Ich halte eine Hellebarde (戈) in der Hand (手) – das bin ICH, verteidigungsbereit!',
  },
  '是': {
    parts: [{ char: '日', meaning: 'Sonne' }, { char: '正', meaning: 'richtig' }],
    mnemonic: 'Unter der Sonne (日) ist alles korrekt (正) – es IST so!',
  },
  '人': {
    parts: [{ char: '丿', meaning: 'Strich links' }, { char: '㇏', meaning: 'Strich rechts' }],
    mnemonic: 'Zwei Beine, die sich stützen – ein Mensch, der aufrecht steht.',
  },
  '不': {
    parts: [],
    mnemonic: 'Sieht aus wie eine Pflanze, die NICHT durch die Decke wachsen kann – blockiert!',
  },
  '你': {
    parts: [{ char: '亻', meaning: 'Person' }, { char: '尔', meaning: 'du (alt)' }],
    mnemonic: 'Die Person (亻) neben dem alten Wort für "du" (尔) – DU bist gemeint!',
  },
  '好': {
    parts: [{ char: '女', meaning: 'Frau' }, { char: '子', meaning: 'Kind' }],
    mnemonic: 'Eine Frau (女) mit ihrem Kind (子) – das ist GUT! 👩‍👦',
  },
  '吗': {
    parts: [{ char: '口', meaning: 'Mund' }, { char: '马', meaning: 'Pferd' }],
    mnemonic: 'Der Mund (口) fragt das Pferd (马): "Wirklich?" – eine Frage!',
  },
  '他': {
    parts: [{ char: '亻', meaning: 'Person' }, { char: '也', meaning: 'auch' }],
    mnemonic: 'Die Person (亻), die auch (也) da ist – ER, der andere.',
  },
  '她': {
    parts: [{ char: '女', meaning: 'Frau' }, { char: '也', meaning: 'auch' }],
    mnemonic: 'Die Frau (女), die auch (也) da ist – SIE. (Wie 他, aber mit Frau statt Person!)',
  },
  '师': {
    parts: [{ char: '丨', meaning: 'Stab' }, { char: '巾', meaning: 'Tuch' }],
    mnemonic: 'Mit Stab und Tuch (巾) ausgestattet – der MEISTER und Lehrer.',
  },
  '您': {
    parts: [{ char: '你', meaning: 'du' }, { char: '心', meaning: 'Herz' }],
    mnemonic: 'Du (你) mit Herz (心) darunter – SIE, die höfliche Form. Von Herzen respektvoll!',
  },
  '学': {
    parts: [{ char: '⺍', meaning: 'Hände' }, { char: '子', meaning: 'Kind' }],
    mnemonic: 'Hände greifen nach Wissen für das Kind (子) – LERNEN!',
  },
  '生': {
    parts: [{ char: '丿', meaning: 'Spross' }, { char: '土', meaning: 'Erde' }],
    mnemonic: 'Ein Spross wächst aus der Erde – LEBEN, geboren werden!',
  },
  '也': {
    parts: [],
    mnemonic: 'Sieht aus wie ein Haken, der sich anhängt – AUCH dabei!',
  },
  '加': {
    parts: [{ char: '力', meaning: 'Kraft' }, { char: '口', meaning: 'Mund' }],
    mnemonic: 'Kraft (力) plus Mund (口) – mit Wort und Tat HINZUFÜGEN!',
  },
  '拿': {
    parts: [{ char: '合', meaning: 'zusammen' }, { char: '手', meaning: 'Hand' }],
    mnemonic: 'Die Hände (手) zusammen (合) schließen – NEHMEN und festhalten!',
  },
  '大': {
    parts: [{ char: '一', meaning: 'eins' }, { char: '人', meaning: 'Person' }],
    mnemonic: 'Ein Mensch (人) streckt die Arme aus (一) – schau wie GROSS ich bin!',
  },
  '们': {
    parts: [{ char: '亻', meaning: 'Person' }, { char: '门', meaning: 'Tor' }],
    mnemonic: 'Viele Personen (亻) strömen durchs Tor (门) – der PLURAL!',
  },
  '老': {
    parts: [{ char: '耂', meaning: 'alter Mann' }, { char: '匕', meaning: 'Löffel' }],
    mnemonic: 'Ein alter Mann (耂) braucht einen Löffel (匕) zum Essen – ALT.',
  },
  '中': {
    parts: [{ char: '口', meaning: 'Rahmen' }, { char: '丨', meaning: 'Strich' }],
    mnemonic: 'Ein Strich (丨) genau durch die MITTE eines Rahmens (口).',
  },
  '国': {
    parts: [{ char: '囗', meaning: 'Umzäunung' }, { char: '玉', meaning: 'Jade' }],
    mnemonic: 'Jade (玉) hinter einer Mauer (囗) geschützt – ein LAND, ein Staat!',
  },
  '日': {
    parts: [],
    mnemonic: 'Ein Rechteck mit Strich – die SONNE am Horizont. ☀️',
  },
  '本': {
    parts: [{ char: '木', meaning: 'Baum' }, { char: '一', meaning: 'Markierung' }],
    mnemonic: 'Ein Strich an der WURZEL des Baumes (木) – der Ursprung!',
  },
  '法': {
    parts: [{ char: '氵', meaning: 'Wasser' }, { char: '去', meaning: 'gehen' }],
    mnemonic: 'Das Wasser (氵) fließt seinen Weg (去) – nach den GESETZEN der Natur.',
  },

  // === LEKTION 2 ===
  '张': {
    parts: [{ char: '弓', meaning: 'Bogen' }, { char: '长', meaning: 'lang' }],
    mnemonic: 'Einen Bogen (弓) lang (长) aufspannen – ZÄHLWORT für flache, aufgespannte Dinge.',
  },
  '没': {
    parts: [{ char: '氵', meaning: 'Wasser' }, { char: '殳', meaning: 'Hand mit Stock' }],
    mnemonic: 'Ins Wasser (氵) geschlagen – versunken, NICHT mehr da!',
  },
  '有': {
    parts: [{ char: '𠂇', meaning: 'Hand' }, { char: '月', meaning: 'Mond/Fleisch' }],
    mnemonic: 'Die Hand greift nach dem Mond (月) – ich HABE ihn gefangen!',
  },
  '两': {
    parts: [{ char: '一', meaning: 'Deckel' }, { char: '两点', meaning: 'zwei Punkte' }],
    mnemonic: 'Unter dem Deckel verstecken sich ZWEI Dinge – genau zwei!',
  },
  '支': {
    parts: [{ char: '十', meaning: 'zehn' }, { char: '又', meaning: 'Hand' }],
    mnemonic: 'Eine Hand (又) hält einen Stab (十) – ZÄHLWORT für Stabförmiges (Stifte!).',
  },
  '个': {
    parts: [{ char: '人', meaning: 'Person' }, { char: '丨', meaning: 'Strich' }],
    mnemonic: 'Ein Mensch (人) steht allein – das allgemeinste ZÄHLWORT für Einzeldinge.',
  },
  '这': {
    parts: [{ char: '辶', meaning: 'gehen' }, { char: '文', meaning: 'Schrift' }],
    mnemonic: 'Geh (辶) zu DIESER Schrift (文) hier – DIESES da!',
  },
  '的': {
    parts: [{ char: '白', meaning: 'weiß' }, { char: '勺', meaning: 'Löffel' }],
    mnemonic: 'Der weiße (白) Löffel (勺) – MEINER! (Besitz-Partikel)',
  },
  '书': {
    parts: [],
    mnemonic: 'Vereinfacht aus Pinselstrichen – ein BUCH, geschrieben mit dem Pinsel. 📖',
  },
  '词': {
    parts: [{ char: '讠', meaning: 'Sprache' }, { char: '司', meaning: 'verwalten' }],
    mnemonic: 'Sprache (讠) verwalten (司) – ein WORT, die kleinste Einheit der Sprache.',
  },
  '典': {
    parts: [{ char: '曲', meaning: 'Bücherregal' }, { char: '八', meaning: 'Tischbeine' }],
    mnemonic: 'Bücher auf einem Tisch aufgereiht – ein NACHSCHLAGEWERK, ein Lexikon!',
  },
  '地': {
    parts: [{ char: '土', meaning: 'Erde' }, { char: '也', meaning: 'auch' }],
    mnemonic: 'Erde (土) ist auch (也) hier – BODEN unter den Füßen.',
  },
  '图': {
    parts: [{ char: '囗', meaning: 'Rahmen' }, { char: '冬', meaning: 'Winter' }],
    mnemonic: 'Ein Winterbild im Rahmen (囗) – ein BILD, eine Karte! 🖼️',
  },
  '子': {
    parts: [],
    mnemonic: 'Ein Baby mit ausgestreckten Armen – ein KIND! 👶',
  },
  '笔': {
    parts: [{ char: '⺮', meaning: 'Bambus' }, { char: '毛', meaning: 'Haar' }],
    mnemonic: 'Bambus (⺮) und Haar (毛) – ein Pinsel, ein STIFT! ✏️',
  },

  // === LEKTION 3 ===
  '妈': {
    parts: [{ char: '女', meaning: 'Frau' }, { char: '马', meaning: 'Pferd' }],
    mnemonic: 'Die Frau (女) auf dem Pferd (马) – deine MUTTER eilt nach Hause! 🐴',
  },
  '姐': {
    parts: [{ char: '女', meaning: 'Frau' }, { char: '且', meaning: 'zudem/außerdem' }],
    mnemonic: 'Die Frau (女), die zudem (且) schon größer ist – deine ÄLTERE SCHWESTER.',
  },
  '妹': {
    parts: [{ char: '女', meaning: 'Frau' }, { char: '未', meaning: 'noch nicht' }],
    mnemonic: 'Die Frau (女), die noch nicht (未) erwachsen ist – deine JÜNGERE SCHWESTER.',
  },
  '哥': {
    parts: [{ char: '可', meaning: 'können' }, { char: '可', meaning: 'können' }],
    mnemonic: 'Doppelt fähig (可可) – dein ÄLTERER BRUDER kann einfach alles! 💪',
  },
  '弟': {
    parts: [{ char: '弓', meaning: 'Bogen' }, { char: '丿', meaning: 'Strich' }],
    mnemonic: 'Der Kleine übt noch mit dem Bogen (弓) – dein JÜNGERER BRUDER.',
  },
  '和': {
    parts: [{ char: '禾', meaning: 'Getreide' }, { char: '口', meaning: 'Mund' }],
    mnemonic: 'Getreide (禾) für jeden Mund (口) – Frieden UND Harmonie.',
  },
  '全': {
    parts: [{ char: '入', meaning: 'eintreten' }, { char: '王', meaning: 'König' }],
    mnemonic: 'Der König (王) betritt (入) den Raum – ALLE sind da, es ist GANZ vollständig!',
  },
  '爸': {
    parts: [{ char: '父', meaning: 'Vater' }, { char: '巴', meaning: 'klammern' }],
    mnemonic: 'Der Vater (父) an den man sich klammert (巴) – PAPA! 👨',
  },
  '家': {
    parts: [{ char: '宀', meaning: 'Dach' }, { char: '豕', meaning: 'Schwein' }],
    mnemonic: 'Ein Schwein (豕) unterm Dach (宀) – früher der Wohlstand einer FAMILIE! 🏠🐷',
  },
  '几': {
    parts: [],
    mnemonic: 'Sieht aus wie ein kleiner Tisch – WIE VIELE Sachen passen drauf? (Unter 10!)',
  },
  '照': {
    parts: [{ char: '日', meaning: 'Sonne' }, { char: '刀', meaning: 'Messer' }, { char: '口', meaning: 'Mund' }, { char: '灬', meaning: 'Feuer' }],
    mnemonic: 'Sonne (日) und Feuer (灬) SCHEINEN hell – wie beim FOTOGRAFIEREN! 📸',
  },
  '片': {
    parts: [],
    mnemonic: 'Ein Stück abgeschnitten – eine SCHEIBE, ein Schnitt. 🔪',
  },
  '做': {
    parts: [{ char: '亻', meaning: 'Person' }, { char: '古', meaning: 'alt' }, { char: '攵', meaning: 'schlagen/handeln' }],
    mnemonic: 'Eine Person (亻) handelt (攵) wie in alten (古) Zeiten – MACHEN und TUN!',
  },
  '工': {
    parts: [],
    mnemonic: 'Zwei Balken verbunden – ein Werkstück, ARBEIT! ⚒️',
  },
  '作': {
    parts: [{ char: '亻', meaning: 'Person' }, { char: '乍', meaning: 'plötzlich' }],
    mnemonic: 'Eine Person (亻) die plötzlich (乍) anfängt – an die ARBEIT!',
  },
  '夫': {
    parts: [{ char: '大', meaning: 'groß' }, { char: '一', meaning: 'Haarnadel' }],
    mnemonic: 'Ein großer (大) Mann mit Haarnadel (一) – ein erwachsener MANN.',
  },
}

/**
 * Get mnemonic data for a character
 * @param {string} hanzi
 * @returns {{ parts: Array<{char: string, meaning: string}>, mnemonic: string } | null}
 */
export function getMnemonic(hanzi) {
  return mnemonics[hanzi] || null
}
