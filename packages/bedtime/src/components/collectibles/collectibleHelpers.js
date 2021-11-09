import { gifPreview } from "../../util/image/gifPreview"

export const getFrameFromGif = async (url, name) => {
  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
  const isSafariMobile =
    navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i)
  let preview
  try {
    // Firefox does not handle partial gif rendering well
    if (isFirefox || isSafariMobile) {
      throw new Error('partial gif not supported')
    }
    const req = await fetch(url, {
      headers: {
        // Extremely heuristic 200KB. This should contain the first frame
        // and then some. Rendering this out into an <img tag won't allow
        // animation to play. Some gifs may not load if we do this, so we
        // can try-catch it.
        Range: 'bytes=0-200000'
      }
    })
    const ab = await req.arrayBuffer()
    preview = new Blob([ab])
  } catch (e) {
    preview = await gifPreview(url)
  }

  return URL.createObjectURL(preview)
}

/**
 * Generate a short base36 hash for a given string.
 * Used to generate short hashes for for queries and urls.
 * @param {string} str
 * @returns {string} hash
 */
export const getHash = (str) => (
  Math.abs(str.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)).toString(36)
)
