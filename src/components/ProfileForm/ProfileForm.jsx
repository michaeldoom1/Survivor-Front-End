import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import styles from './ProfileForm.module.css'

function ProfileForm({ onSaved, onCancel }) {
  const { user, updateProfile } = useAuth()
  const [firstName, setFirstName] = useState(user.first_name ?? '')
  const [lastName, setLastName] = useState(user.last_name ?? '')
  const [username, setUsername] = useState(user.username ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const saved = await updateProfile({ firstName, lastName, username })
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Edit Profile</h2>

        <label htmlFor="profile-first-name">First Name</label>
        <input
          id="profile-first-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <label htmlFor="profile-last-name">Last Name</label>
        <input
          id="profile-last-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <label htmlFor="profile-username">Username (optional)</label>
        <input
          id="profile-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Pick a fun display name"
        />

        {error && <p className="auth-error">{error}</p>}

        <div className={styles.actions}>
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileForm
