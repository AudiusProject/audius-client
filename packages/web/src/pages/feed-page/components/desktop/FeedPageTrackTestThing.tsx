import { useGetTrackById } from 'api/track'

import { FeedPageUserTestThing } from './FeedPageUserTestThing'

export const FeedPageTrackTestThing = () => {
  const {
    data: track,
    status: trackStatus,
    errorMessage: trackErrorMessage
  } = useGetTrackById(2523)

  return (
    <>
      Track:
      {track?.track_id} {trackStatus} {trackErrorMessage}
      {track?.user.user_id ? (
        <FeedPageUserTestThing userId={track?.user.user_id} />
      ) : null}
    </>
  )
}
