import { useEffect } from 'react'

import {
  ID,
  cacheUsersSelectors,
  accountSelectors,
  CommonState,
  reformatUser,
  cacheActions,
  Kind,
  makeUid
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import { apiClient } from 'services/audius-api-client'
import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
const { getUserId } = accountSelectors
const { getUser } = cacheUsersSelectors

const fetchFromRemote = async (id: ID, currentUserId: ID) => {
  //   await new Promise((resolve, reject) => {
  //     setInterval(resolve, 3000)
  //   })
  const apiUser = await apiClient.getUser({ userId: id, currentUserId })
  if (apiUser?.length < 1) return null
  return reformatUser(apiUser[0], audiusBackendInstance)
}

export const useUserById = (id: ID) => {
  const currentUserId = useSelector(getUserId)
  const cachedUser = useSelector((state: CommonState) => getUser(state, { id }))
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchWrapped = async () => {
      if (cachedUser) return
      if (!currentUserId) return
      try {
        // dispatch loading
        const apiUser = await fetchFromRemote(id, currentUserId)
        // dispatch succeeded

        if (!apiUser) {
          throw new Error('User not found')
        }
        dispatch(
          cacheActions.addEntries(
            [Kind.USERS],
            {
              [Kind.USERS]: [
                {
                  id,
                  uid: makeUid(Kind.USERS, id),
                  metadata: apiUser
                }
              ]
            },
            false,
            true
          )
        )
      } catch (e) {
        // dispatch error
      }
    }
    fetchWrapped()
  }, [cachedUser, currentUserId, dispatch, id])

  return { user: cachedUser }
}
