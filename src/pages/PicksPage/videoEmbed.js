export function toEmbedUrl(videoUrl) {
  if (!videoUrl) return null

  try {
    const url = new URL(videoUrl)

    if (url.hostname.includes('youtube.com') && url.searchParams.has('v')) {
      return `https://www.youtube.com/embed/${url.searchParams.get('v')}`
    }

    if (url.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${url.pathname}`
    }

    return videoUrl
  } catch {
    return null
  }
}
