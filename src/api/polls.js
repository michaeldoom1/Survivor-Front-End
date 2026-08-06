import { apiRequest } from './client'

export function fetchPolls(episodePostId) {
  return apiRequest(`/polls?episode_post_id=${episodePostId}`)
}

export function createPoll(poll) {
  return apiRequest('/polls', {
    method: 'POST',
    body: { poll },
  })
}

export function deletePoll(id) {
  return apiRequest(`/polls/${id}`, {
    method: 'DELETE',
  })
}
