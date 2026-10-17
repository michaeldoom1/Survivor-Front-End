import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { MAX_HIGHLIGHTED } from './chartTheme'
import styles from './SeasonCharts.module.css'

// Give each newly highlighted series the lowest free color slot, so series
// that stay highlighted never change color.
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

function RaceTooltip({ active, label, series, episodeIndex, slots, palette }) {
  if (!active || label === undefined) return null
  const index = episodeIndex[label]
  const rows = series
    .map((s) => ({ s, points: s.values[index], out: s.exitIndex != null && s.exitIndex < index }))
    .sort((a, b) => b.points - a.points)

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{label === 0 ? 'Start' : `After Ep ${label}`}</div>
      <ul className={styles.tooltipRows}>
        {rows.map(({ s, points, out }) => {
          const highlighted = slots[s.id] !== undefined
          return (
            <li key={s.id} className={highlighted ? styles.tooltipHighlighted : undefined}>
              <span
                className={styles.lineKey}
                style={{ background: highlighted ? palette.series[slots[s.id]] : palette.muted }}
              />
              <span className={styles.tooltipValue}>{points}</span>
              <span className={styles.tooltipLabel}>
                {s.name}
                {out && <span className={styles.outTag}> out</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// A running-total line per series across the season's episodes.
// series: [{ id, name, values, exitIndex }] where values[0] is the start of
// the season and values[i] the total after the i-th episode. A series with
// an exitIndex is drawn dashed from that point on.
// presets: extra highlight shortcuts, [{ label, ids }].
function RaceChart({ title, note, series, episodeNumbers, presets = [], defaultHighlightIds, noun, palette }) {
  const lastIndex = episodeNumbers.length
  const byCurrentTotal = [...series].sort((a, b) => b.values[lastIndex] - a.values[lastIndex])

  const topFiveIds = () => byCurrentTotal.slice(0, 5).map((s) => s.id)
  const [slots, setSlots] = useState(() =>
    assignSlots(defaultHighlightIds?.length > 0 ? defaultHighlightIds : topFiveIds()),
  )
  const [hoveredId, setHoveredId] = useState(null)

  const episodeIndex = { 0: 0 }
  episodeNumbers.forEach((ep, i) => (episodeIndex[ep] = i + 1))

  // Each series is split into a solid "in" line and a dashed "out" line
  // that starts where it left the game.
  const data = [0, ...episodeNumbers].map((ep, i) => {
    const row = { episode: ep }
    for (const s of series) {
      const exit = s.exitIndex ?? null
      row[`in-${s.id}`] = exit === null || i <= exit ? s.values[i] : null
      row[`out-${s.id}`] = exit !== null && i >= exit ? s.values[i] : null
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
  const drawOrder = [...series].sort((a, b) => {
    const rank = (s) => (s.id === hoveredId ? 2 : slots[s.id] !== undefined ? 1 : 0)
    return rank(a) - rank(b)
  })

  function lineProps(s, phase) {
    const highlighted = slots[s.id] !== undefined
    const hovered = s.id === hoveredId
    const color = highlighted ? palette.series[slots[s.id]] : hovered ? palette.textSecondary : palette.muted
    return {
      dataKey: `${phase}-${s.id}`,
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
      <h3>{title}</h3>
      <p className={styles.chartNote}>{note}</p>

      <div className={styles.chartControls}>
        <span className={styles.controlLabel}>Highlight:</span>
        <button className={styles.presetButton} onClick={() => setSlots(assignSlots(topFiveIds()))}>
          Top 5
        </button>
        {presets
          .filter((preset) => preset.ids.length > 0)
          .map((preset) => (
            <button
              key={preset.label}
              className={styles.presetButton}
              onClick={() => setSlots(assignSlots(preset.ids))}
            >
              {preset.label}
            </button>
          ))}
        <button className={styles.presetButton} onClick={() => setSlots({})}>
          Clear
        </button>
      </div>

      <div className={styles.chipRow}>
        {byCurrentTotal.map((s) => {
          const highlighted = slots[s.id] !== undefined
          const full = !highlighted && highlightedCount >= MAX_HIGHLIGHTED
          return (
            <button
              key={s.id}
              className={`${styles.chip} ${highlighted ? styles.chipActive : ''}`}
              aria-pressed={highlighted}
              disabled={full}
              title={full ? `Up to ${MAX_HIGHLIGHTED} ${noun} can be highlighted at once` : undefined}
              onClick={() => toggle(s.id)}
              onMouseEnter={() => setHoveredId(s.id)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(s.id)}
              onBlur={() => setHoveredId(null)}
            >
              <span
                className={styles.lineKey}
                style={{ background: highlighted ? palette.series[slots[s.id]] : palette.muted }}
              />
              {s.name}
              <span className={styles.chipValue}>{s.values[lastIndex]}</span>
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
            content={<RaceTooltip series={series} episodeIndex={episodeIndex} slots={slots} palette={palette} />}
          />
          {drawOrder.map((s) => [
            <Line key={`out-${s.id}`} {...lineProps(s, 'out')} />,
            <Line key={`in-${s.id}`} {...lineProps(s, 'in')} />,
          ])}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RaceChart
