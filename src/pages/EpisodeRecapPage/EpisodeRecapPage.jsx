import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchSeasons } from '../../api/seasons'
import { fetchContestantScores } from '../../api/contestants'
import { fetchEpisodePosts } from '../../api/episodePosts'
import { createMeme, deleteMeme } from '../../api/memes'
import EpisodePostForm from '../../components/EpisodePostForm/EpisodePostForm'
import BlueskyEmbed from '../../components/BlueskyEmbed/BlueskyEmbed'
import styles from './EpisodeRecapPage.module.css'

function AddMemeForm({ episodePostId, onAdded }) {
  const [blueskyUrl, setBlueskyUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const meme = await createMeme({
        episode_post_id: episodePostId,
        bluesky_url: blueskyUrl || null,
        image_url: blueskyUrl ? null : imageUrl,
        caption: caption || null,
        source_url: sourceUrl || null,
      })
      onAdded(meme)
      setBlueskyUrl('')
      setImageUrl('')
      setCaption('')
      setSourceUrl('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.addMemeForm} onSubmit={handleSubmit}>
      <h3>Add a Meme</h3>

      <label htmlFor="meme-bluesky-url">Bluesky post URL</label>
      <input
        id="meme-bluesky-url"
        type="url"
        placeholder="https://bsky.app/profile/handle/post/..."
        value={blueskyUrl}
        onChange={(e) => setBlueskyUrl(e.target.value)}
      />
      <p className={styles.hint}>Paste a Bluesky post link and it embeds live — image, text, and all.</p>

      <div className={styles.formDivider}>or add an image directly</div>

      <div className={styles.addMemeGrid}>
        <input
          type="url"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          disabled={Boolean(blueskyUrl)}
        />
        <input
          type="text"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <input
          type="url"
          placeholder="Source link (optional)"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
        />
      </div>
      {error && <p className="auth-error">{error}</p>}
      <button type="submit" disabled={submitting || (!blueskyUrl && !imageUrl)}>
        {submitting ? 'Adding...' : 'Add to the wall'}
      </button>
    </form>
  )
}

function EpisodeRecapPage() {
  const { seasonNumber, episodeNumber } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [season, setSeason] = useState(null)
  const [episodeNumbers, setEpisodeNumbers] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEditForm, setShowEditForm] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    fetchSeasons()
      .then((seasons) => {
        const matchedSeason = seasons.find((s) => s.number === Number(seasonNumber))
        if (!matchedSeason) {
          if (!cancelled) setError('Season not found.')
          return null
        }
        if (!cancelled) setSeason(matchedSeason)
        return Promise.all([fetchContestantScores(matchedSeason.id), fetchEpisodePosts(matchedSeason.id)])
      })
      .then((data) => {
        if (!data || cancelled) return
        const [contestantScores, episodePosts] = data
        const numbers = [
          ...new Set(contestantScores.flatMap((c) => c.episode_scores.map((es) => es.episode_number))),
        ].sort((a, b) => a - b)
        setEpisodeNumbers(numbers)
        setPosts(episodePosts)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [seasonNumber])

  if (loading) {
    return (
      <div className={styles.recapPage}>
        <p>Loading recap...</p>
      </div>
    )
  }

  if (error || !season) {
    return (
      <div className={styles.recapPage}>
        <div className={styles.header}>
          <button onClick={() => navigate(`/scores/${seasonNumber}`)}>&larr; Back to Scores</button>
        </div>
        <p className="auth-error">{error || 'Season not found.'}</p>
      </div>
    )
  }

  const selectedEpisode = Number(episodeNumber)
  const post = posts.find((p) => p.episode_number === selectedEpisode)
  const blueskyMemes = post?.memes.filter((m) => m.bluesky_url) ?? []
  const imageMemes = post?.memes.filter((m) => !m.bluesky_url) ?? []

  function handlePostSaved(savedPost) {
    setPosts((prev) => {
      const exists = prev.some((p) => p.id === savedPost.id)
      return exists ? prev.map((p) => (p.id === savedPost.id ? savedPost : p)) : [...prev, savedPost]
    })
    setShowEditForm(false)
  }

  function handleMemeAdded(meme) {
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, memes: [...p.memes, meme] } : p)))
  }

  async function handleMemeDelete(meme) {
    if (!window.confirm('Remove this meme?')) return
    try {
      await deleteMeme(meme.id)
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, memes: p.memes.filter((m) => m.id !== meme.id) } : p))
      )
    } catch (err) {
      window.alert(`Could not remove meme: ${err.message}`)
    }
  }

  return (
    <div className={styles.recapPage}>
      <div className={styles.header}>
        <button onClick={() => navigate(`/scores/${seasonNumber}`)}>&larr; Back to Scores</button>
        <h1>Season {season.number} · Episode {selectedEpisode} Recap</h1>
      </div>

      <div className={styles.tabStrip}>
        {episodeNumbers.map((ep) => (
          <button
            key={ep}
            className={ep === selectedEpisode ? styles.tabActive : styles.tab}
            onClick={() => navigate(`/scores/${seasonNumber}/episodes/${ep}`)}
          >
            Ep {ep}
          </button>
        ))}
      </div>

      <div className={styles.panel}>
        {!post ? (
          <div className={styles.empty}>
            <p>No recap posted for Episode {selectedEpisode} yet.</p>
            {user.admin && <button onClick={() => setShowEditForm(true)}>Create Recap</button>}
          </div>
        ) : (
          <>
            {user.admin && (
              <button className={styles.editButton} onClick={() => setShowEditForm(true)}>
                Edit Recap
              </button>
            )}

            {post.recap && <p className={styles.recapText}>{post.recap}</p>}
            {post.superlatives && (
              <div className={styles.superlatives}>
                <h2>Superlatives and Awards</h2>
                <ol className={styles.superlativesList}>
                  {post.superlatives
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <li key={index}>{line}</li>
                    ))}
                </ol>
              </div>
            )}

            {blueskyMemes.length > 0 && (
              <div className={styles.blueskyList}>
                {blueskyMemes.map((meme) => (
                  <div className={styles.blueskyCard} key={meme.id}>
                    {user.admin && (
                      <button
                        className={styles.removeMeme}
                        onClick={() => handleMemeDelete(meme)}
                        aria-label="Remove this meme"
                        title="Remove this meme"
                      >
                        ×
                      </button>
                    )}
                    <BlueskyEmbed postUrl={meme.bluesky_url} />
                    {meme.caption && <p className={styles.memeCaption}>{meme.caption}</p>}
                  </div>
                ))}
              </div>
            )}

            {imageMemes.length > 0 && (
              <div className={styles.memeGrid}>
                {imageMemes.map((meme) => (
                  <div className={styles.memeCard} key={meme.id}>
                    {user.admin && (
                      <button
                        className={styles.removeMeme}
                        onClick={() => handleMemeDelete(meme)}
                        aria-label="Remove this meme"
                        title="Remove this meme"
                      >
                        ×
                      </button>
                    )}
                    <img src={meme.image_url} alt={meme.caption || 'meme'} loading="lazy" />
                    {meme.caption && <p className={styles.memeCaption}>{meme.caption}</p>}
                    {meme.source_url && (
                      <a href={meme.source_url} target="_blank" rel="noopener noreferrer" className={styles.memeSource}>
                        View original →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {user.admin && <AddMemeForm episodePostId={post.id} onAdded={handleMemeAdded} />}
          </>
        )}
      </div>

      {showEditForm && (
        <EpisodePostForm
          seasonId={season.id}
          episodeNumber={selectedEpisode}
          episodePost={post}
          onCancel={() => setShowEditForm(false)}
          onSaved={handlePostSaved}
        />
      )}
    </div>
  )
}

export default EpisodeRecapPage
