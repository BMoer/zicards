-- ZìCards: Mnemonics für die 27 L6-Zeichen — 2026-06-07
-- Ergänzt supabase/L6-content-2026-06-07.sql (Uhrzeit & Tagesablauf).
-- Echte Hooks (Radikal-/Komponentenzerlegung, Phonetik oder Gebrauchsanker),
-- im Stil von mnemonics-add-2026-05-25.sql.
-- Idempotent: upsert auf den hanzi-Primärschlüssel.

INSERT INTO public.mnemonics (hanzi, mnemonic, parts) VALUES
  -- ===== Uhrzeit =====
  ('点', 'Etwas Besetztes (占) über vier Feuerpunkten (灬) – jeder Punkt markiert eine Stelle: 点 = Punkt und volle STUNDE (八点 = 8 Uhr). ⏰',
   '[{"char":"占","meaning":"besetzen / Klang zhān"},{"char":"灬","meaning":"Feuer (vier Punkte)"}]'::jsonb),
  ('分', 'Ein Messer (刀) teilt (八) das Ganze in Stücke – 分 = teilen und MINUTE, das geteilte Stück einer Stunde. 🔪',
   '[{"char":"八","meaning":"teilen / acht"},{"char":"刀","meaning":"Messer"}]'::jsonb),
  ('刻', 'Mit dem Messer (刂) eine Kerbe einritzen – früher maß eine Kerbe im Wasserlauf die VIERTELSTUNDE. 刻 = Viertelstunde. 🔪',
   '[{"char":"亥","meaning":"Klang hài"},{"char":"刂","meaning":"Messer"}]'::jsonb),
  ('半', 'Ein Ochse, mittig geteilt (丷) – genau die HÄLFTE. 半 = halb (两点半 = halb drei). 🐂',
   '[{"char":"丷","meaning":"teilen (zwei Striche)"}]'::jsonb),
  ('差', 'Etwas weicht ab, es FEHLT noch ein Stück: 差五分五点 = fünf Minuten VOR fünf. 差 = fehlen / vor. ⏳',
   '[]'::jsonb),
  -- ===== Tageszeit =====
  ('上', 'Ein Strich ÜBER der Grundlinie – 上 zeigt nach OBEN (上午 = Vormittag, 上课 = Unterricht beginnt). ⬆️',
   '[]'::jsonb),
  ('下', 'Ein Strich UNTER der Grundlinie – 下 zeigt nach UNTEN (下午 = Nachmittag, 下课 = Schluss). ⬇️',
   '[]'::jsonb),
  ('午', 'Zur Mittagszeit steht die Sonne am höchsten – 午 = MITTAG (中午), die Stunde des Pferdes im alten Kalender. ☀️',
   '[]'::jsonb),
  ('早', 'Die Sonne (日) schon über dem Horizont (十) – es ist FRÜH am Morgen. 早上 = Morgen. 🌅',
   '[{"char":"日","meaning":"Sonne"},{"char":"十","meaning":"Horizont / zehn"}]'::jsonb),
  ('晚', 'Die Sonne (日) entkommt (免) hinter den Horizont – es wird SPÄT, Abend. 晚上 = Abend. 🌆',
   '[{"char":"日","meaning":"Sonne"},{"char":"免","meaning":"entkommen / Klang miǎn"}]'::jsonb),
  -- ===== Tagesablauf =====
  ('起', 'Sich selbst (己) in Bewegung setzen (走) – AUFSTEHEN. 起床 = aus dem Bett aufstehen. 🚶',
   '[{"char":"走","meaning":"laufen"},{"char":"己","meaning":"selbst"}]'::jsonb),
  ('床', 'Unter dem Dach (广) ein Gestell aus Holz (木) – das BETT. 起床 = aufstehen. 🛏️',
   '[{"char":"广","meaning":"Dach / Gebäude"},{"char":"木","meaning":"Holz"}]'::jsonb),
  ('睡', 'Die Augenlider (目) hängen herab (垂) – man SCHLÄFT ein. 睡觉 = schlafen. 😴',
   '[{"char":"目","meaning":"Auge"},{"char":"垂","meaning":"herabhängen"}]'::jsonb),
  ('觉', 'Wenn die Augen nichts mehr sehen (见), ist man im SCHLAF. 睡觉 = schlafen gehen. 💤',
   '[{"char":"见","meaning":"sehen"}]'::jsonb),
  ('课', 'Durch Sprechen (讠) erntet man die Früchte (果) des Wissens – der UNTERRICHT. 课 = Lektion (上课 = Unterricht haben). 📖',
   '[{"char":"讠","meaning":"sprechen"},{"char":"果","meaning":"Frucht / Ergebnis"}]'::jsonb),
  ('习', 'Wie ein Vogel, der Flügelschlag um Flügelschlag das Fliegen ÜBT – 习 = üben. 学习 = lernen. 🐦',
   '[]'::jsonb),
  -- ===== Zeit & Fragen =====
  ('现', 'Poliert man die Jade (王), wird sie sichtbar (见) – sie erscheint JETZT, im Augenblick. 现在 = jetzt. 💎',
   '[{"char":"王","meaning":"Jade"},{"char":"见","meaning":"sehen"}]'::jsonb),
  ('在', 'Ein Spross dringt gerade (才) in die Erde (土) – er ist da, BEFINDET sich an seinem Ort. 现在 = jetzt (im Hier-Sein). 🌱',
   '[{"char":"才","meaning":"gerade / Klang cái"},{"char":"土","meaning":"Erde"}]'::jsonb),
  ('时', 'Den Stand der Sonne (日) Maß für Maß (寸) ablesen – so misst man die ZEIT. 时间 = Zeit. 🕰️',
   '[{"char":"日","meaning":"Sonne"},{"char":"寸","meaning":"Maß / Zoll"}]'::jsonb),
  ('候', 'Eine Person (亻) wartet gespannt auf den richtigen ZEITPUNKT – 什么时候 = wann? ⏳',
   '[{"char":"亻","meaning":"Person"}]'::jsonb),
  ('间', 'Sonnenlicht (日) fällt durch den Türspalt (门) – der ZWISCHENRAUM dazwischen. 时间 = Zeit(-raum). 🚪',
   '[{"char":"门","meaning":"Tür"},{"char":"日","meaning":"Sonne"}]'::jsonb),
  ('问', 'Der Mund (口) an der Tür (门) – man klopft und FRAGT nach. 问题 = Frage. ❓',
   '[{"char":"门","meaning":"Tür"},{"char":"口","meaning":"Mund"}]'::jsonb),
  ('用', 'Sieht aus wie ein Eimer mit Henkel – ein Werkzeug, das man BENUTZT. 用 = benutzen / brauchen (不用谢 = keine Ursache). 🪣',
   '[]'::jsonb),
  ('钟', 'Eine Glocke aus Metall (钅) schlägt mittig (中) die volle Stunde – 钟 = Glocke und UHR. 🔔',
   '[{"char":"钅","meaning":"Metall"},{"char":"中","meaning":"Mitte"}]'::jsonb),
  -- ===== Zusatz-Zeichen =====
  ('请', 'Mit höflichen Worten (讠) – der Klang 青 (qīng) liefert „qǐng" – BITTE, ich lade ein. 请问 = darf ich fragen. 🙏',
   '[{"char":"讠","meaning":"sprechen"},{"char":"青","meaning":"Klang qīng"}]'::jsonb),
  ('题', 'Worüber der Kopf (页) nachdenkt – das THEMA, die FRAGE. 问题 = Frage / Problem. 🤔',
   '[{"char":"是","meaning":"Klang (von shì)"},{"char":"页","meaning":"Kopf / Seite"}]'::jsonb),
  ('班', 'Zwei Jadestücke (王 王), durch ein Messer (刂) getrennt – eine aufgeteilte Gruppe: die SCHICHT, die Klasse. 上班 = zur Arbeit. 👥',
   '[{"char":"王","meaning":"Jade"},{"char":"刂","meaning":"Messer"},{"char":"王","meaning":"Jade"}]'::jsonb)
ON CONFLICT (hanzi) DO UPDATE
  SET mnemonic = EXCLUDED.mnemonic, parts = EXCLUDED.parts;

-- Proof
SELECT hanzi, mnemonic FROM public.mnemonics
  WHERE hanzi IN ('点','分','刻','半','差','上','下','午','早','晚','起','床','睡','觉','课','习','现','在','时','候','间','问','用','钟','请','题','班')
  ORDER BY hanzi;
