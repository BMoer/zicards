/**
 * Abmeldung von der täglichen Erinnerung, ohne Login (seit 20.10.2026).
 *
 * Zwei Wege, beide POST:
 *  - aus der App-Seite /abmelden: JSON-Body { u, t }
 *  - One-Click aus dem Mailprogramm (List-Unsubscribe-Post, RFC 8058): u und t
 *    stehen in der URL, der Body ist "List-Unsubscribe=One-Click"
 *
 * GET meldet bewusst NICHT ab: Mail-Scanner öffnen Links in Mails von selbst, ein
 * GET-Abmelden würde Nutzer abmelden, die nie geklickt haben.
 */
import { pruefeAbmeldeToken } from "../_shared/abmelde-token.ts";

export interface Abhaengigkeiten {
  geheimnis: string;
  abmelden: (userId: string) => Promise<void>;
}

const ERLAUBTE_ORIGINS = new Set([
  "https://zicards.moerzinger.eu",
  "https://zicards.vercel.app",
  "http://localhost:5173",
]);

function corsKoepfe(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  if (!ERLAUBTE_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Vary": "Origin",
  };
}

function antwort(req: Request, status: number, daten: unknown): Response {
  return new Response(JSON.stringify(daten), {
    status,
    headers: { "Content-Type": "application/json", ...corsKoepfe(req) },
  });
}

async function parameter(req: Request): Promise<{ u: string; t: string } | null> {
  let url: URL;
  try {
    url = new URL(req.url);
  } catch {
    return null;
  }
  const ausUrl = { u: url.searchParams.get("u") ?? "", t: url.searchParams.get("t") ?? "" };
  if (ausUrl.u && ausUrl.t) return ausUrl;
  try {
    const body = await req.json() as Record<string, unknown>;
    return { u: String(body.u ?? ""), t: String(body.t ?? "") };
  } catch {
    return null;
  }
}

export async function verarbeite(req: Request, d: Abhaengigkeiten): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsKoepfe(req) });
  }
  if (req.method !== "POST") {
    return antwort(req, 405, { error: "Bitte über https://zicards.moerzinger.eu/abmelden abmelden." });
  }
  const p = await parameter(req);
  if (!p) return antwort(req, 400, { error: "Ungültige Anfrage." });
  if (!(await pruefeAbmeldeToken(p.u, p.t, d.geheimnis))) {
    return antwort(req, 403, { error: "Der Abmelde-Link ist ungültig." });
  }
  try {
    await d.abmelden(p.u);
  } catch (e) {
    console.error("unsubscribe: Abmelden fehlgeschlagen", e instanceof Error ? e.message : e);
    return antwort(req, 500, { error: "Abmelden hat nicht geklappt. Bitte später nochmal versuchen." });
  }
  return antwort(req, 200, { ok: true });
}
