import { useEffect, useRef, useState } from 'react'
import styles from '../BlueskyEmbed/BlueskyEmbed.module.css'

// Reddit serves embeddable post pages from embed.reddit.com at the same path
// as the post itself — this is the iframe their own embed widget creates.
function embedSrcFor(postUrl) {
  try {
    const { pathname } = new URL(postUrl)
    if (!/^\/r\/[^/]+\/comments\/[^/]+/.test(pathname)) return null
    return `https://embed.reddit.com${pathname}?embed=true&showmedia=true&theme=light`
  } catch {
    return null
  }
}

function RedditEmbed({ postUrl }) {
  const iframeRef = useRef(null)
  const [height, setHeight] = useState(500)
  const embedSrc = embedSrcFor(postUrl)

  useEffect(() => {
    // The Reddit iframe posts its rendered height (as a JSON string) so the
    // parent can size the frame instead of clipping or leaving a gap.
    function handleMessage(event) {
      if (event.origin !== 'https://embed.reddit.com') return
      if (event.source !== iframeRef.current?.contentWindow) return
      let message = event.data
      if (typeof message === 'string') {
        try {
          message = JSON.parse(message)
        } catch {
          return
        }
      }
      if (message?.type === 'resize.embed' && typeof message.data === 'number' && message.data > 0) {
        setHeight(message.data)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  if (!embedSrc) {
    return (
      <div className={styles.error}>
        <p>Could not read that Reddit post.</p>
        <a href={postUrl} target="_blank" rel="noopener noreferrer">
          View on Reddit →
        </a>
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      src={embedSrc}
      title="Reddit post"
      className={styles.iframe}
      style={{ height }}
    />
  )
}

export default RedditEmbed
