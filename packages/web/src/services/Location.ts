/* global fetch */

import { Level } from 'common/store/errors/level'
import { reportToSentry } from 'common/store/errors/reportToSentry'

type Location = {
  asn: string
  city: string
  continent_code: string
  country: string
  country_calling_code: string
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

export const getLocation = async (): Promise<Location | null> => {
  try {
    const res = await fetch('https://ipapi.co/json/')
    return res.json()
  } catch (e) {
    console.debug(
      `Got error during getLocation call: ${e} | Error message is: ${
        (e as any).message
      }`
    )
    await reportToSentry({
      level: Level.Error,
      error: new Error('IPAPIError'),
      name: 'IPAPIError',
      additionalInfo: {
        error: e,
        errorMessage: (e as any).message
      }
    })
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
