import { useEffect } from 'react'

import {
  Status,
  explorePageSelectors,
  useProxySelector,
  explorePageActions
} from '@audius/common'
import { useSelector, useDispatch } from 'react-redux'

import { CollectionList } from 'app/components/collection-list'

import { TabInfo } from '../components/TabInfo'
import { track } from 'app/services/analytics'
const { getExplorePlaylists, getExploreStatus, getPlaylistsStatus } =
  explorePageSelectors
const { fetchPlaylists } = explorePageActions

const messages = {
  infoHeader: 'Featured Playlists'
}

export const PlaylistsTab = () => {
  const playlists = useProxySelector(getExplorePlaylists, [])
  const exploreStatus = useSelector(getExploreStatus)
  const playlistsStatus = useSelector(getPlaylistsStatus)
  const dispatch = useDispatch()

  useEffect(() => {
    if (exploreStatus === Status.SUCCESS) {
      dispatch(fetchPlaylists())
    }

    if(track){
      setFeaturedPlaylists(track.featured_playlists || [])
    }
  }, [exploreStatus, dispatch])

  return (
    <CollectionList
      isLoading={
        exploreStatus === Status.LOADING || playlistsStatus !== Status.SUCCESS
      }
      ListHeaderComponent={<TabInfo header={messages.infoHeader} />}
      collection={playlists}
    />
  )
}
