import { useGetTrackById } from 'api/track'
import TrackTile from 'components/track/desktop/TrackTile'

import { FeedPageUserTestThing } from './FeedPageUserTestThing'

export const FeedPageTrackTestThing = () => {
  const { data, status: trackStatus } = useGetTrackById({ id: 2523 })
  const track = data ? data.track : null

  return (
    <>
      Track:
      {track?.track_id} {trackStatus}
      {/* @ts-ignore */}
      <TrackTile title={track?.title} userName={track?.user.name} />
      {track?.user ? (
        <FeedPageUserTestThing userId={track?.user.user_id} />
      ) : null}
    </>
  )
}
