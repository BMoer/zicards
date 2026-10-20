/**
 * Supabase Edge Function: Abmeldung von der täglichen Erinnerung.
 * Logik und Tests: handler.ts / handler.test.ts.
 *
 * Deploy (öffentlich, ohne JWT — der signierte Link ist die Berechtigung):
 *   supabase functions deploy unsubscribe --no-verify-jwt
 * Secret (gemeinsam mit send-reminders):
 *   supabase secrets set REMINDER_UNSUBSCRIBE_SECRET=<zufällig, ≥ 32 Zeichen>
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verarbeite } from "./handler.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEHEIMNIS = Deno.env.get("REMINDER_UNSUBSCRIBE_SECRET") ?? "";

if (GEHEIMNIS.length < 32) {
  throw new Error("REMINDER_UNSUBSCRIBE_SECRET fehlt oder ist kürzer als 32 Zeichen");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve((req) =>
  verarbeite(req, {
    geheimnis: GEHEIMNIS,
    abmelden: async (userId) => {
      const { error } = await supabase
        .from("user_settings")
        .update({ reminder_enabled: false })
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
    },
  })
);
