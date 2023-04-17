import React, { useEffect, useState } from 'react'

import { ApolloProvider } from '@apollo/client'
import {
  trackPageActions,
  cacheTracksSelectors,
  tracksSocialActions,
  trackPageSelectors,
  CommonState,
  FavoriteSource
} from '@audius/common'
import { AudiusSdk } from '@audius/sdk'
import { useDispatch, useSelector } from 'react-redux'

import TrackTile from 'components/track/desktop/TrackTile'
import { TrackTileSize } from 'components/track/types'
import { audiusSdk } from 'services/audius-sdk'

import { useGetTrack } from './useGetTrack'
import { useSaveTrack } from './useSaveTrack'

const { getTrack } = cacheTracksSelectors
const { fetchTrack } = trackPageActions
const { saveTrack } = tracksSocialActions
const { getUser } = trackPageSelectors

const useSdk = () => {
  const [sdk, setSdk] = useState<AudiusSdk>()

  useEffect(() => {
    audiusSdk().then(setSdk)
  }, [])

  return sdk
}

export const ApolloPage = () => {
  const sdk = useSdk()

  if (!sdk) {
    return null
  }

  return (
    <ApolloProvider client={sdk.graphql.client as any}>
      <ApolloPageContent />
    </ApolloProvider>
  )
}

const ApolloPageContent = () => {
  const { loading, error, data } = useGetTrack()

  const [mutateFunction, saveTrackState] = useSaveTrack({ id: data?.track.id })

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error : {error.message}</p>
  const { has_current_user_saved, title, user: artist } = data.track

  return (
    <div style={{ margin: 24 }}>
      <h2 style={{ margin: 24 }}>Apollo</h2>
      <TrackTile
        artwork={<Image />}
        isFavorited={has_current_user_saved}
        onClickFavorite={mutateFunction}
        size={TrackTileSize.LARGE}
        title={title}
        isActive={false}
        userName={artist.name}
      />
      <h2 style={{ margin: 24 }}>Cache v1</h2>
      <CacheV1TrackTile />
    </div>
  )
}

const CacheV1TrackTile = () => {
  const id = 1452627438
  const dispatch = useDispatch()
  const cachedTrack = useSelector((state: CommonState) =>
    getTrack(state, { id })
  )

  const cachedUser = useSelector((state: CommonState) =>
    getUser(state, { id: cachedTrack?.owner_id })
  )

  useEffect(() => {
    dispatch(fetchTrack(id))
  }, [dispatch])

  return (
    <TrackTile
      artwork={<Image />}
      isFavorited={cachedTrack?.has_current_user_saved}
      onClickFavorite={() => {
        dispatch(saveTrack(id, FavoriteSource.TRACK_PAGE))
      }}
      size={TrackTileSize.LARGE}
      title={cachedTrack?.title}
      isActive={false}
      userName={cachedUser?.name}
    />
  )
}

const Image = () => (
  <img
    style={{ height: 126, width: 126, borderRadius: 4 }}
    src={
      'https://blockchange-audius-content-01.bdnodes.net/ipfs/QmU5Leh2xdLJykmke8GeEPjvJRBRKuo3Aa4Bdioi1Sd3EJ/480x480.jpg'
    }
  />
)
