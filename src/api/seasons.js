import { apiRequest } from './client'

export function fetchSeasons() {
  return apiRequest('/seasons')
}

export function createSeason(season) {
  return apiRequest('/seasons', {
    method: 'POST',
    body: { season },
  })
}

export function updateSeason(id, season) {
  return apiRequest(`/seasons/${id}`, {
    method: 'PUT',
    body: { season },
  })
}

export function deleteSeason(id) {
  return apiRequest(`/seasons/${id}`, {
    method: 'DELETE',
  })
}
