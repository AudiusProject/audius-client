import copy from 'copy-to-clipboard'

export const formatShareText = (title: string, creator: string) => {
  return `${title} by ${creator} on Audius`
}

const getCopyableLink = (path: string) => {
  const hostname = process.env.PREACT_APP_AUDIUS_HOSTNAME
  const scheme = process.env.PREACT_APP_AUDIUS_SCHEME

  return `${scheme}://${hostname}/${path}`
}

export const share = (url: string, title: string, creator: string) => {
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
