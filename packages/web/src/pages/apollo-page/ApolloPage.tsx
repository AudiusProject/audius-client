import React from 'react'

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useQuery
} from '@apollo/client'
import { RestLink } from 'apollo-link-rest'

import TrackTile from 'components/track/desktop/TrackTile'
import { TrackTileSize } from 'components/track/types'

// /v1/full/tracks?handle=souljaboy&slug=soulja-boy-battlefield&user_id=D8v5P
const restLink = new RestLink({
  uri: 'https://discoveryprovider.audius.co/v1/full'
})

const client = new ApolloClient({
  link: restLink,
  cache: new InMemoryCache()
})

const GET_TRACK = gql`
  query Track {
    track
      @rest(
        type: "User"
        path: "/tracks?handle=souljaboy&slug=soulja-boy-battlefield&user_id=D8v5P"
      ) {
      data {
        id
        title
        name
        has_current_user_saved
        user {
          name
        }
      }
    }
  }
`

export const ApolloPage = () => {
  return (
    <ApolloProvider client={client}>
      <ApolloPageContent />
    </ApolloProvider>
  )
}

const ApolloPageContent = () => {
  const { loading, error, data } = useQuery(GET_TRACK)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error : {error.message}</p>
  console.log('graphql', data.track)
  const { has_current_user_saved, title, user: artist } = data.track.data

  return (
    <TrackTile
      isFavorited={has_current_user_saved}
      size={TrackTileSize.LARGE}
      title={title}
      isActive={false}
      userName={artist.name}
    />
  )
}
