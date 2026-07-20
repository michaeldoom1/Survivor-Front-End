import { apiRequest } from './client'

export function fetchSeasons() {
  return apiRequest('/seasons')
}
