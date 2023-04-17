import { ID, Kind } from '@audius/common'

import { apiClient } from 'services/audius-api-client'

import { createApi } from './createApi'

const userApi = createApi({
  reducerPath: 'userApi',
  kind: Kind.USERS,
  endpoints: {
    async getUserById(id: ID, currentUserId: ID) {
      const apiUser = await apiClient.getUser({ userId: id, currentUserId })
      return {
        user: apiUser?.[0]
      }
    }
  }
})

export const { useGetUserById } = userApi.hooks
export default userApi.reducer
