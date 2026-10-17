import RaceChart from './RaceChart'

function PointsRaceChart({ contestants, totals, episodeNumbers, exits, myPickIds, palette }) {
  const series = contestants.map((c) => ({
    id: c.id,
    name: c.name,
    values: totals[c.id],
    // values[0] is the start, so episode N sits at the episode's position + 1.
    exitIndex: exits[c.id] === null ? null : episodeNumbers.indexOf(exits[c.id]) + 1,
  }))

  return (
    <RaceChart
      title="Points Race"
      note="Season total after each episode. Dashed lines are points scored after leaving the game (jury votes)."
      series={series}
      episodeNumbers={episodeNumbers}
      presets={[{ label: 'My picks', ids: myPickIds }]}
      defaultHighlightIds={myPickIds}
      noun="contestants"
      palette={palette}
    />
  )
}

export default PointsRaceChart
