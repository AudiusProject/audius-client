import { ID } from '@audius/common'

import { apiClient } from 'services/audius-api-client'

import { createApi } from './createApi'

const userApi = createApi({
  reducerPath: 'userApi',
  endpoints: {
    async getUserById(id: ID, currentUserId: ID) {
      const apiUser = await apiClient.getUser({ userId: id, currentUserId })
      return apiUser?.[0]
    }
  }
})

export const { useGetUserById } = userApi.hooks
export default userApi.reducer
