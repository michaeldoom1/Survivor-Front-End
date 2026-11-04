import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchSeasons } from '../../api/seasons'
import { fetchContestants } from '../../api/contestants'
import { fetchScoringEvents } from '../../api/scoringEvents'
import {
  fetchSeasonEpisodeScores,
  createEpisodeScore,
  updateEpisodeScore,
  deleteEpisodeScore,
} from '../../api/episodeScores'
import { EXIT_EVENTS } from '../ScoresPage/seasonStats'
import styles from './ScoreEntryPage.module.css'

function ScoreEntryPage() {
  const { seasonNumber, episodeNumber } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [season, setSeason] = useState(null)
  const [contestants, setContestants] = useState([])
  const [scoringEvents, setScoringEvents] = useState([])
  const [scores, setScores] = useState([])
  const [exitEpisodes, setExitEpisodes] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingKey, setSavingKey] = useState(null)

  const selectedEpisode = Number(episodeNumber)

  useEffect(() => {
    let cancelled = false
    let matchedSeasonId = null
    setLoading(true)
    setError('')

    fetchSeasons()
      .then((seasons) => {
        const matchedSeason = seasons.find((s) => s.number === Number(seasonNumber))
        if (!matchedSeason) {
          if (!cancelled) setError('Season not found.')
          return null
        }
        matchedSeasonId = matchedSeason.id
        if (!cancelled) setSeason(matchedSeason)
        return Promise.all([
          fetchContestants(),
          fetchScoringEvents(),
          fetchSeasonEpisodeScores(matchedSeason.id),
        ])
      })
      .then((data) => {
        if (!data || cancelled) return
        const [allContestants, events, seasonScores] = data
        const exitEventIds = events.filter((e) => EXIT_EVENTS.includes(e.name)).map((e) => e.id)
        const exits = {}
        for (const s of seasonScores) {
          if (exitEventIds.includes(s.scoring_event_id)) {
            exits[s.contestant_id] = Math.min(exits[s.contestant_id] ?? Infinity, s.episode_number)
          }
        }
        setContestants(allContestants.filter((c) => c.season_id === matchedSeasonId))
        setScoringEvents(events)
        setExitEpisodes(exits)
        setScores(seasonScores.filter((s) => s.episode_number === selectedEpisode))
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
  }, [seasonNumber, selectedEpisode])

  if (!user.admin) {
    return (
      <div className={styles.entryPage}>
        <div className={styles.header}>
          <button onClick={() => navigate(`/scores/${seasonNumber}`)}>&larr; Back to Scores</button>
        </div>
        <p className="auth-error">You don't have access to this page.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.entryPage}>
        <p>Loading score entry...</p>
      </div>
    )
  }

  if (error || !season) {
    return (
      <div className={styles.entryPage}>
        <div className={styles.header}>
          <button onClick={() => navigate(`/scores/${seasonNumber}`)}>&larr; Back to Scores</button>
        </div>
        <p className="auth-error">{error || 'Season not found.'}</p>
      </div>
    )
  }

  // Anyone who left the game before this episode moves to the end (most
  // recent exit first) so the players still in it come first. Someone who
  // leaves in this episode stays put, since they still score this week.
  const isOut = (c) => exitEpisodes[c.id] != null && exitEpisodes[c.id] < selectedEpisode
  const orderedContestants = [
    ...contestants.filter((c) => !isOut(c)),
    ...contestants.filter(isOut).sort((a, b) => exitEpisodes[b.id] - exitEpisodes[a.id]),
  ]

  function scoreFor(contestantId, scoringEventId) {
    return scores.find((s) => s.contestant_id === contestantId && s.scoring_event_id === scoringEventId)
  }

  async function handleCellChange(contestant, scoringEvent, rawValue) {
    const key = `${contestant.id}-${scoringEvent.id}`
    const existing = scoreFor(contestant.id, scoringEvent.id)
    const count = rawValue === '' ? 0 : Number(rawValue)

    setSavingKey(key)
    try {
      if (count <= 0) {
        if (existing) {
          await deleteEpisodeScore(existing.id)
          setScores((prev) => prev.filter((s) => s.id !== existing.id))
        }
        return
      }

      if (existing) {
        const updated = await updateEpisodeScore(existing.id, { count })
        setScores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      } else {
        const created = await createEpisodeScore({
          season_id: season.id,
          contestant_id: contestant.id,
          scoring_event_id: scoringEvent.id,
          episode_number: selectedEpisode,
          count,
        })
        setScores((prev) => [...prev, created])
      }
    } catch (err) {
      window.alert(`Could not save score: ${err.message}`)
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className={styles.entryPage}>
      <div className={styles.header}>
        <button onClick={() => navigate(`/scores/${seasonNumber}`)}>&larr; Back to Scores</button>
        <h1>Season {season.number} · Episode {selectedEpisode} Score Entry</h1>
      </div>

      <div className={styles.episodeNav}>
        <button
          disabled={selectedEpisode <= 1}
          onClick={() => navigate(`/scores/${seasonNumber}/entry/${selectedEpisode - 1}`)}
        >
          &larr; Ep {selectedEpisode - 1}
        </button>
        <span>Episode {selectedEpisode}</span>
        <button onClick={() => navigate(`/scores/${seasonNumber}/entry/${selectedEpisode + 1}`)}>
          Ep {selectedEpisode + 1} &rarr;
        </button>
      </div>

      {contestants.length === 0 ? (
        <p>No contestants have been added for this season yet.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.entryTable}>
            <thead>
              <tr>
                <th className={styles.eventHeader}>Scoring Event</th>
                {orderedContestants.map((c) => (
                  <th key={c.id} className={isOut(c) ? styles.outContestant : undefined}>
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scoringEvents.map((event) => (
                <tr key={event.id}>
                  <td className={styles.eventCell}>
                    {event.name} <span className={styles.eventPoints}>({event.points > 0 ? '+' : ''}{event.points})</span>
                  </td>
                  {orderedContestants.map((contestant) => {
                    const existing = scoreFor(contestant.id, event.id)
                    const key = `${contestant.id}-${event.id}`
                    return (
                      <td key={contestant.id}>
                        <input
                          type="number"
                          min="0"
                          className={styles.countInput}
                          defaultValue={existing?.count ?? ''}
                          disabled={savingKey === key}
                          onBlur={(e) => {
                            if (Number(e.target.value || 0) !== (existing?.count ?? 0)) {
                              handleCellChange(contestant, event, e.target.value)
                            }
                          }}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ScoreEntryPage
