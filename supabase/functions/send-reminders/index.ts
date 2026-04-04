/**
 * Supabase Edge Function: Daily Reminder Emails
 *
 * Triggered via pg_cron or HTTP call.
 * Checks all users with reminder_enabled = true,
 * counts their due cards, and sends an email via Supabase Auth.
 *
 * Deploy: supabase functions deploy send-reminders
 * Cron:   SELECT cron.schedule('daily-reminders', '0 9 * * *',
 *           $$SELECT net.http_post(url := 'https://obpgcttudogwfobjwjgk.supabase.co/functions/v1/send-reminders',
 *             headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb) $$);
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CONFUCIUS_QUOTES = [
  { zh: "学而时习之，不亦说乎？", de: "Lernen und es immer wieder üben – ist das nicht erfreulich?" },
  { zh: "温故而知新，可以为师矣。", de: "Wer das Alte wiederholt und daraus Neues lernt, kann ein Lehrer sein." },
  { zh: "知之者不如好之者，好之者不如乐之者。", de: "Wissen ist gut, Begeisterung besser, Freude daran am besten." },
  { zh: "三人行，必有我师焉。", de: "Unter drei Wanderern ist bestimmt einer, der mein Lehrer sein kann." },
  { zh: "学而不思则罔，思而不学则殆。", de: "Lernen ohne zu denken ist nutzlos. Denken ohne zu lernen ist gefährlich." },
  { zh: "不怕慢，就怕站。", de: "Fürchte nicht die Langsamkeit, fürchte nur den Stillstand." },
  { zh: "千里之行，始于足下。", de: "Eine Reise von tausend Meilen beginnt mit dem ersten Schritt." },
  { zh: "有志者事竟成。", de: "Wer einen festen Willen hat, wird sein Ziel erreichen." },
  { zh: "敏而好学，不耻下问。", de: "Klug und lernbegierig sein, sich nicht schämen, andere zu fragen." },
  { zh: "己所不欲，勿施于人。", de: "Was du selbst nicht wünschst, das füge auch anderen nicht zu." },
  { zh: "知者乐水，仁者乐山。", de: "Der Weise erfreut sich am Wasser, der Gütige am Berg." },
  { zh: "过而不改，是谓过矣。", de: "Einen Fehler machen und ihn nicht korrigieren – das erst ist der wahre Fehler." },
  { zh: "工欲善其事，必先利其器。", de: "Wer gute Arbeit leisten will, muss zuerst sein Werkzeug schärfen." },
  { zh: "人无远虑，必有近忧。", de: "Wer nicht an die Zukunft denkt, wird bald Sorgen haben." },
  { zh: "学如不及，犹恐失之。", de: "Lerne, als könntest du es nicht erreichen, und fürchte, es wieder zu verlieren." },
  { zh: "默而识之，学而不厌。", de: "Still in sich aufnehmen, lernen ohne müde zu werden." },
  { zh: "朝闻道，夕死可矣。", de: "Wer morgens den rechten Weg erkennt, kann abends ruhig sterben." },
  { zh: "见贤思齐焉，见不贤而内自省也。", de: "Siehst du einen Weisen, strebe ihm gleich. Siehst du einen Toren, prüfe dich selbst." },
  { zh: "不患人之不己知，患不知人也。", de: "Sorge dich nicht, dass andere dich nicht kennen – sorge dich, dass du andere nicht verstehst." },
  { zh: "逝者如斯夫，不舍昼夜。", de: "Die Zeit fließt dahin wie dieses Wasser, Tag und Nacht ohne Unterlass." },
  { zh: "吾日三省吾身。", de: "Jeden Tag prüfe ich mich dreimal selbst." },
  { zh: "德不孤，必有邻。", de: "Tugend steht nicht allein. Sie hat immer Nachbarn." },
  { zh: "知之为知之，不知为不知，是知也。", de: "Zu wissen, was man weiß, und zu wissen, was man nicht weiß – das ist wahres Wissen." },
  { zh: "志于道，据于德，依于仁，游于艺。", de: "Strebe nach dem Weg, stütze dich auf Tugend, lehne dich an Güte, erfreue dich an den Künsten." },
  { zh: "岁寒，然后知松柏之后凋也。", de: "Erst in der Kälte des Winters erkennt man, dass die Kiefer immergrün ist." },
  { zh: "饭疏食饮水，曲肱而枕之，乐亦在其中矣。", de: "Einfaches Essen, Wasser trinken, den Arm als Kissen – auch darin liegt Freude." },
  { zh: "仁远乎哉？我欲仁，斯仁至矣。", de: "Ist Güte wirklich fern? Sobald ich sie wünsche, ist sie schon da." },
  { zh: "发愤忘食，乐以忘忧，不知老之将至。", de: "So eifrig, dass man das Essen vergisst, so freudig, dass man die Sorgen vergisst." },
  { zh: "后生可畏，焉知来者之不如今也。", de: "Die Jugend ist zu fürchten – wer weiß, ob die Kommenden nicht besser werden als wir?" },
  { zh: "巧言令色，鲜矣仁。", de: "Glatte Worte und ein einschmeichelndes Gesicht sind selten ein Zeichen von Güte." },
];

function getDailyQuote(): typeof CONFUCIUS_QUOTES[0] {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return CONFUCIUS_QUOTES[dayOfYear % CONFUCIUS_QUOTES.length];
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all users with reminders enabled
    const { data: settings, error: settingsErr } = await supabase
      .from("user_settings")
      .select("user_id, reminder_hour, last_reminder_sent")
      .eq("reminder_enabled", true);

    if (settingsErr) throw settingsErr;
    if (!settings || settings.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No users with reminders" }));
    }

    let sent = 0;

    for (const setting of settings) {
      // Skip if already sent today
      if (setting.last_reminder_sent) {
        const lastSent = new Date(setting.last_reminder_sent);
        const now = new Date();
        if (lastSent.toDateString() === now.toDateString()) continue;
      }

      // Count due cards
      const { data: dueCounts } = await supabase.rpc("get_due_counts", {
        p_user_id: setting.user_id,
      });

      const dueChars = dueCounts?.[0]?.due_characters || 0;
      const dueSentences = dueCounts?.[0]?.due_sentences || 0;
      const totalDue = Number(dueChars) + Number(dueSentences);

      if (totalDue === 0) continue;

      // Get user email
      const { data: userData } = await supabase.auth.admin.getUserById(setting.user_id);
      const email = userData?.user?.email;
      if (!email) continue;

      // Send email
      if (RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "字Cards <noreply@gridbert.at>",
            to: email,
            subject: `📚 ${totalDue} Karten warten auf dich!`,
            html: (() => {
              const quote = getDailyQuote();
              return `
              <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
                <h2 style="font-size: 24px; margin-bottom: 8px;">字Cards</h2>
                <p>Hey! Du hast heute <strong>${totalDue} Karten</strong> zur Wiederholung:</p>
                <ul style="padding-left: 20px;">
                  ${dueChars > 0 ? `<li>${dueChars} Zeichen</li>` : ""}
                  ${dueSentences > 0 ? `<li>${dueSentences} Sätze</li>` : ""}
                </ul>
                <a href="https://zicards.moerzinger.eu"
                   style="display: inline-block; background: #C4553A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 8px;">
                  Jetzt üben →
                </a>
                <div style="margin-top: 24px; padding: 16px; background: #f8f7f4; border-radius: 8px; border-left: 3px solid #C4553A;">
                  <p style="font-family: 'Noto Serif SC', serif; font-size: 18px; margin: 0 0 6px 0; color: #1A1A1A;">「${quote.zh}」</p>
                  <p style="font-size: 13px; margin: 0; color: #666; font-style: italic;">${quote.de}</p>
                  <p style="font-size: 11px; margin: 6px 0 0 0; color: #999;">— 孔子 (Konfuzius)</p>
                </div>
                <p style="color: #999; font-size: 12px; margin-top: 24px;">
                  Du bekommst diese Mail weil du die Erinnerung in 字Cards aktiviert hast.
                </p>
              </div>
            `})(),
          }),
        });
      }

      // Mark reminder as sent
      await supabase
        .from("user_settings")
        .update({ last_reminder_sent: new Date().toISOString() })
        .eq("user_id", setting.user_id);

      sent++;
    }

    return new Response(JSON.stringify({ sent, total_users: settings.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
