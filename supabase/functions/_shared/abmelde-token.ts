/**
 * Signierte Abmelde-Links für die Erinnerungsmails (seit 20.10.2026).
 *
 * Ein Link meldet genau einen Nutzer ab, ohne Login. Damit niemand fremde Nutzer
 * abmelden kann, trägt der Link ein HMAC-SHA256 über die user_id mit einem
 * Geheimnis, das nur die Edge Functions kennen (REMINDER_UNSUBSCRIBE_SECRET).
 */

const encoder = new TextEncoder();

async function schluessel(geheimnis: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(geheimnis),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function base64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function ausBase64url(text: string): Uint8Array<ArrayBuffer> | null {
  try {
    const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const bytes = new Uint8Array(new ArrayBuffer(bin.length));
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

export async function abmeldeToken(userId: string, geheimnis: string): Promise<string> {
  const sig = await crypto.subtle.sign("HMAC", await schluessel(geheimnis), encoder.encode(userId));
  return base64url(new Uint8Array(sig));
}

/** Prüft zeitkonstant über WebCrypto. Falsch bei leerem oder kaputtem Token. */
export async function pruefeAbmeldeToken(userId: string, token: string, geheimnis: string): Promise<boolean> {
  if (!userId || !token) return false;
  const sig = ausBase64url(token);
  if (!sig || sig.length !== 32) return false;
  return await crypto.subtle.verify("HMAC", await schluessel(geheimnis), sig, encoder.encode(userId));
}

export async function abmeldeLink(basis: string, userId: string, geheimnis: string): Promise<string> {
  let url: URL;
  try {
    url = new URL(basis);
  } catch {
    throw new Error(`Abmelde-Basis-URL ungültig: ${basis}`);
  }
  url.searchParams.set("u", userId);
  url.searchParams.set("t", await abmeldeToken(userId, geheimnis));
  return url.toString();
}
