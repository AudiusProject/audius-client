export const AUDIUS_PRESS_LINK = 'https://brand.audius.co'
export const AUDIUS_MERCH_LINK = 'https://merch.audius.co/'
export const AUDIUS_REMIX_CONTESTS_LINK = 'https://remix.audius.co/'
export const AUDIUS_BLOG_LINK = 'https://blog.audius.co/'

export const externalInternalLinks = [
  AUDIUS_PRESS_LINK,
  AUDIUS_MERCH_LINK,
  AUDIUS_REMIX_CONTESTS_LINK,
  AUDIUS_BLOG_LINK,
  'https://help.audius.co'
]
const audiusUrlRegex =
  // eslint-disable-next-line no-useless-escape
  /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?(staging\.)?(audius\.co)(\/.+)?/gim

export const isAudiusUrl = (url: string) => new RegExp(audiusUrlRegex).test(url)
export const isInteralAudiusUrl = (url: string) =>
  isAudiusUrl(url) &&
  !externalInternalLinks.some((externalLink) => externalLink.includes(url))
export const isExternalAudiusUrl = (url: string) =>
  new RegExp(audiusUrlRegex).test(url)
export const getPathFromAudiusUrl = (url: string) =>
  new RegExp(audiusUrlRegex).exec(url)?.[3] ?? null

const collectionUrlRegex =
  // eslint-disable-next-line no-useless-escape
  /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?(staging\.)?(audius\.co)(\/[\S]+\/(?:playlist|album)\/[\S]+)$/gim

export const isCollectionUrl = (url: string) =>
  new RegExp(collectionUrlRegex).test(url)
export const getPathFromPlaylistUrl = (url: string) => {
  const results = new RegExp(trackUrlRegex).exec(url)
  if (!results) return null
  return results[3]
}

const trackUrlRegex =
  // eslint-disable-next-line no-useless-escape
  /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?(staging\.)?(audius\.co)(\/[\S]+\/[\S]+)$/gim

export const isTrackUrl = (url: string) => new RegExp(trackUrlRegex).test(url)
export const getPathFromTrackUrl = (url: string) => {
  const results = new RegExp(trackUrlRegex).exec(url)
  if (!results) return null
  return results[3]
}
