import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { createPollVote } from '../../api/pollVotes'
import styles from './Poll.module.css'

function Poll({ poll, isAdmin, canVote, onVoted, onDelete }) {
  const location = useLocation()
  const [selectedOptionId, setSelectedOptionId] = useState(null)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!selectedOptionId) {
      setError('Pick an option first.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const updated = await createPollVote({
        poll_id: poll.id,
        poll_option_id: selectedOptionId,
        comment: comment || null,
      })
      onVoted(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.pollCard}>
      {isAdmin && (
        <button
          className={styles.removePoll}
          onClick={() => onDelete(poll)}
          aria-label="Remove this poll"
          title="Remove this poll"
        >
          ×
        </button>
      )}

      <h3 className={styles.question}>{poll.question}</h3>

      {poll.voted ? (
        <>
          <ul className={styles.results}>
            {poll.options.map((option) => {
              const pct = poll.total_votes ? Math.round((option.vote_count / poll.total_votes) * 100) : 0
              return (
                <li key={option.id} className={option.id === poll.my_option_id ? styles.myOption : undefined}>
                  <div className={styles.resultLabel}>
                    <span>
                      {option.text}
                      {option.id === poll.my_option_id ? ' (your vote)' : ''}
                    </span>
                    <span>
                      {option.vote_count} vote{option.vote_count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>

          {poll.comments.length > 0 && (
            <div className={styles.comments}>
              <h4>Comments</h4>
              <ul>
                {poll.comments.map((c) => (
                  <li key={c.id}>
                    <strong>{c.user_name}:</strong> {c.comment}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : canVote ? (
        <form onSubmit={handleSubmit} className={styles.voteForm}>
          {poll.options.map((option) => (
            <label key={option.id} className={styles.optionLabel}>
              <input
                type="radio"
                name={`poll-${poll.id}`}
                value={option.id}
                checked={selectedOptionId === option.id}
                onChange={() => setSelectedOptionId(option.id)}
              />
              {option.text}
            </label>
          ))}

          <textarea
            placeholder="Leave a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Vote'}
          </button>
        </form>
      ) : (
        <div className={styles.voteForm}>
          {poll.options.map((option) => (
            <label key={option.id} className={styles.optionLabel}>
              <input type="radio" disabled />
              {option.text}
            </label>
          ))}
          <Link className="link-button" to="/login" state={{ from: location }}>
            Log in to vote and leave a comment
          </Link>
        </div>
      )}
    </div>
  )
}

export default Poll
