import { apiRequest } from './client'

export function createMeme(meme) {
  return apiRequest('/memes', {
    method: 'POST',
    body: { meme },
  })
}

export function deleteMeme(id) {
  return apiRequest(`/memes/${id}`, {
    method: 'DELETE',
  })
}
