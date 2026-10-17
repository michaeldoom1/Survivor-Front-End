import { useState } from 'react'
import { createUserGroup, deleteUserGroup, updateUserGroup } from '../../../api/userGroups'
import styles from './SeasonCharts.module.css'

// Create or edit a group of league members. `leagueMembers` are this
// season's players; anyone already in the group from another season is
// listed too so they aren't silently dropped on save.
function UserGroupDialog({ group, leagueMembers, currentUserId, onSaved, onDeleted, onCancel }) {
  const [name, setName] = useState(group?.name ?? '')
  const [memberIds, setMemberIds] = useState(
    () => new Set(group ? group.members.map((m) => m.id) : [currentUserId]),
  )
  const [submitting, setSubmitting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState('')

  const people = new Map(leagueMembers.map((m) => [m.id, m.name]))
  for (const m of group?.members ?? []) if (!people.has(m.id)) people.set(m.id, m.name)
  const sortedPeople = [...people].sort(([, a], [, b]) => a.localeCompare(b, undefined, { numeric: true }))

  function toggle(id) {
    setMemberIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = { name: name.trim(), member_ids: [...memberIds] }
      const saved = group ? await updateUserGroup(group.id, payload) : await createUserGroup(payload)
      onSaved(saved)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    setSubmitting(true)
    setError('')
    try {
      await deleteUserGroup(group.id)
      onDeleted(group.id)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <form className={styles.dialog} onSubmit={handleSubmit}>
        <h2>{group ? 'Edit Group' : 'New Group'}</h2>
        <p className={styles.chartNote}>Everyone in the group can see it on their League Race. Only you can edit it.</p>

        <label className={styles.fieldLabel}>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} placeholder="Family" required />
        </label>

        <fieldset className={styles.memberList}>
          <legend>Members</legend>
          {sortedPeople.map(([id, personName]) => (
            <label key={id}>
              <input
                type="checkbox"
                checked={id === currentUserId || memberIds.has(id)}
                disabled={id === currentUserId}
                onChange={() => toggle(id)}
              />{' '}
              {personName}
              {id === currentUserId && ' (you)'}
            </label>
          ))}
        </fieldset>

        {error && <p className="auth-error">{error}</p>}

        {confirmingDelete ? (
          <div className={styles.dialogActions}>
            <span className={styles.chartNote}>Delete “{group.name}” for everyone?</span>
            <button type="button" onClick={() => setConfirmingDelete(false)} disabled={submitting}>
              Keep it
            </button>
            <button type="button" className={styles.dangerButton} onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ) : (
          <div className={styles.dialogActions}>
            {group && (
              <button
                type="button"
                className={styles.dangerLink}
                onClick={() => setConfirmingDelete(true)}
                disabled={submitting}
              >
                Delete group
              </button>
            )}
            <button type="button" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default UserGroupDialog
