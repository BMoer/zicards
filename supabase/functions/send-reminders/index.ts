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
            from: "字Cards <noreply@zicards.moerzinger.eu>",
            to: email,
            subject: `📚 ${totalDue} Karten warten auf dich!`,
            html: `
              <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
                <h2 style="font-size: 24px; margin-bottom: 8px;">字Cards</h2>
                <p>Hey! Du hast heute <strong>${totalDue} Karten</strong> zur Wiederholung:</p>
                <ul style="padding-left: 20px;">
                  ${dueChars > 0 ? `<li>${dueChars} Zeichen</li>` : ""}
                  ${dueSentences > 0 ? `<li>${dueSentences} Sätze</li>` : ""}
                </ul>
                <p>Regelmäßiges Wiederholen ist der Schlüssel! 🔑</p>
                <a href="https://zicards.moerzinger.eu"
                   style="display: inline-block; background: #C4553A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 8px;">
                  Jetzt üben →
                </a>
                <p style="color: #999; font-size: 12px; margin-top: 24px;">
                  Du bekommst diese Mail weil du die Erinnerung in 字Cards aktiviert hast.
                </p>
              </div>
            `,
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
