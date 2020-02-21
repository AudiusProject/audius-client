const GENERAL_ADMISSION_URL = process.env.PREACT_APP_GENERAL_ADMISSION_URL

export const RequestedEntity = Object.seal({
  TRACKS: 'tracks',
  COLLECTIONS: 'collections'
})

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


const makeRequest = async (url) => {
  try {
    console.log(`Making request to: ${url}`)
    const resp = await fetch(url)
    if (!resp.ok) {
      // If we have a 404, that means the track was deleted
      if (resp.status === 404) return null
      // Otherwise throw
      throw new Error(`HTTP Error: Status Code [${resp.status}]`)
    }
    return resp.json()
  } catch (e) {
    console.log(e)
    console.error(`Saw error requesting URL [${url}]: []${e.message}]`)
    throw e
  }
}

const constructEndpoint = (entity, id, ownerId) => `${GENERAL_ADMISSION_URL}/embed/api/${entity}/${id}?ownerId=${ownerId}`

export const getTrack = async (id, ownerId) => {
  const url = constructEndpoint(RequestedEntity.TRACKS, id, ownerId)
  return makeRequest(url)
}

export const getCollection = async (id, ownerId) => {
  const url = constructEndpoint(RequestedEntity.COLLECTIONS, id, ownerId)
  return makeRequest(url)
}

