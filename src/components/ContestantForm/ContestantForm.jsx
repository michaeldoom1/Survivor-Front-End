import { useState } from 'react'
import { createContestant, updateContestant } from '../../api/contestants'
import styles from './ContestantForm.module.css'

function ContestantForm({ seasons, contestant, onSaved, onCancel }) {
  const isEditing = Boolean(contestant)

  const [name, setName] = useState(contestant?.name ?? '')
  const [gender, setGender] = useState(contestant?.gender ?? 'Male')
  const [seasonId, setSeasonId] = useState(contestant?.season_id ?? seasons[0]?.id ?? '')
  const [tribename, setTribename] = useState(contestant?.tribename ?? '')
  const [occupation, setOccupation] = useState(contestant?.occupation ?? '')
  const [age, setAge] = useState(contestant?.age ?? '')
  const [photoUrl, setPhotoUrl] = useState(contestant?.photo_url ?? '')
  const [videoUrl, setVideoUrl] = useState(contestant?.video_url ?? '')
  const [bio, setBio] = useState(contestant?.bio ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        name,
        gender,
        season_id: seasonId,
        tribename: tribename || null,
        occupation: occupation || null,
        age: age || null,
        photo_url: photoUrl || null,
        video_url: videoUrl || null,
        bio: bio || null,
      }
      const saved = isEditing ? await updateContestant(contestant.id, payload) : await createContestant(payload)
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
        <h2>{isEditing ? 'Edit Contestant' : 'Create Contestant'}</h2>

        <label htmlFor="contestant-name">Name</label>
        <input id="contestant-name" value={name} onChange={(e) => setName(e.target.value)} required />

        <label htmlFor="contestant-gender">Gender</label>
        <select id="contestant-gender" value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <label htmlFor="contestant-season">Season</label>
        <select id="contestant-season" value={seasonId} onChange={(e) => setSeasonId(e.target.value)} required>
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              Season {season.number}
            </option>
          ))}
        </select>

        <label htmlFor="contestant-tribe">Tribe Name</label>
        <input id="contestant-tribe" value={tribename} onChange={(e) => setTribename(e.target.value)} />

        <label htmlFor="contestant-occupation">Occupation</label>
        <input id="contestant-occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} />

        <label htmlFor="contestant-age">Age</label>
        <input id="contestant-age" type="number" min="1" value={age} onChange={(e) => setAge(e.target.value)} />

        <label htmlFor="contestant-photo">Photo URL</label>
        <input id="contestant-photo" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />

        <label htmlFor="contestant-video">Video URL</label>
        <input id="contestant-video" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />

        <label htmlFor="contestant-bio">Bio</label>
        <textarea id="contestant-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={6} />

        {error && <p className="auth-error">{error}</p>}

        <div className={styles.actions}>
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Contestant'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ContestantForm
