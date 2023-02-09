import { getIdentityEndpoint, getAPIHostname } from './getEnv'
import { sdk } from '@audius/sdk'

import { recordListen as recordAnalyticsListen } from '../analytics/analytics'
import { encodeHashId, decodeHashId } from './hashids'
import { logError } from './logError'

const HOSTNAME = getAPIHostname()
const IDENTITY_SERVICE_ENDPOINT = getIdentityEndpoint()

export const RequestedEntity = Object.seal({
  TRACKS: 'tracks',
  COLLECTIONS: 'collections',
  COLLECTIBLES: 'collectibles'
})

const audiusSdk = sdk({ appName: 'Audius Bedtime Client' })

export const uuid = () => {
  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/873856#873856
  const s = []
  const hexDigits = '0123456789abcdef'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'

  const uuid = s.join('')
  return uuid
}

// TODO: proptypes
// export interface TrackResponse {
//   title: string
//   handle: string
//   userName: string
//   segments: Array<{ duration: number, multihash: string }>
//   urlPath: string
// }

// export type GetTracksResponse = TrackResponse & {
//   isVerified: boolean,
//   coverArt: string
// }

// export interface GetCollectionsResponse {
//     name: string
//     ownerHandle: string
//     ownerName: string
//     collectionURLPath: string
//     tracks: TrackResponse[]
//     coverArt: string
// }

export const recordListen = async (trackId) => {
  const url = `${IDENTITY_SERVICE_ENDPOINT}/tracks/${trackId}/listen`
  const method = 'POST'
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }

  const body = JSON.stringify({
    userId: uuid()
  })

  try {
    await fetch(url, { method, headers, body })
    recordAnalyticsListen(trackId)
  } catch (e) {
    logError(`Got error storing playcount: [${e.message}]`)
  }
}

const makeRequest = async (url) => {
  try {
    const resp = await fetch(url)
    if (!resp.ok) {
      // If we have a 404, that means the track was deleted
      if (resp.status === 404) return null
      // Otherwise throw
      throw new Error(`HTTP Error: Status Code [${resp.status}]`)
    }
    return resp.json()
  } catch (e) {
    logError(`Saw error requesting URL [${url}]: [${e.message}]`)
    throw e
  }
}

const getFormattedCollectionResponse = (collection) => {
  const item = collection?.[0]
  item.permalink = `${item.permalink ?? ''}-${decodeHashId(item.id)}`
  return item
}

const constructCollectiblesEndpoint = (handle) =>
  `${process.env.PREACT_APP_AUDIUS_SCHEME}://${HOSTNAME}/embed/api/${handle}/${RequestedEntity.COLLECTIBLES}`

const constructCollectibleIdEndpoint = (handle, collectibleId) =>
  `${process.env.PREACT_APP_AUDIUS_SCHEME}://${HOSTNAME}/embed/api/${handle}/${RequestedEntity.COLLECTIBLES}/${collectibleId}`

export const getTrack = async (id) => {
  return audiusSdk.full.tracks.getTrack({ trackId: encodeHashId(id) })
}

export const getTrackWithHashId = async (hashId) => {
  return audiusSdk.full.tracks.getTrack({ trackId: hashId })
}

export const getCollection = async (id) => {
  const res = await audiusSdk.full.playlists.getPlaylist({
    playlidId: encodeHashId(id)
  })
  return getFormattedCollectionResponse(res)
}

export const getCollectionWithHashId = async (hashId) => {
  const res = await audiusSdk.full.playlists.getPlaylist({ playlistId: hashId })
  return getFormattedCollectionResponse(res)
}

export const getCollectible = async (handle, collectibleId) => {
  const url = constructCollectibleIdEndpoint(handle, collectibleId)
  return makeRequest(url)
}

export const getCollectibles = async (handle) => {
  const url = constructCollectiblesEndpoint(handle)
  return makeRequest(url)
}
