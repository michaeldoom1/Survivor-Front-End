import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import styles from '../Auth.module.css'

function CreateUserPage({ onSwitchToLogin }) {
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signup(email, password, passwordConfirmation)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.authPage}>
      <h1>Create User</h1>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="signup-password-confirmation">Confirm Password</label>
        <input
          id="signup-password-confirmation"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
        />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p>
        Already have an account?{' '}
        <button type="button" className="link-button" onClick={onSwitchToLogin}>
          Log in
        </button>
      </p>
    </div>
  )
}

export default CreateUserPage
