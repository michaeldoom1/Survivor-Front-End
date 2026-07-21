import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchSeasons } from '../../api/seasons'
import ContestantForm from '../../components/ContestantForm/ContestantForm'
import SeasonForm from '../../components/SeasonForm/SeasonForm'
import ProfileForm from '../../components/ProfileForm/ProfileForm'
import styles from './SeasonsPage.module.css'

function isPickable(season, now) {
  return Boolean(season.start_air_date) && new Date(season.start_air_date) > now
}

function SeasonsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [seasons, setSeasons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [now, setNow] = useState(() => new Date())
  const [showCreateContestant, setShowCreateContestant] = useState(false)
  const [showCreateSeason, setShowCreateSeason] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)

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

  const sortedSeasons = [...seasons].sort((a, b) => a.number - b.number)
  const pickableSeason = seasons
    .filter((season) => isPickable(season, now))
    .sort((a, b) => new Date(a.start_air_date) - new Date(b.start_air_date))[0]

  function handleSeasonClick(season) {
    navigate(isPickable(season, now) ? `/contestants/${season.number}` : `/scores/${season.number}`)
  }

  return (
    <div className={styles.seasonsPage}>
      <header className={styles.seasonsHeader}>
        <img src="/logo.png" alt="Survivor Fantasy League" className={styles.logo} />
        <div>
          <span>{user.first_name} {user.last_name}</span>
          <button onClick={() => setShowEditProfile(true)}>Edit Profile</button>
          <button onClick={() => navigate('/rules')}>Rules</button>
          <button onClick={logout}>Log Out</button>
        </div>
      </header>

      {user.admin && (
        <div className={styles.adminActions}>
          <button onClick={() => setShowCreateContestant(true)}>Create Contestant</button>
          <button onClick={() => setShowCreateSeason(true)}>Create Season</button>
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

      {pickableSeason && (
        <div className={styles.picksButtonWrapper}>
          <button
            className={styles.picksButton}
            onClick={() => navigate(`/contestants/${pickableSeason.number}`)}
            title={`Picks close ${new Date(pickableSeason.start_air_date).toLocaleString()}`}
          >
            Pick Your Contestants for Season {pickableSeason.number}
          </button>
        </div>
      )}

      {showCreateContestant && (
        <ContestantForm
          seasons={sortedSeasons}
          onCancel={() => setShowCreateContestant(false)}
          onSaved={() => setShowCreateContestant(false)}
        />
      )}

      {showCreateSeason && (
        <SeasonForm
          onCancel={() => setShowCreateSeason(false)}
          onSaved={(season) => {
            setSeasons((prev) => [...prev, season])
            setShowCreateSeason(false)
          }}
        />
      )}

      {showEditProfile && (
        <ProfileForm onCancel={() => setShowEditProfile(false)} onSaved={() => setShowEditProfile(false)} />
      )}
    </div>
  )
}

export default SeasonsPage
