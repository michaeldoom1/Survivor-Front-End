import { useState } from 'react'
import { createPoll } from '../../api/polls'
import styles from './PollForm.module.css'

function PollForm({ episodePostId, onCreated, onCancel }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateOption(index, value) {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)))
  }

  function addOption() {
    setOptions((prev) => [...prev, ''])
  }

  function removeOption(index) {
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedOptions = options.map((o) => o.trim()).filter(Boolean)
    if (trimmedOptions.length < 2) {
      setError('Add at least two options.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const poll = await createPoll({
        episode_post_id: episodePostId,
        question,
        poll_options_attributes: trimmedOptions.map((text) => ({ text })),
      })
      onCreated(poll)
      setQuestion('')
      setOptions(['', ''])
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.pollForm} onSubmit={handleSubmit}>
      <h3>New Poll</h3>

      <label htmlFor="poll-question">Question</label>
      <input
        id="poll-question"
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        required
      />

      <label>Options</label>
      {options.map((option, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className={styles.optionRow} key={index}>
          <input
            type="text"
            value={option}
            placeholder={`Option ${index + 1}`}
            onChange={(e) => updateOption(index, e.target.value)}
          />
          {options.length > 2 && (
            <button type="button" onClick={() => removeOption(index)} aria-label="Remove option">
              ×
            </button>
          )}
        </div>
      ))}
      <button type="button" className={styles.addOption} onClick={addOption}>
        + Add option
      </button>

      {error && <p className="auth-error">{error}</p>}

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Poll'}
        </button>
      </div>
    </form>
  )
}

export default PollForm
