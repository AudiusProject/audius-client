import { audiusBackendInstance } from './audius-backend/audius-backend-instance'

export type Location = {
  asn: string
  city: string
  continent_code: string
  country: string
  country_calling_code: string
  country_code: string
  country_code_iso3: string
  country_name: string
  currency: string
  in_eu: boolean
  ip: string
  languages: string
  latitude: number
  longitude: number
  org: string
  postal: string
  region: string
  region_code: string
  timezone: string
  utc_offset: string
}

let cachedLocation: Location | null = null
const identityServiceUrl = audiusBackendInstance.identityServiceUrl
export const getLocation = async (): Promise<Location | null> => {
  try {
    if (cachedLocation) {
      return cachedLocation
    }
    const res = await fetch(`${identityServiceUrl}/location`)
    const json = await res.json()
    if (json.error) {
      throw new Error(json.reason)
    }
    cachedLocation = json
    return json
  } catch (e) {
    console.error(
      `Got error during getLocation call: ${e} | Error message is: ${
        (e as any)?.message ?? null
      }`
    )
    return null
  }
}

export const getCityAndRegion = async () => {
  const location = await getLocation()
  if (!location) return null

  if (location.city && location.region_code) {
    return `${location.city}, ${location.region_code}`
  }
  if (location.city) {
    return `${location.city}`
  }
  return null
}
