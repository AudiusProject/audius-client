import { useEffect } from 'react'

import {
  ID,
  usersSelectors,
  accountSelectors,
  CommonState,
  usersActions,
  reformatUser,
  getErrorMessage
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import { apiClient } from 'services/audius-api-client'
import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
const { getUserId } = accountSelectors
const { selectUserById, getUserError, getUserStatus } = usersSelectors
const { fetchUserStarted, fetchUserSucceeded, fetchUserFailed } = usersActions

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
  const cachedUser = useSelector((state: CommonState) =>
    selectUserById(state, id)
  )
  const userStatus = useSelector((state: CommonState) =>
    getUserStatus(state, id)
  )
  const userError = useSelector((state: CommonState) => getUserError(state, id))
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchWrapped = async () => {
      if (cachedUser) return
      if (!currentUserId) return
      dispatch(fetchUserStarted({ userId: id }))
      try {
        const apiUser = await fetchFromRemote(id, currentUserId)
        if (!apiUser) {
          throw new Error('User not found')
        }
        dispatch(fetchUserSucceeded({ userId: id, user: apiUser }))
      } catch (e) {
        dispatch(
          fetchUserFailed({
            userId: id,
            error: { status: 404, message: getErrorMessage(e) }
          })
        )
      }
    }
    fetchWrapped()
  }, [cachedUser, currentUserId, dispatch, id])

  return { user: cachedUser, status: userStatus, error: userError }
}
