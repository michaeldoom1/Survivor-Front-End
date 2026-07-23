import { useState } from 'react'
import { createEpisodePost, updateEpisodePost } from '../../api/episodePosts'
import styles from './EpisodePostForm.module.css'

function EpisodePostForm({ seasonId, episodeNumber, episodePost, onSaved, onCancel }) {
  const isEditing = Boolean(episodePost)

  const [recap, setRecap] = useState(episodePost?.recap ?? '')
  const [superlatives, setSuperlatives] = useState(episodePost?.superlatives ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = { season_id: seasonId, episode_number: episodeNumber, recap, superlatives }
      const saved = isEditing ? await updateEpisodePost(episodePost.id, payload) : await createEpisodePost(payload)
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
        <h2>Episode {episodeNumber} Recap</h2>

        <label htmlFor="episode-recap">Recap</label>
        <textarea id="episode-recap" value={recap} onChange={(e) => setRecap(e.target.value)} rows={8} />

        <label htmlFor="episode-superlatives">Superlatives And Awards</label>
        <p className={styles.hint}>One per line — each line becomes its own item in the list.</p>
        <textarea
          id="episode-superlatives"
          value={superlatives}
          onChange={(e) => setSuperlatives(e.target.value)}
          rows={5}
        />

        {error && <p className="auth-error">{error}</p>}

        <div className={styles.actions}>
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EpisodePostForm
