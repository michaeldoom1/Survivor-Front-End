import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import styles from '../Auth.module.css'

function LoginPage({ onSwitchToSignup }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.authPage}>
      <img src="/logo.png" alt="Survivor Fantasy League" className={styles.logo} />
      <h1>Log In</h1>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p>
        Need an account?{' '}
        <button type="button" className="link-button" onClick={onSwitchToSignup}>
          Create one
        </button>
      </p>
    </div>
  )
}

export default LoginPage
