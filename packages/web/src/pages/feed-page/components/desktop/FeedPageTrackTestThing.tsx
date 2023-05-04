import { useGetTrackById } from 'api/track'
import TrackTile from 'components/track/desktop/TrackTile'

import { FeedPageUserTestThing } from './FeedPageUserTestThing'

export const FeedPageTrackTestThing = () => {
  const {
    data,
    status: trackStatus,
    errorMessage: trackErrorMessage
  } = useGetTrackById({ id: 2523 })
  const track = data ? data.track : null

  return (
    <>
      Track:
      {track?.track_id} {trackStatus} {trackErrorMessage}
      {/* @ts-ignore */}
      <TrackTile
        artwork={undefined}
        title={track?.title}
        // userName={}
        isOwner={false}
      />
      {track?.user ? (
        <FeedPageUserTestThing userId={track?.user.user_id} />
      ) : null}
    </>
  )
}
