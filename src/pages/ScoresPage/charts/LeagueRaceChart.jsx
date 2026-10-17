import { GOLDEN_GOOSE_MULTIPLIER } from '../seasonStats'
import RaceChart from './RaceChart'

function LeagueRaceChart({ standings, totals, episodeNumbers, myUserId, palette }) {
  const series = standings.map((standing) => {
    const male = totals[standing.male_contestant.id]
    const female = totals[standing.female_contestant.id]
    const goldenGoose = totals[standing.golden_goose_contestant.id]
    return {
      id: standing.user_id,
      name: standing.user_name,
      values: male.map((_, i) => male[i] + female[i] + goldenGoose[i] * GOLDEN_GOOSE_MULTIPLIER),
      exitIndex: null,
    }
  })

  const isMember = standings.some((standing) => standing.user_id === myUserId)
  const me = isMember ? [myUserId] : []

  return (
    <RaceChart
      title="League Race"
      note={`Each league member's season total after every episode: male pick + female pick + Golden Goose (${GOLDEN_GOOSE_MULTIPLIER}x).`}
      series={series}
      episodeNumbers={episodeNumbers}
      presets={[{ label: 'Me', ids: me }]}
      noun="league members"
      palette={palette}
    />
  )
}

export default LeagueRaceChart
