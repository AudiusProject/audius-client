const audiusUrlRegex =
  // eslint-disable-next-line no-useless-escape
  /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?(audius.co|staging.audius.co)(\/.+)?/gim

export const isAudiusUrl = (url: string) => new RegExp(audiusUrlRegex).test(url)
export const getPathFromAudiusUrl = (url: string) =>
  new RegExp(audiusUrlRegex).exec(url)?.[2] ?? null
