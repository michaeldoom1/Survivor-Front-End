import { toEmbedUrl } from './videoEmbed'
import styles from './PicksPage.module.css'

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function ContestantCard({ contestant, selections, onToggle, isAdmin, onEdit, picksLocked }) {
  const isMaleSelected = selections.male_contestant_id === contestant.id
  const isFemaleSelected = selections.female_contestant_id === contestant.id
  const isGoldenSelected = selections.golden_goose_contestant_id === contestant.id
  const isSelected = isMaleSelected || isFemaleSelected || isGoldenSelected
  const genderPickDisabled = picksLocked || isGoldenSelected
  const goldenGooseDisabled = picksLocked || isMaleSelected || isFemaleSelected
  const embedUrl = toEmbedUrl(contestant.video_url)

  const details = [contestant.tribename, contestant.occupation, contestant.age && `Age ${contestant.age}`]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}>
      <div className={styles.photo}>
        {contestant.photo_url ? (
          <img src={contestant.photo_url} alt={contestant.name} />
        ) : (
          <div className={styles.photoPlaceholder}>{initials(contestant.name)}</div>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.nameRow}>
          <h3>{contestant.name}</h3>
          {isAdmin && (
            <button className={styles.editButton} onClick={onEdit}>
              Edit
            </button>
          )}
        </div>
        {details && <p className={styles.meta}>{details}</p>}
        <p className={styles.bio}>{contestant.bio || 'No bio available yet.'}</p>

        <div className={styles.pickButtons}>
          {contestant.gender === 'Male' && (
            <button
              className={isMaleSelected ? styles.selectedButton : ''}
              disabled={genderPickDisabled}
              title={picksLocked ? 'Picks are locked for this season' : genderPickDisabled ? 'Already your Golden Goose pick' : undefined}
              onClick={() => onToggle(contestant, 'male_contestant_id')}
            >
              {isMaleSelected ? 'Selected: Male Pick' : 'Pick as Male'}
            </button>
          )}
          {contestant.gender === 'Female' && (
            <button
              className={isFemaleSelected ? styles.selectedButton : ''}
              disabled={genderPickDisabled}
              title={picksLocked ? 'Picks are locked for this season' : genderPickDisabled ? 'Already your Golden Goose pick' : undefined}
              onClick={() => onToggle(contestant, 'female_contestant_id')}
            >
              {isFemaleSelected ? 'Selected: Female Pick' : 'Pick as Female'}
            </button>
          )}
          <button
            className={isGoldenSelected ? styles.selectedButton : ''}
            disabled={goldenGooseDisabled}
            title={picksLocked ? 'Picks are locked for this season' : goldenGooseDisabled ? 'Already your Male/Female pick' : undefined}
            onClick={() => onToggle(contestant, 'golden_goose_contestant_id')}
          >
            {isGoldenSelected ? 'Selected: Golden Goose' : 'Pick as Golden Goose'}
          </button>
        </div>
      </div>

      <div className={styles.video}>
        {embedUrl ? (
          <iframe src={embedUrl} title={`${contestant.name} video`} allowFullScreen />
        ) : (
          <div className={styles.videoPlaceholder}>No video available</div>
        )}
      </div>
    </div>
  )
}

export default ContestantCard
