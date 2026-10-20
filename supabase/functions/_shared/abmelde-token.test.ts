import { assert, assertEquals, assertFalse } from "jsr:@std/assert@1";
import { abmeldeLink, abmeldeToken, pruefeAbmeldeToken } from "./abmelde-token.ts";

const GEHEIM = "test-geheimnis-mindestens-32-zeichen-lang";
const USER = "055164cb-84f1-4273-820e-d4dc50a43dc9";

Deno.test("ein frisch erzeugtes Token wird akzeptiert", async () => {
  const token = await abmeldeToken(USER, GEHEIM);
  assert(await pruefeAbmeldeToken(USER, token, GEHEIM));
});

Deno.test("ein Token gilt nur für den eigenen Nutzer", async () => {
  // Sonst könnte jeder mit einem Link fremde Nutzer abmelden.
  const token = await abmeldeToken(USER, GEHEIM);
  assertFalse(await pruefeAbmeldeToken("bfe8c879-2241-44f8-8223-187c87ff2f4c", token, GEHEIM));
});

Deno.test("ein Token mit anderem Geheimnis wird abgelehnt", async () => {
  const token = await abmeldeToken(USER, "anderes-geheimnis-mindestens-32-zeichen");
  assertFalse(await pruefeAbmeldeToken(USER, token, GEHEIM));
});

Deno.test("leere oder kaputte Tokens werden abgelehnt", async () => {
  assertFalse(await pruefeAbmeldeToken(USER, "", GEHEIM));
  assertFalse(await pruefeAbmeldeToken(USER, "kaputt", GEHEIM));
});

Deno.test("der Link trägt Nutzer und Token URL-sicher", async () => {
  const link = await abmeldeLink("https://x.supabase.co/functions/v1/unsubscribe", USER, GEHEIM);
  const url = new URL(link);
  assertEquals(url.searchParams.get("u"), USER);
  assert(await pruefeAbmeldeToken(USER, url.searchParams.get("t") ?? "", GEHEIM));
});
