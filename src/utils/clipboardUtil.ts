const PUBLIC_PROTOCOL = process.env.REACT_APP_PUBLIC_PROTOCOL
const PUBLIC_HOSTNAME = process.env.REACT_APP_PUBLIC_HOSTNAME
const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

// Pulled from: https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
export const copyToClipboard = (str: string) => {
  const el = document.createElement('textarea')
  el.value = str
  el.setAttribute('contentEditable', 'true')
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)

  if (isIOS || isSafari) {
    const range = document.createRange()
    const s = window.getSelection()
    s!.removeAllRanges()
    s!.addRange(range)
    el.setSelectionRange(0, 999999)
  } else {
    el.select()
  }

  document.execCommand('copy')
  document.body.removeChild(el)
}

/**
 * Gets a copyable link for the app.
 * The protocol will change depending on the context (electron vs. mobile vs. web)
 */
export const getCopyableLink = (link: string) => {
  const protocol = window.location.protocol
  const hostname = window.location.host // host instead of hostname to work with ports besides 80

  if (protocol !== 'audius:' && !NATIVE_MOBILE) {
    return `${protocol}//${hostname}${link}`
  } else {
    return `${PUBLIC_PROTOCOL}//${PUBLIC_HOSTNAME}${link}`
  }
}

/**
 * Copies a link to the clipboard
 */
export const copyLinkToClipboard = (link: string) => {
  copyToClipboard(getCopyableLink(link))
}

// @ts-ignore: Navigator's share exists on newer browsers
export const isShareToastDisabled = !!navigator.share || !!NATIVE_MOBILE
