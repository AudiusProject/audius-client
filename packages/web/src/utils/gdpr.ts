import { getLocation } from 'services/Location'

const DISMISSED_COOKIE_BANNER_KEY = 'dismissCookieBanner'
const IS_EU_KEY = 'isEU'
const IS_EU_CACHE_TTL_MS = 7 * 24 * 3600 * 1000

/**
 * Helper to get isEU from local storage with expiry
 */
const getCachedIsEU = () => {
  const cachedIsEU = localStorage.getItem(IS_EU_KEY)
  if (!cachedIsEU) {
    return null
  }
  const { isEU, expiry }: { isEU: boolean; expiry: number } =
    JSON.parse(cachedIsEU)

  if (Date.now() > expiry) {
    localStorage.removeItem(IS_EU_KEY)
    return null
  }
  return isEU
}

export const getIsInEU = async () => {
  const cachedIsEU = getCachedIsEU()
  if (cachedIsEU !== null) {
    return cachedIsEU
  }
  const location = await getLocation()
  if (!location) {
    return false
  }
  const isEU = location.in_eu
  localStorage.setItem(
    IS_EU_KEY,
    JSON.stringify({ isEU, expiry: Date.now() + IS_EU_CACHE_TTL_MS })
  )
  return isEU
}

export const shouldShowCookieBanner = async (): Promise<
  boolean | undefined
> => {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.REACT_APP_ENVIRONMENT === 'production'
  ) {
    const isDimissed = localStorage.getItem(DISMISSED_COOKIE_BANNER_KEY)
    if (isDimissed) return false
    const isInEU = await getIsInEU()
    return isInEU
  }
}

export const dismissCookieBanner = () => {
  const date = new Date().toString()
  localStorage.setItem(DISMISSED_COOKIE_BANNER_KEY, date)
}
