import { ID } from 'common/models/Identifiers'
import { Supporter, Supporting } from 'common/models/Tipping'
import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'

const LIMIT = 25

// @ts-ignore
const libs = () => window.audiusLibs

export type GetSupportingResponse = Supporting[]
export type GetSupportersResponse = Supporter[]

export const fetchSupporting = async (userId: ID, limit = LIMIT) => {
  try {
    await waitForLibsInit()
    const response: GetSupportingResponse = await libs().discoveryProvider.getSupporting(
      userId,
      limit
    )
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

export const fetchSupporters = async (userId: ID, limit = LIMIT) => {
  try {
    await waitForLibsInit()
    const response: GetSupportersResponse = await libs().discoveryProvider.getSupporters(
      userId,
      limit
    )
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
