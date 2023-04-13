import React from 'react'

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { decodeHashId } from '@audius/common'
import { RestLink } from 'apollo-link-rest'

import TrackTile from 'components/track/desktop/TrackTile'
import { TrackTileSize } from 'components/track/types'
import { apiClient } from 'services/audius-api-client'
import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'

import { useGetTrack } from './useGetTrack'
import { useSaveTrack } from './useSaveTrack'

enum BlockConfirmation {
  CONFIRMED = 'CONFIRMED',
  DENIED = 'DENIED',
  UNKNOWN = 'UNKNOWN'
}

const POLLING_FREQUENCY_MILLIS = 2000
const baseUri = 'https://discoveryprovider.audius.co/v1/full'

const mutations = {
  '/track/save': async (options) => {
    const id = decodeHashId(options.body.id)
    // transaction
    const { blockHash, blockNumber } = await audiusBackendInstance.saveTrack(id)

    // confirmer
    const confirmBlock = async () => {
      const { block_passed } = await apiClient.getBlockConfirmation(
        blockHash,
        blockNumber
      )

      return block_passed
        ? BlockConfirmation.CONFIRMED
        : BlockConfirmation.UNKNOWN
    }

    let confirmation: BlockConfirmation = await confirmBlock()

    // TODO If timeout, throw error
    while (confirmation === BlockConfirmation.UNKNOWN) {
      await new Promise((resolve) =>
        setTimeout(resolve, POLLING_FREQUENCY_MILLIS)
      )
      confirmation = await confirmBlock()
    }

    if (confirmation === BlockConfirmation.CONFIRMED) {
      // return optimisticResponse
      return new Response(
        JSON.stringify({ data: options.body.optimisticResponse })
      )

      // Refetch data, will this always be indexed in time?
      //   return fetch(
      //     `${baseUri}/tracks?handle=souljaboy&slug=soulja-boy-battlefield&user_id=D8v5P`
      //   )
    } else {
      throw Error('Transaction failed')
    }
  }
}

const restLink = new RestLink({
  uri: baseUri,
  defaultSerializer: (body, headers) => {
    return { body, headers }
  },
  customFetch: async (uri, options) => {
    if (options.method === 'GET') {
      return fetch(uri)
    } else if (options.method === 'POST') {
      const route = (uri as string).replace(baseUri, '')
      return mutations[route](options)
    }
  },
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
