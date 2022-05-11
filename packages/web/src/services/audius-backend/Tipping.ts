import { ID } from 'common/models/Identifiers'
import { Supporter, Supporting } from 'common/models/Tipping'
import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'
import { encodeHashId } from 'utils/route/hashIds'

const LIMIT = 25

// @ts-ignore
const libs = () => window.audiusLibs

type SupportRequest = {
  userId: ID
  limit?: number
  offset?: number
}
export const fetchSupporting = async ({
  userId,
  limit = LIMIT,
  offset = 0
}: SupportRequest): Promise<Supporting[]> => {
  try {
    const encodedUserId = encodeHashId(userId)
    await waitForLibsInit()
    const response: Supporting[] = await libs().discoveryProvider._makeRequest({
      endpoint: `/v1/users/${encodedUserId}/supporting`,
      params: { limit, offset }
    })
    return response
  } catch (e) {
    console.error(
      `Could not fetch supporting for user id ${userId}: ${
        (e as Error).message
      }`
    )
    return []
  }
}

export const fetchSupporters = async ({
  userId,
  limit = LIMIT,
  offset = 0
}: SupportRequest): Promise<Supporter[]> => {
  try {
    const encodedUserId = encodeHashId(userId)
    await waitForLibsInit()
    const response: Supporter[] = await libs().discoveryProvider._makeRequest({
      endpoint: `/v1/users/${encodedUserId}/supporter`,
      params: { limit, offset }
    })
    return response
  } catch (e) {
    console.error(
      `Could not fetch supporters for user id ${userId}: ${
        (e as Error).message
      }`
    )
    return []
  }
}
