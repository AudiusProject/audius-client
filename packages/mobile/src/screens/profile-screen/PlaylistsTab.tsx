import { useMemo } from 'react'

import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { CollectionList } from '../../components/collection-list/CollectionList'

import { useEmptyProfileText } from './EmptyProfileTile'
import { getProfile } from './selectors'

const messages = {
  emptyTabText: 'created any playlists yet'
}

export const PlaylistsTab = () => {
  const { profile, playlists } = useSelectorWeb(getProfile)

  const userPlaylists = useMemo(() => {
    if (profile && playlists) {
      return playlists.map(album => ({ ...album, user: profile }))
    }
  }, [profile, playlists])

  const emptyListText = useEmptyProfileText(profile, messages.emptyTabText)

  if (!userPlaylists) return null

  return (
    <CollectionList
      listKey='profile-playlists'
      collection={userPlaylists}
      emptyListText={emptyListText}
    />
  )
}
