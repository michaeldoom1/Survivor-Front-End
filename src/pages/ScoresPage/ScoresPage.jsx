import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchSeasons, deleteSeason } from '../../api/seasons'
import { fetchContestantScores } from '../../api/contestants'
import { fetchPicksBySeason } from '../../api/picks'
import EpisodeDetailModal from './EpisodeDetailModal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import SeasonForm from '../../components/SeasonForm/SeasonForm'
import styles from './ScoresPage.module.css'

function ScoresPage() {
  const { seasonNumber } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [season, setSeason] = useState(null)
  const [contestants, setContestants] = useState([])
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCell, setSelectedCell] = useState(null)
  const [showDeleteSeason, setShowDeleteSeason] = useState(false)
  const [deletingSeason, setDeletingSeason] = useState(false)
  const [deleteSeasonError, setDeleteSeasonError] = useState('')
  const [showEditSeason, setShowEditSeason] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    fetchSeasons()
      .then((seasons) => {
        const matchedSeason = seasons.find((s) => s.number === Number(seasonNumber))
        if (!matchedSeason) {
          if (!cancelled) setError('Season not found.')
          return null
        }
        if (!cancelled) setSeason(matchedSeason)
        return Promise.all([fetchContestantScores(matchedSeason.id), fetchPicksBySeason(matchedSeason.id)])
      })
      .then((data) => {
        if (data && !cancelled) {
          const [contestantScores, picks] = data
          setContestants(contestantScores)
          setStandings(picks)
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

  if (loading) {
    return (
      <div className={styles.scoresPage}>
        <p>Loading scores...</p>
      </div>
    )
  }

  if (error || !season) {
    return (
      <div className={styles.scoresPage}>
        <div className={styles.header}>
          <button onClick={() => navigate('/')}>&larr; Back to Seasons</button>
        </div>
        <p className="auth-error">{error || 'Season not found.'}</p>
      </div>
    )
  }

  const episodeNumbers = [
    ...new Set(contestants.flatMap((c) => c.episode_scores.map((es) => es.episode_number))),
  ].sort((a, b) => a - b)

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

  const EXIT_EVENTS = ['Getting voted out', 'Medical evacuation', 'Losing a fire-making challenge']

  function exitEpisode(contestant) {
    return contestant.episode_scores.find((es) => EXIT_EVENTS.includes(es.scoring_event))?.episode_number ?? null
  }

  function winEpisode(contestant) {
    return contestant.episode_scores.find((es) => es.scoring_event === 'Winning')?.episode_number ?? null
  }

  function votesToWin(contestant) {
    return contestant.episode_scores
      .filter((es) => es.scoring_event === 'Receiving a vote to win')
      .reduce((sum, es) => sum + es.points, 0)
  }

  // The season winner always sits at the very top, regardless of points.
  // Next comes the runner-up order, ranked by jury votes received (most
  // votes to win first). Everyone else sorts by total points, then
  // contestants who left the game stack in reverse elimination order, so
  // whoever left first ends up at the very bottom.
  const sortedContestants = [...contestants].sort((a, b) => {
    const aWon = winEpisode(a) !== null
    const bWon = winEpisode(b) !== null
    if (aWon !== bWon) return aWon ? -1 : 1

    const aVotes = votesToWin(a)
    const bVotes = votesToWin(b)
    if (aVotes !== bVotes) return bVotes - aVotes

    const aEp = exitEpisode(a) ?? Infinity
    const bEp = exitEpisode(b) ?? Infinity
    if (aEp !== bEp) return bEp - aEp
    return b.total_points - a.total_points
  })

  const sortedStandings = [...standings].sort((a, b) => b.total_points - a.total_points)

  return (
    <div className={styles.scoresPage}>
      <div className={styles.header}>
        <button onClick={() => navigate('/')}>&larr; Back to Seasons</button>
        <h1>Season {season.number} Scores</h1>
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

      {sortedStandings.length > 0 && (
        <div className={styles.tableWrapper}>
          <h2>League Standings</h2>
          <table className={styles.standingsTable}>
            <thead>
              <tr>
                <th className={styles.nameHeader}>User</th>
                <th>Male Pick</th>
                <th>Female Pick</th>
                <th>Golden Goose (2x)</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedStandings.map((standing) => (
                <tr key={standing.user_id}>
                  <td className={styles.nameCell}>{standing.user_name}</td>
                  <td>
                    {standing.male_contestant.name} ({standing.male_contestant.points})
                  </td>
                  <td>
                    {standing.female_contestant.name} ({standing.female_contestant.points})
                  </td>
                  <td>
                    {standing.golden_goose_contestant.name} ({standing.golden_goose_contestant.points})
                  </td>
                  <td className={styles.totalCell}>{standing.total_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {contestants.length === 0 || episodeNumbers.length === 0 ? (
        <p>No scores have been recorded for this season yet.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.scoresTable}>
            <thead>
              <tr>
                <th className={styles.nameHeader}>Contestant</th>
                {episodeNumbers.map((ep) => (
                  <th key={ep}>Ep {ep}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedContestants.map((contestant) => {
                const pointsByEpisode = {}
                for (const es of contestant.episode_scores) {
                  pointsByEpisode[es.episode_number] = (pointsByEpisode[es.episode_number] || 0) + es.points
                }
                const outEpisode = exitEpisode(contestant)
                const wonEpisode = winEpisode(contestant)

                return (
                  <tr key={contestant.id}>
                    <td className={styles.nameCell}>{contestant.name}</td>
                    {episodeNumbers.map((ep) => {
                      const events = contestant.episode_scores.filter((es) => es.episode_number === ep)
                      const baseClass =
                        ep === wonEpisode ? styles.wonCell : ep === outEpisode ? styles.votedOutCell : undefined
                      const cellClass = events.length > 0 ? `${baseClass ?? ''} ${styles.clickableCell}` : baseClass
                      return (
                        <td
                          key={ep}
                          className={cellClass}
                          onClick={
                            events.length > 0
                              ? () => setSelectedCell({ contestant, episode: ep, events })
                              : undefined
                          }
                        >
                          {pointsByEpisode[ep] ?? ''}
                        </td>
                      )
                    })}
                    <td className={styles.totalCell}>{contestant.total_points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedCell && (
        <EpisodeDetailModal
          contestantName={selectedCell.contestant.name}
          episodeNumber={selectedCell.episode}
          events={selectedCell.events}
          onClose={() => setSelectedCell(null)}
        />
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

export default ScoresPage
