import { apiRequest } from './client'

export function createPollComment(pollComment) {
  return apiRequest('/poll_comments', {
    method: 'POST',
    body: { poll_comment: pollComment },
  })
}
