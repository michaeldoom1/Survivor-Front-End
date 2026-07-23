import { apiRequest } from './client'

export function fetchEpisodeScores(seasonId, episodeNumber) {
  return apiRequest(`/episode_scores?season_id=${seasonId}&episode_number=${episodeNumber}`)
}

export function createEpisodeScore(episodeScore) {
  return apiRequest('/episode_scores', {
    method: 'POST',
    body: { episode_score: episodeScore },
  })
}

export function updateEpisodeScore(id, episodeScore) {
  return apiRequest(`/episode_scores/${id}`, {
    method: 'PUT',
    body: { episode_score: episodeScore },
  })
}

export function deleteEpisodeScore(id) {
  return apiRequest(`/episode_scores/${id}`, {
    method: 'DELETE',
  })
}
