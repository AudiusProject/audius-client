import { SmartCollectionVariant } from '@audius/common'

import { SMART_COLLECTION_MAP } from 'common/store/smart-collection/smartCollections'

import { CollectionNavItem } from './CollectionNavItem'

type ExplorePlaylistNavItemProps = {
  playlistId: SmartCollectionVariant
  level: number
}

export const ExplorePlaylistNavItem = (props: ExplorePlaylistNavItemProps) => {
  const { playlistId, level } = props

  const playlist = SMART_COLLECTION_MAP[playlistId]

  if (!playlist) return null

  const { playlist_name, link } = playlist

  return (
    <CollectionNavItem
      id={playlistId}
      name={playlist_name}
      url={link}
      isOwned={false}
      level={level}
      hasUpdate={false}
    />
  )
}
