import { useState } from 'react'

export default function AuthForm({ onSignIn, onSignUp }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isLogin) {
        await onSignIn(email, password)
      } else {
        await onSignUp(email, password)
        setSignUpSuccess(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (signUpSuccess) {
    return (
      <div className="text-center py-12">
        <p className="font-hanzi text-4xl mb-4">✓</p>
        <p className="text-lg font-medium mb-2">Registrierung erfolgreich!</p>
        <p className="text-ink/60 text-sm">
          Bitte bestätige deine E-Mail-Adresse und melde dich dann an.
        </p>
        <button
          onClick={() => {
            setSignUpSuccess(false)
            setIsLogin(true)
          }}
          className="mt-6 text-terracotta hover:underline text-sm"
        >
          Zur Anmeldung
        </button>
      </div>
    )
  }

  return (
    <div className="py-12">
      <h1 className="font-hanzi text-5xl text-center mb-2">字Cards</h1>
      <p className="text-center text-ink/50 text-sm mb-8">Hànzì lernen, Zeichen für Zeichen</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail"
            required
            className="w-full px-4 py-3 border border-ink/20 rounded-lg bg-white focus:outline-none focus:border-ink/40 transition-colors"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort (min. 6 Zeichen)"
            required
            minLength={6}
            className="w-full px-4 py-3 border border-ink/20 rounded-lg bg-white focus:outline-none focus:border-ink/40 transition-colors"
          />
        </div>

        {error && <p className="text-terracotta text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-ink text-paper rounded-lg font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : isLogin ? 'Anmelden' : 'Registrieren'}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-ink/50">
        {isLogin ? 'Noch kein Konto?' : 'Schon registriert?'}{' '}
        <button
          onClick={() => {
            setIsLogin(!isLogin)
            setError(null)
          }}
          className="text-terracotta hover:underline"
        >
          {isLogin ? 'Registrieren' : 'Anmelden'}
        </button>
      </p>
    </div>
  )
}
