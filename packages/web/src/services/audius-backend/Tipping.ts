import { Supporter, Supporting } from 'common/models/Tipping'
import * as adapter from 'services/audius-api-client/ResponseAdapter'
import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'

const LIMIT = 25

// @ts-ignore
const libs = () => window.audiusLibs

type SupportRequest = {
  encodedUserId: string
  limit?: number
  offset?: number
}
export const fetchSupporting = async ({
  encodedUserId,
  limit = LIMIT,
  offset = 0
}: SupportRequest): Promise<Supporting[]> => {
  try {
    await waitForLibsInit()
    const response = await libs().discoveryProvider._makeRequest({
      endpoint: `/v1/users/${encodedUserId}/supporting`,
      params: { limit, offset }
    })
    return response.map((item: any) => {
      return {
        ...item,
        receiver: {
          ...adapter.makeUser(item.receiver),
          _profile_picture_sizes: item.receiver.profile_picture,
          _cover_photo_sizes: item.receiver.cover_photo
        }
      }
    }) as Supporting[]
  } catch (e) {
    console.error(
      `Could not fetch supporting for encoded user id ${encodedUserId}: ${
        (e as Error).message
      }`
    )
    return []
  }
}

export const fetchSupporters = async ({
  encodedUserId,
  limit = LIMIT,
  offset = 0
}: SupportRequest): Promise<Supporter[]> => {
  try {
    await waitForLibsInit()
    const response: Supporter[] = await libs().discoveryProvider._makeRequest({
      endpoint: `/v1/users/${encodedUserId}/supporters`,
      params: { limit, offset }
    })
    return response.map((item: any) => {
      return {
        ...item,
        sender: {
          ...adapter.makeUser(item.sender),
          _profile_picture_sizes: item.sender.profile_picture,
          _cover_photo_sizes: item.sender.cover_photo
        }
      }
    }) as Supporter[]
  } catch (e) {
    console.error(
      `Could not fetch supporters for encoded user id ${encodedUserId}: ${
        (e as Error).message
      }`
    )
    return []
  }
}
