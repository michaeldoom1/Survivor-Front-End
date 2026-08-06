import { apiRequest } from './client'

export function createPollVote(pollVote) {
  return apiRequest('/poll_votes', {
    method: 'POST',
    body: { poll_vote: pollVote },
  })
}
