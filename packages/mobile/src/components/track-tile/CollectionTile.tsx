import { useCallback, useMemo } from 'react'

import { PlaybackSource } from 'audius-client/src/common/models/Analytics'
import { Collection } from 'audius-client/src/common/models/Collection'
import { Track } from 'audius-client/src/common/models/Track'
import { User } from 'audius-client/src/common/models/User'
import {
  EnhancedCollectionTrack,
  getCollection,
  getTracksFromCollection
} from 'audius-client/src/common/store/cache/collections/selectors'
import { getUserFromCollection } from 'audius-client/src/common/store/cache/users/selectors'
import { albumPage, playlistPage } from 'audius-client/src/utils/route'
import { isEqual } from 'lodash'

import { useNavigation } from 'app/hooks/useNavigation'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { LineupTile } from './LineupTile'
import { LineupTileTrackList } from './LineupTileTrackList'
import { LineupItemProps } from './types'

export const CollectionTile = (props: LineupItemProps) => {
  const { uid } = props

  const collection = useSelectorWeb(
    state => getCollection(state, { uid }),
    isEqual
  )

  const tracks = useSelectorWeb(
    state => getTracksFromCollection(state, { uid }),
    isEqual
  )

  const user = useSelectorWeb(
    state => getUserFromCollection(state, { uid }),
    isEqual
  )

  if (!collection || !tracks || !user) {
    console.warn(
      'Collection, tracks, or user missing for CollectionTile, preventing render'
    )
    return null
  }

  if (collection.is_delete || user?.is_deactivated) {
    return null
  }

  return (
    <CollectionTileComponent
      {...props}
      collection={collection}
      tracks={tracks}
      user={user}
    />
  )
}

const CollectionTileComponent = ({
  collection,
  togglePlay,
  tracks,
  user,
  ...props
}: LineupItemProps & {
  collection: Collection
  tracks: EnhancedCollectionTrack[]
  user: User
}) => {
  const { playlist_id, playlist_name } = collection
  const navigation = useNavigation()

  const routeWeb = useMemo(() => {
    return collection.is_album
      ? albumPage(user.handle, collection.playlist_name, collection.playlist_id)
      : playlistPage(
          user.handle,
          collection.playlist_name,
          collection.playlist_id
        )
  }, [collection, user])

  const handlePress = useCallback(() => {
    const trackUid = tracks[0] ? tracks[0].uid : null
    const trackId = tracks[0] ? tracks[0].track_id : null
    if (!trackUid || !trackId) {
      return
    }
    togglePlay(trackUid, trackId, PlaybackSource.PLAYLIST_TILE_TRACK)
  }, [togglePlay, tracks])

  const handlePressTitle = useCallback(() => {
    navigation.push({
      // TODO: update to `collection` screen
      native: { screen: 'track', params: { id: playlist_id } },
      web: { route: routeWeb }
    })
  }, [playlist_id, routeWeb, navigation])

  const duration = useMemo(() => {
    return tracks.reduce(
      (duration: number, track: Track) => duration + track.duration,
      0
    )
  }, [tracks])

  return (
    <LineupTile
      {...props}
      duration={duration}
      id={playlist_id}
      onPress={handlePress}
      onPressTitle={handlePressTitle}
      title={playlist_name}
      item={collection}
      user={user}
    >
      <LineupTileTrackList tracks={tracks} onPress={handlePressTitle} />
    </LineupTile>
  )
}
