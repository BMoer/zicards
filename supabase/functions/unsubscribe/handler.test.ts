import { assertEquals } from "jsr:@std/assert@1";
import { abmeldeToken } from "../_shared/abmelde-token.ts";
import { verarbeite } from "./handler.ts";

const GEHEIM = "test-geheimnis-mindestens-32-zeichen-lang";
const USER = "055164cb-84f1-4273-820e-d4dc50a43dc9";
const BASIS = "https://x.supabase.co/functions/v1/unsubscribe";

function deps() {
  const abgemeldet: string[] = [];
  return {
    abgemeldet,
    d: {
      geheimnis: GEHEIM,
      abmelden: (u: string) => {
        abgemeldet.push(u);
        return Promise.resolve();
      },
    },
  };
}

Deno.test("POST aus der App mit gültigem Token meldet ab", async () => {
  const { abgemeldet, d } = deps();
  const t = await abmeldeToken(USER, GEHEIM);
  const res = await verarbeite(
    new Request(BASIS, { method: "POST", body: JSON.stringify({ u: USER, t }), headers: { "Content-Type": "application/json" } }),
    d,
  );
  assertEquals(res.status, 200);
  assertEquals(abgemeldet, [USER]);
});

Deno.test("One-Click-POST des Mailprogramms (RFC 8058) mit Parametern in der URL meldet ab", async () => {
  const { abgemeldet, d } = deps();
  const t = await abmeldeToken(USER, GEHEIM);
  const res = await verarbeite(
    new Request(`${BASIS}?u=${USER}&t=${t}`, {
      method: "POST",
      body: "List-Unsubscribe=One-Click",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
    d,
  );
  assertEquals(res.status, 200);
  assertEquals(abgemeldet, [USER]);
});

Deno.test("falsches Token meldet niemanden ab", async () => {
  const { abgemeldet, d } = deps();
  const t = await abmeldeToken("bfe8c879-2241-44f8-8223-187c87ff2f4c", GEHEIM);
  const res = await verarbeite(
    new Request(BASIS, { method: "POST", body: JSON.stringify({ u: USER, t }) }),
    d,
  );
  assertEquals(res.status, 403);
  assertEquals(abgemeldet, []);
});

Deno.test("GET meldet nicht ab — Mail-Scanner öffnen Links von selbst", async () => {
  const { abgemeldet, d } = deps();
  const t = await abmeldeToken(USER, GEHEIM);
  const res = await verarbeite(new Request(`${BASIS}?u=${USER}&t=${t}`), d);
  assertEquals(res.status, 405);
  assertEquals(abgemeldet, []);
});

Deno.test("kaputter Body ergibt 400 statt Absturz", async () => {
  const { d } = deps();
  const res = await verarbeite(
    new Request(BASIS, { method: "POST", body: "{kein json", headers: { "Content-Type": "application/json" } }),
    d,
  );
  assertEquals(res.status, 400);
});

Deno.test("CORS-Vorabfrage aus der App wird beantwortet", async () => {
  const { d } = deps();
  const res = await verarbeite(
    new Request(BASIS, { method: "OPTIONS", headers: { Origin: "https://zicards.moerzinger.eu" } }),
    d,
  );
  assertEquals(res.status, 204);
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), "https://zicards.moerzinger.eu");
});
