import { getIdentityEndpoint, getAPIHostname } from './getEnv'
import { recordListen as recordAnalyticsListen } from '../analytics/analytics'

const HOSTNAME = getAPIHostname()
const IDENTITY_SERVICE_ENDPOINT = getIdentityEndpoint()

export const RequestedEntity = Object.seal({
  TRACKS: 'tracks',
  COLLECTIONS: 'collections'
})

// From DAPP
export const uuid = () => {
  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/873856#873856
  var s = []
  var hexDigits = '0123456789abcdef'
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'

  var uuid = s.join('')
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

export const recordListen = async (
  trackId
) => {
  const url = `${IDENTITY_SERVICE_ENDPOINT}/tracks/${trackId}/listen`
  const method = 'POST'
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  const body = JSON.stringify({
    userId: uuid()
  })

  try {
    await fetch(url, { method, headers, body })
    recordAnalyticsListen(trackId)
  } catch (e) {
    console.error(`Got error storing playcount: [${e.message}]`)
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
    console.error(`Saw error requesting URL [${url}]: [${e.message}]`)
    throw e
  }
}

const constructEndpoint = (entity, id, ownerId) => `${process.env.PREACT_APP_AUDIUS_SCHEME}://${HOSTNAME}/embed/api/${entity}/${id}?ownerId=${ownerId}`

export const getTrack = async (id, ownerId) => {
  const url = constructEndpoint(RequestedEntity.TRACKS, id, ownerId)
  return makeRequest(url)
}

export const getCollection = async (id, ownerId) => {
  const url = constructEndpoint(RequestedEntity.COLLECTIONS, id, ownerId)
  return makeRequest(url)
}

