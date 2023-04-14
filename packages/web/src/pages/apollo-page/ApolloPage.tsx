import React, { useEffect } from 'react'

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import {
  trackPageActions,
  cacheTracksSelectors,
  tracksSocialActions,
  trackPageSelectors,
  CommonState,
  FavoriteSource
} from '@audius/common'
import { RestLink } from 'apollo-link-rest'
import { useDispatch, useSelector } from 'react-redux'

import TrackTile from 'components/track/desktop/TrackTile'
import { TrackTileSize } from 'components/track/types'

import { useGetTrack } from './useGetTrack'
import { confirmSaveTrack, useSaveTrack } from './useSaveTrack'

const { getTrack } = cacheTracksSelectors
const { fetchTrack } = trackPageActions
const { saveTrack } = tracksSocialActions
const { getUser } = trackPageSelectors

const baseUri = 'https://discoveryprovider.audius.co/v1/full'

// This map defines how each mutation is performed,
// the lookup is based on the `path` argument to the @rest directive
const mutations: Record<string, (options: any) => Promise<Response>> = {
  '/track/save': confirmSaveTrack
}

const restLink = new RestLink({
  uri: baseUri,
  // Overwrite the default serializer so that the `input` arg
  // isn't stringified
  defaultSerializer: (body, headers) => {
    return { body, headers }
  },
  customFetch: async (uri, options) => {
    // For reads, simply fetch the uri
    if (options.method === 'GET') {
      return fetch(uri)

      // For writes, execute the mutation
      // (with confirmation)
    } else if (options.method === 'POST') {
      const route = (uri as string).replace(baseUri, '')
      return mutations[route](options)
    }
    throw Error('Mutation not defined')
  },
  // This transformer returns the `data` field from the response
  responseTransformer: async (response) =>
    response.json().then(({ data }: any) => data)
})

export const client = new ApolloClient({
  link: restLink,
  cache: new InMemoryCache()
})

export const ApolloPage = () => {
  return (
    <ApolloProvider client={client}>
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
