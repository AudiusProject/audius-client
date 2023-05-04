import { useGetTrackById } from 'api/track'
import TrackTile from 'components/track/desktop/TrackTile'

import { FeedPageUserTestThing } from './FeedPageUserTestThing'

export const FeedPageTrackTestThing = () => {
  const {
    data: track,
    status: trackStatus,
    errorMessage: trackErrorMessage
  } = useGetTrackById({ id: 2523 })

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
      {track?.user ? <FeedPageUserTestThing userId={track?.user} /> : null}
    </>
  )
}
