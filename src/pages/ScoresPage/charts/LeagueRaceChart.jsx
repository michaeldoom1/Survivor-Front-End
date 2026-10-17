import { useEffect, useState } from 'react'
import { fetchUserGroups } from '../../../api/userGroups'
import { GOLDEN_GOOSE_MULTIPLIER } from '../seasonStats'
import RaceChart from './RaceChart'
import UserGroupDialog from './UserGroupDialog'
import styles from './SeasonCharts.module.css'

const GROUP_STORAGE_KEY = 'leagueRaceGroup'

function readStoredGroupId() {
  try {
    const stored = localStorage.getItem(GROUP_STORAGE_KEY)
    return stored ? Number(stored) : null
  } catch {
    return null
  }
}

function storeGroupId(id) {
  try {
    if (id === null) localStorage.removeItem(GROUP_STORAGE_KEY)
    else localStorage.setItem(GROUP_STORAGE_KEY, String(id))
  } catch {
    // Remembering the last group is only a convenience.
  }
}

function LeagueRaceChart({ standings, totals, episodeNumbers, myUserId, palette }) {
  const [groups, setGroups] = useState([])
  const [selectedGroupId, setSelectedGroupId] = useState(readStoredGroupId)
  // null = closed, 'new' = creating, otherwise the group being edited.
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    if (!myUserId) {
      setGroups([])
      return
    }
    let cancelled = false
    fetchUserGroups()
      .then((data) => {
        if (!cancelled) setGroups(data)
      })
      .catch(() => {
        if (!cancelled) setGroups([])
      })
    return () => {
      cancelled = true
    }
  }, [myUserId])

  const lastIndex = episodeNumbers.length
  const allSeries = standings.map((standing) => {
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

  // A remembered group may have been deleted, or we may be logged out.
  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null
  const groupMemberIds = selectedGroup ? new Set(selectedGroup.members.map((m) => m.id)) : null
  const series = groupMemberIds ? allSeries.filter((s) => groupMemberIds.has(s.id)) : allSeries
  // In a group view, color the group's leaders first.
  const groupHighlightIds = groupMemberIds
    ? [...series].sort((a, b) => b.values[lastIndex] - a.values[lastIndex]).map((s) => s.id)
    : undefined

  const isMember = standings.some((standing) => standing.user_id === myUserId)
  const me = isMember ? [myUserId] : []

  function selectGroup(id) {
    setSelectedGroupId(id)
    storeGroupId(id)
  }

  function handleSaved(saved) {
    setGroups((current) =>
      [...current.filter((g) => g.id !== saved.id), saved].sort((a, b) => a.name.localeCompare(b.name)),
    )
    selectGroup(saved.id)
    setEditing(null)
  }

  function handleDeleted(id) {
    setGroups((current) => current.filter((g) => g.id !== id))
    selectGroup(null)
    setEditing(null)
  }

  const groupControls = myUserId && (
    <div className={styles.chartControls}>
      <span className={styles.controlLabel}>Show:</span>
      <div className={styles.segmented} role="group" aria-label="Show league members">
        <button
          className={selectedGroup === null ? styles.segmentActive : undefined}
          aria-pressed={selectedGroup === null}
          onClick={() => selectGroup(null)}
        >
          Everyone
        </button>
        {groups.map((g) => (
          <button
            key={g.id}
            className={selectedGroup?.id === g.id ? styles.segmentActive : undefined}
            aria-pressed={selectedGroup?.id === g.id}
            onClick={() => selectGroup(g.id)}
          >
            {g.name}
          </button>
        ))}
      </div>
      {selectedGroup?.is_owner && (
        <button className={styles.presetButton} onClick={() => setEditing(selectedGroup)}>
          Edit group
        </button>
      )}
      {selectedGroup && !selectedGroup.is_owner && (
        <span className={styles.chartNote}>Shared by {selectedGroup.owner_name}</span>
      )}
      <button className={styles.presetButton} onClick={() => setEditing('new')}>
        + New group
      </button>
    </div>
  )

  return (
    <>
      <RaceChart
        // Remount on group change so the highlights reset to that group.
        key={selectedGroup?.id ?? 'everyone'}
        title="League Race"
        note={`Each league member's season total after every episode: male pick + female pick + Golden Goose (${GOLDEN_GOOSE_MULTIPLIER}x).`}
        controls={groupControls}
        emptyMessage="No one in this group has picks this season."
        series={series}
        episodeNumbers={episodeNumbers}
        presets={[{ label: 'Me', ids: me }]}
        defaultHighlightIds={groupHighlightIds}
        noun="league members"
        palette={palette}
      />

      {editing && (
        <UserGroupDialog
          group={editing === 'new' ? null : editing}
          leagueMembers={standings.map((s) => ({ id: s.user_id, name: s.user_name }))}
          currentUserId={myUserId}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
          onCancel={() => setEditing(null)}
        />
      )}
    </>
  )
}

export default LeagueRaceChart
