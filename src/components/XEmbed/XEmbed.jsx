import { useEffect, useRef, useState } from 'react'
import styles from '../BlueskyEmbed/BlueskyEmbed.module.css'

let widgetsPromise = null

// X's widgets.js renders a post into a container and sizes it itself.
// Load it once and share it across every embed on the page.
function loadWidgets() {
  if (!widgetsPromise) {
    widgetsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.onload = () => window.twttr.ready(resolve)
      script.onerror = () => {
        widgetsPromise = null
        reject(new Error('Could not load X embeds.'))
      }
      document.body.appendChild(script)
    })
  }
  return widgetsPromise
}

function XEmbed({ postUrl }) {
  const containerRef = useRef(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    setError('')
    setLoading(true)

    const tweetId = postUrl.match(/\/status\/(\d+)/)?.[1]
    if (!tweetId) {
      setError('Could not read that X post.')
      setLoading(false)
      return undefined
    }

    loadWidgets()
      .then((twttr) => {
        if (cancelled) return null
        container.innerHTML = ''
        return twttr.widgets.createTweet(tweetId, container, { dnt: true })
      })
      .then((element) => {
        if (cancelled) return
        if (element === undefined) setError('Could not find that X post.')
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      container.innerHTML = ''
    }
  }, [postUrl])

  return (
    <>
      {loading && <div className={styles.loading}>Loading post...</div>}
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <a href={postUrl} target="_blank" rel="noopener noreferrer">
            View on X →
          </a>
        </div>
      )}
      <div ref={containerRef} hidden={Boolean(error)} />
    </>
  )
}

export default XEmbed
