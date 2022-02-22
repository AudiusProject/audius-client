import { useCallback } from 'react'

import { PlaybackSource } from 'audius-client/src/common/models/Analytics'
import { Track } from 'audius-client/src/common/models/Track'
import { User } from 'audius-client/src/common/models/User'
import { getTrack } from 'audius-client/src/common/store/cache/tracks/selectors'
import { getUserFromTrack } from 'audius-client/src/common/store/cache/users/selectors'
import { isEqual } from 'lodash'

import { LineupItemProps } from 'app/components/track-tile/types'
import { useNavigation } from 'app/hooks/useNavigation'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { LineupTile } from './LineupTile'

export const TrackTile = (props: LineupItemProps) => {
  const { uid } = props

  // Using isEqual as the equality function to prevent rerenders due to object references
  // not being preserved when syncing redux state from client.
  // This can be removed when no longer dependent on web client
  const track = useSelectorWeb(state => getTrack(state, { uid }), isEqual)
  const user = useSelectorWeb(
    state => getUserFromTrack(state, { uid }),
    isEqual
  )

  if (!track || !user) {
    console.warn('Track or user missing for TrackTile, preventing render')
    return null
  }

  if (track.is_delete || user?.is_deactivated) {
    return null
  }

  return <TrackTileComponent {...props} track={track} user={user} />
}

const TrackTileComponent = ({
  togglePlay,
  track,
  user,
  ...props
}: LineupItemProps & {
  track: Track
  user: User
}) => {
  const navigation = useNavigation()
  const {
    field_visibility,
    is_unlisted,
    permalink,
    play_count,
    title,
    track_id
  } = track

  const handlePress = useCallback(() => {
    togglePlay(props.uid, track_id, PlaybackSource.TRACK_TILE)
  }, [togglePlay, props.uid, track_id])

  const handlePressTitle = useCallback(() => {
    navigation.push({
      native: { screen: 'track', params: { id: track_id } },
      web: { route: permalink }
    })
  }, [navigation, permalink, track_id])

  const hideShare = field_visibility?.share === false
  const hidePlays = field_visibility?.play_count === false

  return (
    <LineupTile
      {...props}
      hideShare={hideShare}
      hidePlays={hidePlays}
      id={track_id}
      isUnlisted={is_unlisted}
      onPress={handlePress}
      onPressTitle={handlePressTitle}
      playCount={play_count}
      title={title}
      item={track}
      user={user}
    />
  )
}
