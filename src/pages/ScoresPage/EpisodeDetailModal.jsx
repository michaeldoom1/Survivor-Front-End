import styles from './ScoresPage.module.css'

function EpisodeDetailModal({ contestantName, episodeNumber, events, onClose }) {
  const total = events.reduce((sum, e) => sum + e.points, 0)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>
          {contestantName} &mdash; Episode {episodeNumber}
        </h2>

        <ul className={styles.eventList}>
          {events.map((event) => (
            <li key={event.id}>
              <span>
                {event.scoring_event}
                {event.count > 1 && <span className={styles.eventCount}> ({event.count})</span>}
              </span>
              <span className={event.points >= 0 ? styles.earnPoints : styles.losePoints}>
                {event.points >= 0 ? '+' : ''}
                {event.points}
              </span>
            </li>
          ))}
        </ul>

        <div className={styles.modalTotal}>
          <span>Total</span>
          <span>{total}</span>
        </div>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default EpisodeDetailModal
