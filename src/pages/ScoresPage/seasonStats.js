export const EXIT_EVENTS = ['Getting voted out', 'Medical evacuation', 'Losing a fire-making challenge']

export function exitEpisode(contestant) {
  return contestant.episode_scores.find((es) => EXIT_EVENTS.includes(es.scoring_event))?.episode_number ?? null
}

// Running season total for each contestant after every episode, e.g.
// { 12: [0, 6, 12, 18], ... } where index 0 is the start of the season.
export function cumulativeTotals(contestants, episodeNumbers) {
  const totals = {}
  for (const contestant of contestants) {
    const pointsByEpisode = {}
    for (const es of contestant.episode_scores) {
      pointsByEpisode[es.episode_number] = (pointsByEpisode[es.episode_number] || 0) + es.points
    }
    let running = 0
    totals[contestant.id] = [0, ...episodeNumbers.map((ep) => (running += pointsByEpisode[ep] || 0))]
  }
  return totals
}

// How many league members took each contestant, split into a standard
// (male/female slot) pick versus a Golden Goose pick.
export function pickCounts(standings) {
  const counts = {}
  const bump = (id, key) => {
    counts[id] ??= { standard: 0, goldenGoose: 0 }
    counts[id][key] += 1
  }
  for (const standing of standings) {
    bump(standing.male_contestant.id, 'standard')
    bump(standing.female_contestant.id, 'standard')
    bump(standing.golden_goose_contestant.id, 'goldenGoose')
  }
  return counts
}
