import { accountSelectors, ID } from '@audius/common'
import { useSelector } from 'react-redux'

import { useGetUserById } from 'api/user'
import { ArtistCard } from 'components/artist/ArtistCard'

const { getUserId } = accountSelectors

type FeedPageUserTestThingProps = {
  userId?: ID
}

export const FeedPageUserTestThing = (props: FeedPageUserTestThingProps) => {
  const { userId } = props
  const currentUserId = useSelector(getUserId)

  const { data: user, status } = useGetUserById({
    id: userId,
    currentUserId
  })

  return (
    <>
      User: {user?.user_id} {status}
      {/* @ts-ignore */}
      {user ? <ArtistCard artist={user} /> : null}
    </>
  )
}
