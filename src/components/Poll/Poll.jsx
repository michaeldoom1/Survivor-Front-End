import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { createPollVote } from '../../api/pollVotes'
import { createPollComment } from '../../api/pollComments'
import styles from './Poll.module.css'

function Poll({ poll, isAdmin, isLoggedIn, seasonNumber, onVoted, onCommented, onDelete }) {
  const location = useLocation()
  const [selectedOptionId, setSelectedOptionId] = useState(null)
  const [voteError, setVoteError] = useState('')
  const [voting, setVoting] = useState(false)
  const [commentBody, setCommentBody] = useState('')
  const [commentError, setCommentError] = useState('')
  const [commenting, setCommenting] = useState(false)

  const canParticipate = Boolean(poll.can_participate)

  async function handleVoteSubmit(event) {
    event.preventDefault()
    if (!selectedOptionId) {
      setVoteError('Pick an option first.')
      return
    }
    setVoteError('')
    setVoting(true)
    try {
      const updated = await createPollVote({ poll_id: poll.id, poll_option_id: selectedOptionId })
      onVoted(updated)
    } catch (err) {
      setVoteError(err.message)
    } finally {
      setVoting(false)
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault()
    if (!commentBody.trim()) return
    setCommentError('')
    setCommenting(true)
    try {
      const updated = await createPollComment({ poll_id: poll.id, body: commentBody })
      onCommented(updated)
      setCommentBody('')
    } catch (err) {
      setCommentError(err.message)
    } finally {
      setCommenting(false)
    }
  }

  function renderParticipationPrompt(action) {
    if (!isLoggedIn) {
      return (
        <Link className="link-button" to="/login" state={{ from: location }}>
          Log in to {action}
        </Link>
      )
    }
    return (
      <Link className="link-button" to={`/contestants/${seasonNumber}`} state={{ from: location }}>
        Submit your picks for this season to {action}
      </Link>
    )
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
      ) : canParticipate ? (
        <form onSubmit={handleVoteSubmit} className={styles.voteForm}>
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

          {voteError && <p className="auth-error">{voteError}</p>}

          <button type="submit" disabled={voting}>
            {voting ? 'Submitting...' : 'Submit Vote'}
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
          {renderParticipationPrompt('vote')}
        </div>
      )}

      <div className={styles.comments}>
        <h4>Comments</h4>
        {poll.comments.length > 0 ? (
          <ul>
            {poll.comments.map((c) => (
              <li key={c.id}>
                <strong>{c.user_name}:</strong> {c.comment}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noComments}>No comments yet.</p>
        )}

        {!poll.my_comment_id &&
          (canParticipate ? (
            <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
              <textarea
                placeholder="Leave a comment"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                rows={2}
              />
              {commentError && <p className="auth-error">{commentError}</p>}
              <button type="submit" disabled={commenting || !commentBody.trim()}>
                {commenting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            renderParticipationPrompt('comment')
          ))}
      </div>
    </div>
  )
}

export default Poll
