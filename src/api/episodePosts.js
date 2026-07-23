import { apiRequest } from './client'

export function fetchEpisodePosts(seasonId) {
  return apiRequest(`/episode_posts?season_id=${seasonId}`)
}

export function createEpisodePost(episodePost) {
  return apiRequest('/episode_posts', {
    method: 'POST',
    body: { episode_post: episodePost },
  })
}

export function updateEpisodePost(id, episodePost) {
  return apiRequest(`/episode_posts/${id}`, {
    method: 'PUT',
    body: { episode_post: episodePost },
  })
}
