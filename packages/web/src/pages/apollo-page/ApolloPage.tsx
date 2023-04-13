import React from 'react'

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { RestLink } from 'apollo-link-rest'

import TrackTile from 'components/track/desktop/TrackTile'
import { TrackTileSize } from 'components/track/types'

import { useGetTrack } from './useGetTrack'
import { confirmSaveTrack, useSaveTrack } from './useSaveTrack'

const baseUri = 'https://discoveryprovider.audius.co/v1/full'

// This map defines how each mutation is performed,
// the lookup is based on the `path` argument to the @rest directive
const mutations = {
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
  },
  // This transformer returns the `data` field from the response
  responseTransformer: async (response) =>
    response.json().then(({ data }) => data)
})

const client = new ApolloClient({
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
    <TrackTile
      isFavorited={has_current_user_saved}
      onClickFavorite={mutateFunction}
      size={TrackTileSize.LARGE}
      title={title}
      isActive={false}
      userName={artist.name}
    />
  )
}
