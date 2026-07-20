import { apiRequest } from './client'

export function fetchScoringEvents() {
  return apiRequest('/scoring_events')
}
