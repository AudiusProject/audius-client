import BN from 'bn.js'
import numeral from 'numeral'

/**
 * The format for counting numbers should be 4 characters if possible (3 numbers and 1 Letter) without trailing 0
 * ie.
 * 375 => 375
 * 4,210 => 4.21K
 * 56,010 => 56K
 * 443,123 => 443K
 * 4,001,000 => 4M Followers
 */
export const formatCount = count => {
  if (count >= 1000) {
    const countStr = count.toString()
    if (countStr.length % 3 === 0) {
      return numeral(count).format('0a').toUpperCase()
    } else if (countStr.length % 3 === 1 && countStr[2] !== '0') {
      return numeral(count).format('0.00a').toUpperCase()
    } else if (countStr.length % 3 === 1 && countStr[1] !== '0') {
      return numeral(count).format('0.0a').toUpperCase()
    } else if (countStr.length % 3 === 2 && countStr[2] !== '0') {
      return numeral(count).format('0.0a').toUpperCase()
    } else {
      return numeral(count).format('0a').toUpperCase()
    }
  } else if (!count) {
    return '0'
  } else {
    return `${count}`
  }
}

/**
 * Formats a number of bytes into a nice looking string.
 * ie.
 * 1024 => 1.00 KB
 * 3072 => 3.07 KB
 * @param {number} bytes
 */
export const formatBytes = bytes => {
  return numeral(bytes).format('0.00 b')
}

/**
 * Formats a URL name for routing.
 *  Removes reserved URL characters
 *  Replaces white space with -
 *  Lower cases
 * @param {string} name
 */
export const formatUrlName = name => {
  if (!name) return ''
  return (
    name
      .replace(/!|%|#|\$|&|'|\(|\)|&|\*|\+|,|\/|:|;|=|\?|@|\[|\]/g, '')
      .replace(/\s+/g, '-')
      // Reduce repeated `-` to a single `-`
      .replace(/-+/g, '-')
      .toLowerCase()
  )
}

/**
 * Encodes a formatted URL name for routing.
 * Using window.location will automatically decode
 * the encoded component, so using the above formatUrlName(string) can
 * be used to compare results with the window.location directly.
 * @param {string} name
 */
export const encodeUrlName = name => {
  return encodeURIComponent(formatUrlName(name))
}

/**
 * Formats a message for sharing
 * @param {string} name
 */
export const formatShareText = (title, creator) => {
  return `${title} by ${creator} on Audius`
}

/**
 * Reduces multiple sequential newlines (> 3) into max `\n\n` and
 * trims both leading and trailing newlines
 * @param {string} str
 */
export const squashNewLines = str => {
  return str ? str.replace(/\n\s*\n\s*\n/g, '\n\n').trim() : str
}

/** Trims a string to alphanumeric values only */
export const trimToAlphaNumeric = string => {
  if (!string) return string
  return string.replace(/[#|\W]+/g, '')
}

export const pluralize = (
  message,
  count,
  suffix = 's',
  pluralizeAnyway = false
) => `${message}${count > 1 || pluralizeAnyway ? suffix : ''}`

/**
 * Format a BN to the shortened $AUDIO currency without decimals
 * @param {BN} amount The wei amount
 * @returns {string} $AUDIO The $AUDIO amount
 */
export const formatAudio = amount => {
  if (!BN.isBN(amount)) return ''
  let aud = amount.div(WEI).toString()
  aud = numeral(aud).format('0,0')
  return aud
}

// Wei -> Audio

export const formatWeiToAudioString = wei => {
  const aud = wei.div(WEI)
  return aud.toString()
}

/**
 * Format a number to have commas
 * @param {number|string} num
 */
export const formatNumberCommas = num => {
  const parts = num.toString().split('.')
  return (
    parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
    (parts[1] ? '.' + parts[1] : '')
  )
}

export const trimRightZeros = number => {
  return number.replace(/(\d)0+$/gm, '$1')
}

export const WEI = new BN('1000000000000000000')

export const checkOnlyNumeric = number => {
  const reg = /^\d+$/
  return reg.test(number)
}

export const checkOnlyWeiFloat = number => {
  const reg = /^[+-]?\d+(\.\d+)?$/
  const isFloat = reg.test(number)
  if (!isFloat) return false
  const nums = number.split('.')
  if (nums.length !== 2) return false
  if (!checkOnlyNumeric(nums[0]) || !checkOnlyNumeric(nums[1])) return false
  if (nums[1].length > 18) return false
  return true
}

export const convertFloatToWei = number => {
  const nums = number.split('.')
  if (nums.length !== 2) return null
  if (!checkOnlyNumeric(nums[0]) || !checkOnlyNumeric(nums[1])) return null
  const aud = new BN(nums[0]).mul(WEI)
  const weiMultiplier = 18 - nums[1].length
  const wei = new BN(nums[1]).mul(new BN('1'.padEnd(weiMultiplier + 1, '0')))
  return aud.add(wei)
}

export const checkWeiNumber = number => {
  return checkOnlyNumeric(number) || checkOnlyWeiFloat(number)
}

// Audio -> Wei
export const parseWeiNumber = number => {
  if (checkOnlyNumeric(number)) {
    return new BN(number).mul(WEI)
  } else if (checkOnlyWeiFloat(number)) {
    return convertFloatToWei(number)
  }
}
