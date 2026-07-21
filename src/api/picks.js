import { apiRequest } from './client'

export function fetchMyPicks() {
  return apiRequest('/picks')
}

export function fetchPicksBySeason(seasonId) {
  return apiRequest(`/picks/by_season?season_id=${seasonId}`)
}

export function createPick(pick) {
  return apiRequest('/picks', {
    method: 'POST',
    body: { pick },
  })
}

export function updatePick(id, pick) {
  return apiRequest(`/picks/${id}`, {
    method: 'PUT',
    body: { pick },
  })
}
