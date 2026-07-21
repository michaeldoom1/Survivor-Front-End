import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchSeasons, deleteSeason } from '../../api/seasons'
import { fetchContestants, deleteContestant } from '../../api/contestants'
import { fetchMyPicks, createPick, updatePick } from '../../api/picks'
import ContestantCard from './ContestantCard'
import ContestantForm from '../../components/ContestantForm/ContestantForm'
import SeasonForm from '../../components/SeasonForm/SeasonForm'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import styles from './PicksPage.module.css'

const EMPTY_SELECTIONS = {
  male_contestant_id: null,
  female_contestant_id: null,
  golden_goose_contestant_id: null,
}

function PicksPage() {
  const { seasonNumber } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [season, setSeason] = useState(null)
  const [contestants, setContestants] = useState([])
  const [myPick, setMyPick] = useState(null)
  const [selections, setSelections] = useState(EMPTY_SELECTIONS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [editingContestant, setEditingContestant] = useState(null)
  const [now, setNow] = useState(() => new Date())
  const [showDeleteSeason, setShowDeleteSeason] = useState(false)
  const [deletingSeason, setDeletingSeason] = useState(false)
  const [deleteSeasonError, setDeleteSeasonError] = useState('')
  const [showEditSeason, setShowEditSeason] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setSeason(null)
    setMyPick(null)
    setSelections(EMPTY_SELECTIONS)

    Promise.all([fetchSeasons(), fetchContestants(), fetchMyPicks()])
      .then(([seasons, allContestants, myPicks]) => {
        if (cancelled) return

        const matchedSeason = seasons.find((s) => s.number === Number(seasonNumber))
        if (!matchedSeason) {
          setError('Season not found.')
          return
        }

        setSeason(matchedSeason)
        setContestants(allContestants.filter((c) => c.season_id === matchedSeason.id))

        const existingPick = myPicks.find((pick) => pick.season_id === matchedSeason.id)
        if (existingPick) {
          setMyPick(existingPick)
          setSelections({
            male_contestant_id: existingPick.male_contestant_id,
            female_contestant_id: existingPick.female_contestant_id,
            golden_goose_contestant_id: existingPick.golden_goose_contestant_id,
          })
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [seasonNumber])

  function togglePick(contestant, slot) {
    if (picksLocked) return
    setSelections((prev) => ({
      ...prev,
      [slot]: prev[slot] === contestant.id ? null : contestant.id,
    }))
  }

  function nameFor(id) {
    return contestants.find((c) => c.id === id)?.name
  }

  function handleContestantSaved(updatedContestant) {
    setContestants((prev) => prev.map((c) => (c.id === updatedContestant.id ? updatedContestant : c)))
    setEditingContestant(null)
  }

  async function handleContestantDelete(contestant) {
    try {
      await deleteContestant(contestant.id)
      setContestants((prev) => prev.filter((c) => c.id !== contestant.id))
    } catch (err) {
      window.alert(`Failed to delete ${contestant.name}: ${err.message}`)
    }
  }

  async function handleDeleteSeason() {
    setDeletingSeason(true)
    setDeleteSeasonError('')
    try {
      await deleteSeason(season.id)
      navigate('/')
    } catch (err) {
      setDeleteSeasonError(err.message)
      setDeletingSeason(false)
    }
  }

  const picksLocked = !season?.start_air_date || now >= new Date(season.start_air_date)
  const canSubmit =
    !picksLocked &&
    selections.male_contestant_id &&
    selections.female_contestant_id &&
    selections.golden_goose_contestant_id

  async function handleSubmit() {
    if (picksLocked || !season) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = { season_id: season.id, ...selections }
      const saved = myPick ? await updatePick(myPick.id, payload) : await createPick(payload)
      setMyPick(saved)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.picksPage}>
        <p>Loading contestants...</p>
      </div>
    )
  }

  if (error || !season) {
    return (
      <div className={styles.picksPage}>
        <div className={styles.header}>
          <button onClick={() => navigate('/')}>&larr; Back to Seasons</button>
        </div>
        <p className="auth-error">{error || 'Season not found.'}</p>
      </div>
    )
  }

  return (
    <div className={styles.picksPage}>
      <div className={styles.header}>
        <button onClick={() => navigate('/')}>&larr; Back to Seasons</button>
        <h1>Season {season.number} Picks</h1>
        {user.admin && (
          <>
            <button className={styles.editSeasonButton} onClick={() => setShowEditSeason(true)}>
              Edit Season
            </button>
            <button className={styles.deleteSeasonButton} onClick={() => setShowDeleteSeason(true)}>
              Delete Season
            </button>
          </>
        )}
      </div>

      {deleteSeasonError && <p className="auth-error">{deleteSeasonError}</p>}

      {myPick && (
        <div className={styles.banner}>
          <p>You've submitted your picks for Season {season.number}!</p>
          <div className={styles.summary}>
            <span>Male Pick: {nameFor(myPick.male_contestant_id)}</span>
            <span>Female Pick: {nameFor(myPick.female_contestant_id)}</span>
            <span>Golden Goose: {nameFor(myPick.golden_goose_contestant_id)}</span>
          </div>
          {picksLocked ? (
            <p className={styles.bannerNote}>Picks are locked now that the season has started.</p>
          ) : (
            <p className={styles.bannerNote}>You can change your picks until the season starts.</p>
          )}
        </div>
      )}

      {contestants.length === 0 && <p>No contestants have been announced for this season yet.</p>}

      <div className={styles.cardList}>
        {contestants.map((contestant) => (
          <ContestantCard
            key={contestant.id}
            contestant={contestant}
            selections={selections}
            onToggle={togglePick}
            isAdmin={user.admin}
            onEdit={() => setEditingContestant(contestant)}
            onDelete={() => handleContestantDelete(contestant)}
            picksLocked={picksLocked}
          />
        ))}
      </div>

      {editingContestant && (
        <ContestantForm
          seasons={[season]}
          contestant={editingContestant}
          onCancel={() => setEditingContestant(null)}
          onSaved={handleContestantSaved}
        />
      )}

      {contestants.length > 0 && (
        <div className={styles.submitBar}>
          <div className={styles.summary}>
            <span>Male Pick: {nameFor(selections.male_contestant_id) || '—'}</span>
            <span>Female Pick: {nameFor(selections.female_contestant_id) || '—'}</span>
            <span>Golden Goose: {nameFor(selections.golden_goose_contestant_id) || '—'}</span>
          </div>

          {submitError && <p className="auth-error">{submitError}</p>}

          <button onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {picksLocked ? 'Picks Locked' : submitting ? 'Saving...' : myPick ? 'Update Picks' : 'Submit Picks'}
          </button>
        </div>
      )}

      {showDeleteSeason && (
        <ConfirmDialog
          title="Delete Season"
          message={`Are you sure you want to delete Season ${season.number}? This cannot be undone.`}
          confirmLabel="Delete Season"
          submitting={deletingSeason}
          onCancel={() => setShowDeleteSeason(false)}
          onConfirm={handleDeleteSeason}
        />
      )}

      {showEditSeason && (
        <SeasonForm
          season={season}
          onCancel={() => setShowEditSeason(false)}
          onSaved={(updatedSeason) => {
            setSeason(updatedSeason)
            setShowEditSeason(false)
          }}
        />
      )}
    </div>
  )
}

export default PicksPage
