
const GENERAL_ADMISSION_URL = process.env.PREACT_APP_GENERAL_ADMISSION_URL

const enum PathComponents {
  TRACKS = 'tracks',
  COLLECTIONS = 'collections'
}

export interface TrackResponse {
  title: string
  handle: string
  userName: string
  segments: Array<{ duration: number, multihash: string }>
  urlPath: string
}

export type GetTracksResponse = TrackResponse & {
  isVerified: boolean,
  coverArt: string
}

export interface GetCollectionsResponse {
  name: string
  ownerHandle: string
  ownerName: string
  collectionURLPath: string
  tracks: TrackResponse[]
  coverArt: string
}


const makeRequest = async (url: string) => {
  try {
    const resp = await fetch(url)
    if (!resp.ok) {
      throw new Error(`HTTP Error: Status Code [${resp.status}]`)
    }
    return resp.json()
  } catch (e) {
    console.error(`Saw error requesting URL [${url}]: []${e.message}]`)
    throw e
  }
}

const constructEndpoint = (component: PathComponents, id: number, ownerId: number) => `${GENERAL_ADMISSION_URL}/embed/api/${component}/${id}?ownerId=${ownerId}`

export const getTrack = async (id: number, ownerId: number): Promise<GetTracksResponse> => {
  const url = constructEndpoint(PathComponents.TRACKS, id, ownerId)
  const resp: GetTracksResponse = await makeRequest(url)
  return resp
}

export const getCollection = async (id: number, ownerId: number): Promise<GetCollectionsResponse> => {
  const url = constructEndpoint(PathComponents.COLLECTIONS, id, ownerId)
  const resp: GetCollectionsResponse = await makeRequest(url)
  return resp
}

