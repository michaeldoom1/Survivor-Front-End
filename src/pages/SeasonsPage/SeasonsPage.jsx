import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchSeasons } from '../../api/seasons'
import ContestantForm from '../../components/ContestantForm/ContestantForm'
import { PICKS_DEADLINE, PICKS_SEASON_NUMBER } from '../../constants/picks'
import styles from './SeasonsPage.module.css'

function SeasonsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [seasons, setSeasons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [now, setNow] = useState(() => new Date())
  const [showCreateContestant, setShowCreateContestant] = useState(false)

  useEffect(() => {
    fetchSeasons()
      .then(setSeasons)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(interval)
  }, [])

  const picksClosed = now >= PICKS_DEADLINE
  const sortedSeasons = [...seasons].sort((a, b) => a.number - b.number)
  const pickableSeason = seasons.find((season) => season.number === PICKS_SEASON_NUMBER)

  function handleSeasonClick(season) {
    const picksOpenForSeason = season.number === PICKS_SEASON_NUMBER && !picksClosed
    navigate(picksOpenForSeason ? `/contestants/${season.number}` : `/scores/${season.number}`)
  }

  return (
    <div className={styles.seasonsPage}>
      <header className={styles.seasonsHeader}>
        <h1>The Survivor League</h1>
        <h2>OUTWIT OUTLAST OUTPLAY</h2>
        <div>
          <span>{user.email}</span>
          <button onClick={() => navigate('/rules')}>Rules</button>
          <button onClick={logout}>Log Out</button>
        </div>
      </header>

      {user.admin && (
        <div className={styles.adminActions}>
          <button onClick={() => setShowCreateContestant(true)}>Create Contestant</button>
        </div>
      )}

      {loading && <p>Loading seasons...</p>}
      {error && <p className="auth-error">{error}</p>}

      <ul className={styles.seasonList}>
        {sortedSeasons.map((season) => (
          <li key={season.id}>
            <button className={styles.seasonButton} onClick={() => handleSeasonClick(season)}>
              Season {season.number}
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.picksButtonWrapper}>
        <button
          className={styles.picksButton}
          disabled={picksClosed || !pickableSeason}
          onClick={() => navigate(`/contestants/${PICKS_SEASON_NUMBER}`)}
          title={
            picksClosed
              ? 'Picks are closed for this season.'
              : `Picks close September 21, 2026 at 8:00 PM ET`
          }
        >
          {picksClosed ? 'Picks Closed' : `Pick Your Contestants for Season ${PICKS_SEASON_NUMBER}`}
        </button>
      </div>

      {showCreateContestant && (
        <ContestantForm
          seasons={sortedSeasons}
          onCancel={() => setShowCreateContestant(false)}
          onSaved={() => setShowCreateContestant(false)}
        />
      )}
    </div>
  )
}

export default SeasonsPage
