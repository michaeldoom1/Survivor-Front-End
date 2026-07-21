import { apiRequest } from './client'

export function fetchContestants() {
  return apiRequest('/contestants')
}

export function fetchContestantScores(seasonId) {
  return apiRequest(`/contestants/scores?season_id=${seasonId}`)
}

export function createContestant(contestant) {
  return apiRequest('/contestants', {
    method: 'POST',
    body: { contestant },
  })
}

export function updateContestant(id, contestant) {
  return apiRequest(`/contestants/${id}`, {
    method: 'PUT',
    body: { contestant },
  })
}

export function deleteContestant(id) {
  return apiRequest(`/contestants/${id}`, {
    method: 'DELETE',
  })
}
