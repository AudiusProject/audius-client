import { accountSelectors, ID } from '@audius/common'
import { useGetUserById } from 'api/user'
import { useSelector } from 'react-redux'

const { getUserId } = accountSelectors

type FeedPageUserTestThingProps = {
  userId?: ID
}

export const FeedPageUserTestThing = (props: FeedPageUserTestThingProps) => {
  const { userId } = props
  const currentUserId = useSelector(getUserId)

  const {
    data: user,
    status,
    errorMessage
  } = useGetUserById(userId, currentUserId)

  return (
    <>
      User:
      {user?.name} {status} {errorMessage}
    </>
  )
}
