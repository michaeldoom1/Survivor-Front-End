import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import styles from './SeasonCharts.module.css'

const SORTS = {
  total: { label: 'Most picked', compare: (a, b) => b.total - a.total || b.goldenGoose - a.goldenGoose },
  goldenGoose: { label: 'Most Golden Goose', compare: (a, b) => b.goldenGoose - a.goldenGoose || b.total - a.total },
  points: { label: 'Contestant points', compare: (a, b) => b.points - a.points },
  name: { label: 'Name', compare: (a, b) => a.name.localeCompare(b.name) },
}

const ROW_HEIGHT = 30

// Round only the outer end of whichever segment finishes the bar, and leave a
// 2px surface gap between the two stacked segments.
function segmentShape(segment) {
  return function Segment({ x, y, width, height, fill, payload }) {
    if (!width || width <= 0) return null
    const isOuter = segment === 'goldenGoose' || payload.goldenGoose === 0
    const gap = segment === 'goldenGoose' && payload.standard > 0 ? 2 : 0
    const w = Math.max(width - gap, 1)
    const r = isOuter ? Math.min(4, w, height / 2) : 0
    const left = x + gap
    const path = [
      `M${left},${y}`,
      `H${left + w - r}`,
      `Q${left + w},${y} ${left + w},${y + r}`,
      `V${y + height - r}`,
      `Q${left + w},${y + height} ${left + w - r},${y + height}`,
      `H${left}`,
      'Z',
    ].join(' ')
    return <path d={path} fill={fill} />
  }
}

// Count printed inside a segment, only when the segment is wide enough to hold it.
function segmentCount(color) {
  return function SegmentCount({ x, y, width, height, value }) {
    if (!value || width < 18) return null
    return (
      <text x={x + width / 2 + 1} y={y + height / 2} fill={color} fontSize={11} fontWeight={600}
        textAnchor="middle" dominantBaseline="central">
        {value}
      </text>
    )
  }
}

function PopularityTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{row.name}</div>
      <ul className={styles.tooltipRows}>
        <li>
          <span className={styles.tooltipValue}>{row.total}</span>
          <span className={styles.tooltipLabel}>total selections</span>
        </li>
        <li>
          <span className={styles.tooltipValue}>{row.standard}</span>
          <span className={styles.tooltipLabel}>standard pick</span>
        </li>
        <li>
          <span className={styles.tooltipValue}>{row.goldenGoose}</span>
          <span className={styles.tooltipLabel}>Golden Goose</span>
        </li>
        <li>
          <span className={styles.tooltipValue}>{row.points}</span>
          <span className={styles.tooltipLabel}>contestant points</span>
        </li>
      </ul>
    </div>
  )
}

function PickPopularityChart({ rows, leagueSize, palette }) {
  const [sort, setSort] = useState('total')
  const [hideUnpicked, setHideUnpicked] = useState(false)

  const data = rows.filter((row) => !hideUnpicked || row.total > 0).sort(SORTS[sort].compare)
  const maxTotal = Math.max(1, ...data.map((row) => row.total))

  return (
    <div className={styles.chartCard}>
      <h3>Most Picked Contestants</h3>
      <p className={styles.chartNote}>
        How many of the {leagueSize} league {leagueSize === 1 ? 'member' : 'members'} took each contestant.
      </p>

      <div className={styles.chartControls}>
        <label className={styles.controlLabel}>
          Sort by{' '}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(SORTS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.controlLabel}>
          <input type="checkbox" checked={hideUnpicked} onChange={(e) => setHideUnpicked(e.target.checked)} /> Hide
          unpicked
        </label>
        <span className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.swatch} style={{ background: palette.standardPick }} />
            Standard pick
          </span>
          <span className={styles.legendItem}>
            <span className={styles.swatch} style={{ background: palette.goldenGoose }} />
            Golden Goose
          </span>
        </span>
      </div>

      {data.length === 0 ? (
        <p className={styles.chartNote}>No contestants match these filters.</p>
      ) : (
        <ResponsiveContainer width="100%" height={data.length * ROW_HEIGHT + 40}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 0 }} barSize={18}>
            <CartesianGrid stroke={palette.grid} horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              domain={[0, maxTotal]}
              stroke={palette.axis}
              tick={{ fill: palette.axis, fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              interval={0}
              stroke={palette.axis}
              tick={{ fill: palette.textSecondary, fontSize: 13 }}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: palette.grid, fillOpacity: 0.5 }} content={<PopularityTooltip />} />
            <Bar
              dataKey="standard"
              stackId="picks"
              fill={palette.standardPick}
              shape={segmentShape('standard')}
              isAnimationActive={false}
            >
              <LabelList dataKey="standard" content={segmentCount('#ffffff')} />
            </Bar>
            <Bar
              dataKey="goldenGoose"
              stackId="picks"
              fill={palette.goldenGoose}
              shape={segmentShape('goldenGoose')}
              isAnimationActive={false}
            >
              <LabelList dataKey="goldenGoose" content={segmentCount('#0b0b0b')} />
              <LabelList
                dataKey="total"
                position="right"
                fill={palette.textPrimary}
                fontSize={12}
                formatter={(value) => (value > 0 ? value : '')}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default PickPopularityChart
