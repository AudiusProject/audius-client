import copy from 'copy-to-clipboard'

export const formatShareText = (title, creator) => {
  return `${title} by ${creator} on Audius`
}

export const getAudiusURL = () => {
  // We only have hostname in develop env,
  // otherwise we pull it from the window.location.
  const hostname = process.env.PREACT_APP_AUDIUS_HOSTNAME
  if (!hostname) {
    return `https://${window.location.host}`

  }
  const scheme = process.env.PREACT_APP_AUDIUS_SCHEME

  return `${scheme}://${hostname}`
}

const getCopyableLink = (path) => {
  return `${getAudiusURL()}/${path}`
}

export const share = (url, title, creator) => {
  const shareableLink = getCopyableLink(url)
  const shareText = formatShareText(title, creator)
  // @ts-ignore: navigator may have share field in updated browsers
  if (navigator.share) {
    // @ts-ignore: navigator may have share field in updated browsers
    navigator.share({
      shareText,
      url: shareableLink
    })
    .catch(() => {
      copy(shareableLink)
    })
  } else {
    copy(shareableLink)
  }
}
