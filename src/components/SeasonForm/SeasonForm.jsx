import { useState } from 'react'
import { createSeason, updateSeason } from '../../api/seasons'
import styles from './SeasonForm.module.css'

// datetime-local inputs need "YYYY-MM-DDTHH:mm" in the browser's local time,
// with no timezone info. Converting through the individual date parts (rather
// than slicing an ISO string) keeps this in local time instead of UTC.
function toDatetimeLocalValue(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function SeasonForm({ season, onSaved, onCancel }) {
  const isEditing = Boolean(season)

  const [number, setNumber] = useState(season?.number ?? '')
  const [startAirDate, setStartAirDate] = useState(toDatetimeLocalValue(season?.start_air_date))
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        number,
        // The datetime-local value has no timezone, so the Date constructor
        // treats it as local time; toISOString() then converts that to a
        // proper UTC instant to send to the backend.
        start_air_date: startAirDate ? new Date(startAirDate).toISOString() : null,
      }
      const saved = isEditing ? await updateSeason(season.id, payload) : await createSeason(payload)
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
        <h2>{isEditing ? 'Edit Season' : 'Create Season'}</h2>

        <label htmlFor="season-number">Season Number</label>
        <input
          id="season-number"
          type="number"
          min="1"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />

        <label htmlFor="season-start-air-date">Start Air Date</label>
        <input
          id="season-start-air-date"
          type="datetime-local"
          value={startAirDate}
          onChange={(e) => setStartAirDate(e.target.value)}
        />

        {error && <p className="auth-error">{error}</p>}

        <div className={styles.actions}>
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Season'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SeasonForm
