import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { cumulativeTotals } from '../seasonStats'
import { MAX_HIGHLIGHTED } from './chartTheme'
import styles from './SeasonCharts.module.css'

// Give each newly highlighted contestant the lowest free color slot, so
// contestants that stay highlighted never change color.
function assignSlots(ids, existing = {}) {
  const slots = {}
  for (const id of ids) if (existing[id] !== undefined) slots[id] = existing[id]
  for (const id of ids) {
    if (slots[id] !== undefined) continue
    const used = new Set(Object.values(slots))
    const free = [...Array(MAX_HIGHLIGHTED).keys()].find((slot) => !used.has(slot))
    if (free === undefined) break
    slots[id] = free
  }
  return slots
}

function RaceTooltip({ active, label, contestants, totals, episodeIndex, exits, slots, palette }) {
  if (!active || label === undefined) return null
  const index = episodeIndex[label]
  const rows = contestants
    .map((c) => ({ c, points: totals[c.id][index], out: exits[c.id] !== null && exits[c.id] < label }))
    .sort((a, b) => b.points - a.points)

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{label === 0 ? 'Start' : `After Ep ${label}`}</div>
      <ul className={styles.tooltipRows}>
        {rows.map(({ c, points, out }) => {
          const highlighted = slots[c.id] !== undefined
          return (
            <li key={c.id} className={highlighted ? styles.tooltipHighlighted : undefined}>
              <span
                className={styles.lineKey}
                style={{ background: highlighted ? palette.series[slots[c.id]] : palette.muted }}
              />
              <span className={styles.tooltipValue}>{points}</span>
              <span className={styles.tooltipLabel}>
                {c.name}
                {out && <span className={styles.outTag}> out</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function PointsRaceChart({ contestants, allContestants, episodeNumbers, exits, myPickIds, palette }) {
  const totals = useMemo(() => cumulativeTotals(allContestants, episodeNumbers), [allContestants, episodeNumbers])
  const lastIndex = episodeNumbers.length
  const byCurrentTotal = [...contestants].sort((a, b) => totals[b.id][lastIndex] - totals[a.id][lastIndex])

  const topFiveIds = () => byCurrentTotal.slice(0, 5).map((c) => c.id)
  const [slots, setSlots] = useState(() => assignSlots(myPickIds.length > 0 ? myPickIds : topFiveIds()))
  const [hoveredId, setHoveredId] = useState(null)

  const episodeIndex = { 0: 0 }
  episodeNumbers.forEach((ep, i) => (episodeIndex[ep] = i + 1))

  // Each contestant gets two series: a solid line while they're in the game
  // and a dashed one afterwards, since jurors can still score at the finale.
  const data = [0, ...episodeNumbers].map((ep, i) => {
    const row = { episode: ep }
    for (const c of allContestants) {
      const exit = exits[c.id]
      const value = totals[c.id][i]
      row[`in-${c.id}`] = exit === null || ep <= exit ? value : null
      row[`out-${c.id}`] = exit !== null && ep >= exit ? value : null
    }
    return row
  })

  function toggle(id) {
    setSlots((current) => {
      if (current[id] !== undefined) {
        const { [id]: _removed, ...rest } = current
        return rest
      }
      return assignSlots([...Object.keys(current).map(Number), id], current)
    })
  }

  const highlightedCount = Object.keys(slots).length
  // Muted lines first so highlighted ones always paint on top.
  const drawOrder = [...contestants].sort((a, b) => {
    const rank = (c) => (c.id === hoveredId ? 2 : slots[c.id] !== undefined ? 1 : 0)
    return rank(a) - rank(b)
  })

  function lineProps(c, phase) {
    const highlighted = slots[c.id] !== undefined
    const hovered = c.id === hoveredId
    const color = highlighted ? palette.series[slots[c.id]] : hovered ? palette.textSecondary : palette.muted
    return {
      dataKey: `${phase}-${c.id}`,
      type: 'linear',
      stroke: color,
      strokeWidth: hovered ? 3 : highlighted ? 2.5 : 1.5,
      strokeOpacity: highlighted || hovered ? 1 : 0.7,
      strokeDasharray: phase === 'out' ? '4 4' : undefined,
      dot: false,
      activeDot: false,
      connectNulls: false,
      isAnimationActive: false,
    }
  }

  return (
    <div className={styles.chartCard}>
      <h3>Points Race</h3>
      <p className={styles.chartNote}>
        Season total after each episode. Dashed lines are points scored after leaving the game (jury votes).
      </p>

      <div className={styles.chartControls}>
        <span className={styles.controlLabel}>Highlight:</span>
        <button className={styles.presetButton} onClick={() => setSlots(assignSlots(topFiveIds()))}>
          Top 5
        </button>
        {myPickIds.length > 0 && (
          <button className={styles.presetButton} onClick={() => setSlots(assignSlots(myPickIds))}>
            My picks
          </button>
        )}
        <button className={styles.presetButton} onClick={() => setSlots({})}>
          Clear
        </button>
      </div>

      <div className={styles.chipRow}>
        {byCurrentTotal.map((c) => {
          const highlighted = slots[c.id] !== undefined
          const full = !highlighted && highlightedCount >= MAX_HIGHLIGHTED
          return (
            <button
              key={c.id}
              className={`${styles.chip} ${highlighted ? styles.chipActive : ''}`}
              aria-pressed={highlighted}
              disabled={full}
              title={full ? `Up to ${MAX_HIGHLIGHTED} contestants can be highlighted at once` : undefined}
              onClick={() => toggle(c.id)}
              onMouseEnter={() => setHoveredId(c.id)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(c.id)}
              onBlur={() => setHoveredId(null)}
            >
              <span
                className={styles.lineKey}
                style={{ background: highlighted ? palette.series[slots[c.id]] : palette.muted }}
              />
              {c.name}
              <span className={styles.chipValue}>{totals[c.id][lastIndex]}</span>
            </button>
          )
        })}
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={palette.grid} vertical={false} />
          <XAxis
            dataKey="episode"
            tickFormatter={(ep) => (ep === 0 ? 'Start' : `Ep ${ep}`)}
            stroke={palette.axis}
            tick={{ fill: palette.axis, fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            stroke={palette.axis}
            tick={{ fill: palette.axis, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: palette.axis, strokeWidth: 1 }}
            content={
              <RaceTooltip
                contestants={contestants}
                totals={totals}
                episodeIndex={episodeIndex}
                exits={exits}
                slots={slots}
                palette={palette}
              />
            }
          />
          {drawOrder.map((c) => [
            <Line key={`out-${c.id}`} {...lineProps(c, 'out')} />,
            <Line key={`in-${c.id}`} {...lineProps(c, 'in')} />,
          ])}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PointsRaceChart
