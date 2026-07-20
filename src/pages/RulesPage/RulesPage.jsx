import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchScoringEvents } from '../../api/scoringEvents'
import styles from './RulesPage.module.css'

function RulesPage() {
  const navigate = useNavigate()
  const [scoringEvents, setScoringEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchScoringEvents()
      .then(setScoringEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const earning = scoringEvents.filter((e) => e.points > 0).sort((a, b) => b.points - a.points)
  const losing = scoringEvents.filter((e) => e.points < 0).sort((a, b) => a.points - b.points)

  return (
    <div className={styles.rulesPage}>
      <div className={styles.header}>
        <button onClick={() => navigate('/')}>&larr; Back to Seasons</button>
        <h1>Scoring Rules</h1>
      </div>

      {loading && <p>Loading rules...</p>}
      {error && <p className="auth-error">{error}</p>}

      {!loading && !error && (
        <div className={styles.columns}>
          <section>
            <h2 className={styles.earnHeading}>Earn Points</h2>
            <ul className={styles.ruleList}>
              {earning.map((event) => (
                <li key={event.id}>
                  <span>{event.name}</span>
                  <span className={styles.earnPoints}>+{event.points}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className={styles.loseHeading}>Lose Points</h2>
            <ul className={styles.ruleList}>
              {losing.map((event) => (
                <li key={event.id}>
                  <span>{event.name}</span>
                  <span className={styles.losePoints}>{event.points}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}

export default RulesPage
