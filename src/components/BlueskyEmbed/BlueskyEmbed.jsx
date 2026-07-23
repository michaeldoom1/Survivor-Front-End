import { useEffect, useState } from 'react'
import styles from './BlueskyEmbed.module.css'

// Bluesky's oEmbed endpoint resolves a human-readable post URL (handle-based)
// into an AT-URI (DID-based), which is what the direct iframe embed endpoint
// needs. See https://docs.bsky.app/docs/advanced-guides/oembed
async function resolveEmbedSrc(postUrl) {
  const response = await fetch(`https://embed.bsky.app/oembed?url=${encodeURIComponent(postUrl)}`)
  if (!response.ok) throw new Error('Could not find that Bluesky post.')

  const data = await response.json()
  const match = data.html.match(/data-bluesky-uri="at:\/\/([^"]+)"/)
  if (!match) throw new Error('Could not read that Bluesky post.')

  return `https://embed.bsky.app/embed/${match[1]}`
}

function BlueskyEmbed({ postUrl }) {
  const [embedSrc, setEmbedSrc] = useState(null)
  const [error, setError] = useState('')
  const [height, setHeight] = useState(600)

  useEffect(() => {
    let cancelled = false
    setError('')
    setEmbedSrc(null)

    resolveEmbedSrc(postUrl)
      .then((src) => {
        if (!cancelled) setEmbedSrc(src)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [postUrl])

  useEffect(() => {
    // Bluesky's embed iframe posts its rendered content height so the
    // parent page can size the frame correctly instead of clipping it.
    function handleMessage(event) {
      if (event.origin !== 'https://embed.bsky.app') return
      const nextHeight = event.data?.height
      if (typeof nextHeight === 'number' && nextHeight > 0) {
        setHeight(nextHeight)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <a href={postUrl} target="_blank" rel="noopener noreferrer">
          View on Bluesky →
        </a>
      </div>
    )
  }

  if (!embedSrc) {
    return <div className={styles.loading}>Loading post...</div>
  }

  return (
    <iframe src={embedSrc} title="Bluesky post" className={styles.iframe} style={{ height }} />
  )
}

export default BlueskyEmbed
