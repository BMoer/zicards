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

  // === LEKTION 1 (Ergänzungen) ===
  '下': {
    parts: [],
    mnemonic: 'Eine Linie mit Punkt DARUNTER – was unter dem Horizont liegt. ⬇️',
  },
  '上': {
    parts: [],
    mnemonic: 'Eine Linie mit Punkt DRÜBER – was oberhalb schwebt. ⬆️',
  },
  '午': {
    parts: [],
    mnemonic: 'Ein stilisierter Stößel zum Stampfen – das tat man zur MITTAGszeit. ☀️',
  },
  '早': {
    parts: [{ char: '日', meaning: 'Sonne' }, { char: '十', meaning: 'zehn' }],
    mnemonic: 'Die Sonne (日) schon über dem Kreuz (十) – FRÜH am Morgen! 🌅',
  },
  '晚': {
    parts: [{ char: '日', meaning: 'Sonne' }, { char: '免', meaning: 'vermeiden' }],
    mnemonic: 'Die Sonne (日) zieht sich zurück (免) – SPÄT, es wird Abend. 🌙',
  },
  '安': {
    parts: [{ char: '宀', meaning: 'Dach' }, { char: '女', meaning: 'Frau' }],
    mnemonic: 'Eine Frau (女) sicher unterm Dach (宀) – RUHE und Frieden. 🏠',
  },
  '呢': {
    parts: [{ char: '口', meaning: 'Mund' }, { char: '尼', meaning: 'Nonne (phonetisch)' }],
    mnemonic: 'Der Mund (口) fragt zur Nonne (尼) hinüber: "…und du?" – Folgefrage.',
  },
  '意': {
    parts: [{ char: '音', meaning: 'Klang' }, { char: '心', meaning: 'Herz' }],
    mnemonic: 'Der Klang (音) aus dem Herzen (心) – die wahre BEDEUTUNG.',
  },
  '德': {
    parts: [{ char: '彳', meaning: 'Schritt' }, { char: '直', meaning: 'gerade' }, { char: '心', meaning: 'Herz' }],
    mnemonic: 'Aufrecht schreiten (彳) mit geradem (直) Herzen (心) – das ist TUGEND (auch: DEUTSCHLAND 🇩🇪).',
  },

  // === LEKTION 2 (Zahlen & Ergänzungen) ===
  '一': {
    parts: [],
    mnemonic: 'EIN einzelner Strich – EINS.',
  },
  '二': {
    parts: [],
    mnemonic: 'ZWEI Striche übereinander – ZWEI.',
  },
  '三': {
    parts: [],
    mnemonic: 'DREI Striche – DREI. (Bis hier ist Chinesisch einfach!)',
  },
  '四': {
    parts: [],
    mnemonic: 'Eine Box mit zwei Beinen drin – VIER Wände. 🟦',
  },
  '五': {
    parts: [],
    mnemonic: 'Ein Z zwischen zwei Horizontalen – FÜNF, wie die Finger einer Hand. ✋',
  },
  '六': {
    parts: [],
    mnemonic: 'Ein Dach mit zwei Beinen – SECHS versammeln sich darunter.',
  },
  '七': {
    parts: [],
    mnemonic: 'Ein Haken wie eine umgedrehte 7 – SIEBEN.',
  },
  '八': {
    parts: [],
    mnemonic: 'Zwei Beine, die nach außen auseinander gehen – ACHT.',
  },
  '九': {
    parts: [],
    mnemonic: 'Wie eine 7 mit Schwanz dran – NEUN.',
  },
  '十': {
    parts: [],
    mnemonic: 'Ein Plus-Zeichen, ein Kreuz – ZEHN. ➕',
  },
  '奥': {
    parts: [],
    mnemonic: 'Geheimnisvoll und tief – so mystisch wie ÖSTERREICH. 🇦🇹',
  },
  '利': {
    parts: [{ char: '禾', meaning: 'Getreide' }, { char: '刂', meaning: 'Messer' }],
    mnemonic: 'Mit scharfem Messer (刂) das Getreide (禾) schneiden – SCHARF & Vorteil!',
  },
  '文': {
    parts: [],
    mnemonic: 'Ein Mensch mit Mustern auf der Brust – SCHRIFT und Kultur.',
  },

  // === LEKTION 3 (Ergänzungen) ===
  '口': {
    parts: [],
    mnemonic: 'Ein offener MUND – und Zählwort für Personen im Haushalt. 👄',
  },
  '谁': {
    parts: [{ char: '讠', meaning: 'sprechen' }, { char: '隹', meaning: 'Kurzschwanz-Vogel' }],
    mnemonic: 'Wer (讠) spricht da? Nur ein Vogel (隹)! – WER?',
  },

  // === LEKTION 4 ===
  '女': {
    parts: [],
    mnemonic: 'Eine Figur mit gekreuzten Beinen – eine sitzende FRAU. 👩',
  },
  '男': {
    parts: [{ char: '田', meaning: 'Feld' }, { char: '力', meaning: 'Kraft' }],
    mnemonic: 'Wer mit Kraft (力) auf dem Feld (田) arbeitet – MANN. 💪',
  },
  '友': {
    parts: [],
    mnemonic: 'Zwei Hände, die sich reichen – FREUND. 🤝',
  },
  '朋': {
    parts: [{ char: '月', meaning: 'Mond' }, { char: '月', meaning: 'Mond' }],
    mnemonic: 'Zwei Monde (月月) nebeneinander – beste FREUNDE, immer zusammen.',
  },
  '习': {
    parts: [],
    mnemonic: 'Ein kleiner Flügel – junge Vögel ÜBEN das Fliegen. 🕊️',
  },
  '字': {
    parts: [{ char: '宀', meaning: 'Dach' }, { char: '子', meaning: 'Kind' }],
    mnemonic: 'Unterm Dach (宀) lernt das Kind (子) SCHRIFTZEICHEN.',
  },
  '难': {
    parts: [{ char: '又', meaning: 'Hand' }, { char: '隹', meaning: 'Vogel' }],
    mnemonic: 'Einen Vogel (隹) mit der Hand (又) fangen – SCHWIERIG! 🐦',
  },
  '英': {
    parts: [{ char: '艹', meaning: 'Gras' }, { char: '央', meaning: 'Zentrum' }],
    mnemonic: 'Die Blume (艹) im Zentrum (央) – herausragend (ENGLISCH).',
  },
  '班': {
    parts: [],
    mnemonic: 'Zwei Jade-Gruppen, von einem Messer (刂) getrennt – eine eingeteilte KLASSE.',
  },
  '都': {
    parts: [{ char: '者', meaning: 'jemand' }, { char: '阝', meaning: 'Stadt' }],
    mnemonic: 'ALLE Leute (者) aus der Stadt (阝) – ALLE zusammen.',
  },
  '名': {
    parts: [{ char: '夕', meaning: 'Abend' }, { char: '口', meaning: 'Mund' }],
    mnemonic: 'Am Abend (夕) ruft der Mund (口) den NAMEN – im Dunkeln hilft nur der Name.',
  },
  '进': {
    parts: [{ char: '辶', meaning: 'gehen' }, { char: '井', meaning: 'Brunnen' }],
    mnemonic: 'Man geht (辶) hinein zum Brunnen (井) – EINTRETEN.',
  },
  '哪': {
    parts: [{ char: '口', meaning: 'Mund' }, { char: '那', meaning: 'jenes' }],
    mnemonic: 'Der Mund (口) fragt: "jenes (那)?" – WELCHES denn?',
  },
  '少': {
    parts: [{ char: '小', meaning: 'klein' }],
    mnemonic: 'Ein klein (小) bisschen weniger – nur noch WENIG.',
  },
  '多': {
    parts: [{ char: '夕', meaning: 'Abend' }, { char: '夕', meaning: 'Abend' }],
    mnemonic: 'Abend (夕) auf Abend (夕) – VIELE Tage gesammelt.',
  },
  '语': {
    parts: [{ char: '讠', meaning: 'sprechen' }, { char: '吾', meaning: 'ich' }],
    mnemonic: 'Wenn ich (吾) spreche (讠) – das ist SPRACHE. 💬',
  },
  '同': {
    parts: [],
    mnemonic: 'Ein Rahmen mit "一口" drin – ein Mund sagt dasselbe: GEMEINSAM.',
  },
  '请': {
    parts: [{ char: '讠', meaning: 'sprechen' }, { char: '青', meaning: 'grün/jung' }],
    mnemonic: 'Mit frischem, grünem (青) Wort (讠) – BITTE sehr!',
  },
  '外': {
    parts: [{ char: '夕', meaning: 'Abend' }, { char: '卜', meaning: 'Wahrsagung' }],
    mnemonic: 'Abends (夕) wird draußen das Orakel (卜) befragt – FREMD & außen.',
  },

  // Compound words (Lektion 4)
  '多少': {
    parts: [{ char: '多', meaning: 'viel' }, { char: '少', meaning: 'wenig' }],
    mnemonic: 'Viel (多) oder wenig (少)? – Die Frage nach der Menge: WIEVIEL?',
  },
  '英语': {
    parts: [{ char: '英', meaning: 'englisch' }, { char: '语', meaning: 'Sprache' }],
    mnemonic: 'Die englische (英) Sprache (语) – ENGLISCH. 🇬🇧',
  },
  '朋友': {
    parts: [{ char: '朋', meaning: 'Freund' }, { char: '友', meaning: 'Freund' }],
    mnemonic: 'Zwei Monde (朋) und reichende Hände (友) – ein FREUND. 🤝',
  },
  '名字': {
    parts: [{ char: '名', meaning: 'Vorname' }, { char: '字', meaning: 'Schriftzeichen' }],
    mnemonic: 'Der Vorname (名) als Schriftzeichen (字) – der NAME.',
  },
  '同学': {
    parts: [{ char: '同', meaning: 'gemeinsam' }, { char: '学', meaning: 'lernen' }],
    mnemonic: 'Gemeinsam (同) lernen (学) – ein MITSCHÜLER. 📚',
  },
  '男生': {
    parts: [{ char: '男', meaning: 'männlich' }, { char: '生', meaning: 'leben' }],
    mnemonic: 'Männlich (男) geboren (生) – ein JUNGE. 👦',
  },
  '女生': {
    parts: [{ char: '女', meaning: 'weiblich' }, { char: '生', meaning: 'leben' }],
    mnemonic: 'Weiblich (女) geboren (生) – ein MÄDCHEN. 👧',
  },
  '外国': {
    parts: [{ char: '外', meaning: 'fremd' }, { char: '国', meaning: 'Land' }],
    mnemonic: 'Ein fremdes (外) Land (国) – das AUSLAND. 🌍',
  },

  // === LEKTION 5 ===
  '今': {
    parts: [],
    mnemonic: 'Ein Dach über dem Moment – genau in diesem Augenblick: HEUTE. ⏰',
  },
  '明': {
    parts: [{ char: '日', meaning: 'Sonne' }, { char: '月', meaning: 'Mond' }],
    mnemonic: 'Sonne (日) und Mond (月) zusammen – HELL! Und MORGEN kommt wieder. 🌞🌙',
  },
  '昨': {
    parts: [{ char: '日', meaning: 'Sonne/Tag' }, { char: '乍', meaning: 'plötzlich' }],
    mnemonic: 'Der Tag (日), der plötzlich (乍) vorbei war – GESTERN.',
  },
  '星': {
    parts: [{ char: '日', meaning: 'Sonne' }, { char: '生', meaning: 'gebären' }],
    mnemonic: 'Kleine Sonnen (日), die am Nachthimmel geboren (生) werden – STERNE. ⭐',
  },
  '月': {
    parts: [],
    mnemonic: 'Eine Mondsichel – MOND und MONAT. 🌙',
  },
  '期': {
    parts: [{ char: '其', meaning: 'jenes' }, { char: '月', meaning: 'Mond' }],
    mnemonic: 'Der bestimmte (其) Mond (月) – die festgesetzte FRIST. 🗓️',
  },
  '送': {
    parts: [{ char: '辶', meaning: 'gehen' }, { char: '关', meaning: 'Tor' }],
    mnemonic: 'Man geht (辶) mit jemandem bis zum Tor (关) – VERABSCHIEDEN & SCHICKEN.',
  },
  '礼': {
    parts: [{ char: '礻', meaning: 'Altar' }, { char: '乚', meaning: 'gebeugt' }],
    mnemonic: 'Vor dem Altar (礻) verbeugt (乚) man sich höflich – GESCHENK & Ritus. 🎁',
  },
  '物': {
    parts: [{ char: '牛', meaning: 'Rind' }, { char: '勿', meaning: 'nicht' }],
    mnemonic: 'Das Rind (牛) ist nicht (勿) nur Tier, sondern wertvolle SACHE.',
  },
  '乐': {
    parts: [],
    mnemonic: 'Ein Instrument mit gezupften Saiten – MUSIK bringt FREUDE. 🎵',
  },
  '高': {
    parts: [],
    mnemonic: 'Ein Turm mit mehreren Etagen – HOCH hinaus! 🗼',
  },
  '快': {
    parts: [{ char: '忄', meaning: 'Herz' }, { char: '夬', meaning: 'Entschluss' }],
    mnemonic: 'Das Herz (忄) fasst einen Entschluss (夬) – SCHNELL entschieden! ⚡',
  },
  '很': {
    parts: [{ char: '彳', meaning: 'Schritt' }, { char: '艮', meaning: 'fest' }],
    mnemonic: 'Mit festen (艮) Schritten (彳) – SEHR entschlossen!',
  },
  '兴': {
    parts: [],
    mnemonic: 'Viele Hände hochgerissen – FRÖHLICH feiern! 🙌',
  },

  // === LEKTION 6 ===
  '时': {
    parts: [{ char: '日', meaning: 'Sonne' }, { char: '寸', meaning: 'Maß' }],
    mnemonic: 'Die Sonne (日) gibt das Maß (寸) – ZEITPUNKT. ⏲️',
  },
  '候': {
    parts: [{ char: '亻', meaning: 'Person' }],
    mnemonic: 'Eine Person (亻) wartet mit Pfeil gespannt – den richtigen MOMENT abpassen. 🏹',
  },
  '点': {
    parts: [{ char: '占', meaning: 'festlegen' }, { char: '灬', meaning: 'Feuer' }],
    mnemonic: 'Kleine Funken (灬) markieren einen festen (占) PUNKT – Uhrzeit. 🕐',
  },
  '分': {
    parts: [{ char: '八', meaning: 'teilen' }, { char: '刀', meaning: 'Messer' }],
    mnemonic: 'Mit dem Messer (刀) etwas teilen (八) – MINUTE & TEILEN. ✂️',
  },
  '半': {
    parts: [{ char: '八', meaning: 'teilen' }, { char: '牛', meaning: 'Rind' }],
    mnemonic: 'Ein Rind (牛) wird geteilt (八) – in zwei HÄLFTEN. 🐄',
  },
  '起': {
    parts: [{ char: '走', meaning: 'gehen' }, { char: '己', meaning: 'selbst' }],
    mnemonic: 'Selbst (己) loslaufen (走) – AUFSTEHEN! 🚶',
  },
  '睡': {
    parts: [{ char: '目', meaning: 'Auge' }, { char: '垂', meaning: 'hängen' }],
    mnemonic: 'Das Auge (目) hängt (垂) schwer herunter – SCHLAFEN. 😴',
  },
  '觉': {
    parts: [{ char: '见', meaning: 'sehen' }],
    mnemonic: 'Augen zu, nicht mehr sehen (见) – SCHLAF. 💤',
  },
  '课': {
    parts: [{ char: '讠', meaning: 'sprechen' }, { char: '果', meaning: 'Frucht' }],
    mnemonic: 'Worte (讠), die Früchte (果) tragen – UNTERRICHT. 📚',
  },
  '现': {
    parts: [{ char: '王', meaning: 'Jade' }, { char: '见', meaning: 'sehen' }],
    mnemonic: 'Die Jade (王) wird sichtbar (见) – sie erscheint JETZT. 💎',
  },
  '在': {
    parts: [{ char: '土', meaning: 'Erde' }],
    mnemonic: 'Die Erde (土), auf der wir stehen – hier und JETZT.',
  },
  '床': {
    parts: [{ char: '广', meaning: 'Dach' }, { char: '木', meaning: 'Holz' }],
    mnemonic: 'Unter dem Dach (广) ein Holzgestell (木) – BETT. 🛏️',
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
