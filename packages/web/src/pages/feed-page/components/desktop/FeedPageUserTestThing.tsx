import { accountSelectors } from '@audius/common'
import { useGetUserById } from 'api/user'
import { useSelector } from 'react-redux'

const { getUserId } = accountSelectors

export const FeedPageUserTestThing = () => {
  const currentUserId = useSelector(getUserId)
  const {
    data: user,
    status,
    errorMessage
  } = useGetUserById(395, currentUserId)

  return (
    <>
      {user?.name} {status} {errorMessage}
    </>
  )
}
