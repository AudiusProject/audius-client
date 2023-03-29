import { useEffect } from 'react'

import {
  explorePageActions,
  explorePageSelectors,
  Status,
  useProxySelector
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import { ProfileList } from 'app/components/profile-list'

import { TabInfo } from '../components/TabInfo'
const { getExploreArtists, getExploreStatus, getArtistsStatus } =
  explorePageSelectors

const { fetchProfiles } = explorePageActions

const messages = {
  infoHeader: 'Featured Artists'
}

export const ArtistsTab = () => {
  const artists = useProxySelector(getExploreArtists, [])
  const exploreStatus = useSelector(getExploreStatus)
  const artistsStatus = useSelector(getArtistsStatus)
  const dispatch = useDispatch()

  useEffect(() => {
    if (exploreStatus === Status.SUCCESS) {
      dispatch(fetchProfiles())
    }
  }, [exploreStatus, dispatch])

  return (
    <ProfileList
      isLoading={
        exploreStatus === Status.LOADING || artistsStatus !== Status.SUCCESS
      }
      profiles={artists}
      ListHeaderComponent={<TabInfo header={messages.infoHeader} />}
    />
  )
}
