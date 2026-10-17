import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import styles from './SeasonCharts.module.css'

function median(values) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// Name only the points that tell the story: the top scorers, the most
// picked, and the best scorer nobody (or almost nobody) took.
function labeledIds(rows) {
  const ids = new Set()
  ;[...rows].sort((a, b) => b.points - a.points).slice(0, 3).forEach((r) => ids.add(r.id))
  ;[...rows].sort((a, b) => b.total - a.total || b.points - a.points).slice(0, 2).forEach((r) => ids.add(r.id))
  const minPicks = Math.min(...rows.map((r) => r.total))
  const sleeper = rows.filter((r) => r.total === minPicks).sort((a, b) => b.points - a.points)[0]
  if (sleeper) ids.add(sleeper.id)
  return ids
}

function Dot({ cx, cy, fill, payload, labeled, maxPicks, surface, textColor }) {
  // Names in the right-most column go on the left so they aren't clipped.
  const labelLeft = payload.total === maxPicks
  if (cx === undefined || cy === undefined) return null
  return (
    <g>
      {/* Transparent hit area so the point is easy to hover. */}
      <circle cx={cx} cy={cy} r={12} fill="transparent" />
      <circle cx={cx} cy={cy} r={5} fill={fill} stroke={surface} strokeWidth={2} />
      {labeled.has(payload.id) && (
        <text
          x={labelLeft ? cx - 9 : cx + 9}
          y={cy}
          fill={textColor}
          fontSize={12}
          textAnchor={labelLeft ? 'end' : 'start'}
          dominantBaseline="central"
        >
          {payload.name}
        </text>
      )}
    </g>
  )
}

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{row.name}</div>
      <ul className={styles.tooltipRows}>
        <li>
          <span className={styles.tooltipValue}>{row.points}</span>
          <span className={styles.tooltipLabel}>contestant points</span>
        </li>
        <li>
          <span className={styles.tooltipValue}>{row.total}</span>
          <span className={styles.tooltipLabel}>
            times picked ({row.goldenGoose} as Golden Goose)
          </span>
        </li>
      </ul>
    </div>
  )
}

function PopularityVsPointsChart({ rows, palette }) {
  if (rows.length === 0) {
    return (
      <div className={styles.chartCard}>
        <h3>Popularity vs. Performance</h3>
        <p className={styles.chartNote}>No contestants match these filters.</p>
      </div>
    )
  }

  const labeled = labeledIds(rows)
  const medianPicks = median(rows.map((r) => r.total))
  const medianPoints = median(rows.map((r) => r.points))
  const maxPicks = Math.max(1, ...rows.map((r) => r.total))
  const series = [
    { gender: 'Male', name: 'Men', color: palette.male },
    { gender: 'Female', name: 'Women', color: palette.female },
  ]
    .map((s) => ({ ...s, rows: rows.filter((r) => r.gender === s.gender) }))
    .filter((s) => s.rows.length > 0)

  const dot = (props) => (
    <Dot {...props} labeled={labeled} maxPicks={maxPicks} surface={palette.surface} textColor={palette.textSecondary} />
  )

  return (
    <div className={styles.chartCard}>
      <h3>Popularity vs. Performance</h3>
      <p className={styles.chartNote}>
        Top-left are the sleeper hits nobody took; bottom-right are the popular picks that haven't paid off. Dashed
        lines mark the median.
      </p>

      <div className={styles.chartControls}>
        <span className={styles.legend}>
          {series.map((s) => (
            <span key={s.gender} className={styles.legendItem}>
              <span className={styles.dotKey} style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <ScatterChart margin={{ top: 16, right: 24, bottom: 24, left: 0 }}>
          <CartesianGrid stroke={palette.grid} />
          <XAxis
            type="number"
            dataKey="total"
            name="Times picked"
            allowDecimals={false}
            domain={[0, maxPicks]}
            stroke={palette.axis}
            tick={{ fill: palette.axis, fontSize: 12 }}
            tickLine={false}
            label={{ value: 'Times picked', position: 'insideBottom', offset: -12, fill: palette.axis, fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="points"
            name="Points"
            stroke={palette.axis}
            tick={{ fill: palette.axis, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={48}
            label={{ value: 'Points', angle: -90, position: 'insideLeft', offset: 12, fill: palette.axis, fontSize: 12 }}
          />
          <ZAxis range={[80, 80]} />
          <ReferenceLine x={medianPicks} stroke={palette.axis} strokeDasharray="4 4" />
          <ReferenceLine y={medianPoints} stroke={palette.axis} strokeDasharray="4 4" />
          <Tooltip cursor={false} content={<ScatterTooltip />} />
          {series.map((s) => (
            <Scatter key={s.gender} name={s.name} data={s.rows} fill={s.color} shape={dot} isAnimationActive={false} />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PopularityVsPointsChart
