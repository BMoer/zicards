import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

// Abmeldung von der täglichen Erinnerung aus dem Link in der Mail, ohne Login
// (seit 20.10.2026). Die Seite meldet erst nach dem Klick ab: Mail-Scanner öffnen
// Links von selbst, ein Abmelden beim blossen Aufruf träfe Nutzer, die nie geklickt haben.

const FUNKTION = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unsubscribe`

export default function Abmelden() {
  const [params] = useSearchParams()
  const u = params.get('u') ?? ''
  const t = params.get('t') ?? ''
  const [stand, setStand] = useState('bereit') // bereit | laeuft | fertig | fehler
  const [fehler, setFehler] = useState('')

  const abmelden = async () => {
    setStand('laeuft')
    setFehler('')
    try {
      const res = await fetch(FUNKTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ u, t }),
      })
      const daten = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(daten.error || `Fehler ${res.status}`)
      setStand('fertig')
    } catch (e) {
      setFehler(e instanceof Error ? e.message : 'Abmelden hat nicht geklappt.')
      setStand('fehler')
    }
  }

  if (!u || !t) {
    return (
      <div className="max-w-sm mx-auto py-12 text-center">
        <p className="text-ink/60">Dieser Abmelde-Link ist unvollständig.</p>
        <p className="text-sm text-ink/40 mt-2">
          Du kannst die Erinnerung auch nach dem Anmelden in der Übersicht ausschalten.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto py-12 text-center">
      <h1 className="text-xl font-semibold">Tägliche Erinnerung</h1>
      {stand === 'fertig' ? (
        <>
          <p className="mt-4 text-ink/70">Erledigt. Du bekommst keine Erinnerungsmails mehr.</p>
          <p className="mt-2 text-sm text-ink/40">
            Wieder einschalten kannst du sie jederzeit in der <Link to="/" className="underline">Übersicht</Link>.
          </p>
        </>
      ) : (
        <>
          <p className="mt-4 text-ink/70">Möchtest du die tägliche Erinnerungsmail abbestellen?</p>
          <button
            type="button"
            onClick={abmelden}
            disabled={stand === 'laeuft'}
            className="mt-6 px-6 py-3 rounded-lg bg-ink text-white disabled:opacity-50"
          >
            {stand === 'laeuft' ? 'Einen Moment…' : 'Erinnerung abbestellen'}
          </button>
          {stand === 'fehler' && <p className="mt-4 text-sm text-red-600">{fehler}</p>}
        </>
      )}
    </div>
  )
}
