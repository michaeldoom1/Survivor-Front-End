import { useMemo, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { exitEpisode, pickCounts } from '../seasonStats'
import { chartPalette } from './chartTheme'
import PickPopularityChart from './PickPopularityChart'
import PointsRaceChart from './PointsRaceChart'
import PopularityVsPointsChart from './PopularityVsPointsChart'
import styles from './SeasonCharts.module.css'

const GENDERS = [
  { value: 'all', label: 'Everyone' },
  { value: 'Male', label: 'Men' },
  { value: 'Female', label: 'Women' },
]

function SeasonCharts({ contestants, standings, episodeNumbers }) {
  const { user } = useAuth()
  const { theme } = useTheme()
  const palette = chartPalette(theme)
  const [gender, setGender] = useState('all')
  const [stillInOnly, setStillInOnly] = useState(false)

  const exits = useMemo(() => Object.fromEntries(contestants.map((c) => [c.id, exitEpisode(c)])), [contestants])
  const counts = useMemo(() => pickCounts(standings), [standings])

  // These filters scope every chart below them.
  const visible = contestants.filter(
    (c) => (gender === 'all' || c.gender === gender) && (!stillInOnly || exits[c.id] === null),
  )

  const popularityRows = visible.map((c) => {
    const { standard = 0, goldenGoose = 0 } = counts[c.id] ?? {}
    return {
      id: c.id,
      name: c.name,
      gender: c.gender,
      points: c.total_points,
      standard,
      goldenGoose,
      total: standard + goldenGoose,
    }
  })

  const myPick = user && standings.find((s) => s.user_id === user.id)
  const myPickIds = myPick
    ? [myPick.male_contestant.id, myPick.female_contestant.id, myPick.golden_goose_contestant.id]
    : []

  const hasScores = episodeNumbers.length > 0
  const hasPicks = standings.length > 0
  if (!hasScores && !hasPicks) return null

  return (
    <section className={styles.seasonCharts}>
      <h2>Season Stats</h2>

      <div className={styles.filterRow}>
        <div className={styles.segmented} role="group" aria-label="Filter by gender">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              className={gender === g.value ? styles.segmentActive : undefined}
              aria-pressed={gender === g.value}
              onClick={() => setGender(g.value)}
            >
              {g.label}
            </button>
          ))}
        </div>
        <label className={styles.controlLabel}>
          <input type="checkbox" checked={stillInOnly} onChange={(e) => setStillInOnly(e.target.checked)} /> Still
          in the game only
        </label>
      </div>

      {hasScores && (
        <PointsRaceChart
          contestants={visible}
          allContestants={contestants}
          episodeNumbers={episodeNumbers}
          exits={exits}
          myPickIds={myPickIds}
          palette={palette}
        />
      )}

      {hasPicks && (
        <>
          <PickPopularityChart rows={popularityRows} leagueSize={standings.length} palette={palette} />
          <PopularityVsPointsChart rows={popularityRows} palette={palette} />
        </>
      )}
    </section>
  )
}

export default SeasonCharts
