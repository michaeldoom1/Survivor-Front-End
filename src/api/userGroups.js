import { apiRequest } from './client'

export function fetchUserGroups() {
  return apiRequest('/user_groups')
}

export function createUserGroup(userGroup) {
  return apiRequest('/user_groups', {
    method: 'POST',
    body: { user_group: userGroup },
  })
}

export function updateUserGroup(id, userGroup) {
  return apiRequest(`/user_groups/${id}`, {
    method: 'PATCH',
    body: { user_group: userGroup },
  })
}

export function deleteUserGroup(id) {
  return apiRequest(`/user_groups/${id}`, {
    method: 'DELETE',
  })
}
