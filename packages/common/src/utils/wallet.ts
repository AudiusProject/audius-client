import BN from 'bn.js'
import JSBI from 'jsbi'

import {
  BNAudio,
  BNWei,
  StringAudio,
  StringUSDC,
  StringWei
} from 'models/Wallet'
import {
  WEI,
  trimRightZeros,
  formatNumberCommas,
  formatWeiToAudioString,
  parseWeiNumber,
  convertFloatToWei
} from 'utils/formatUtil'
import { Nullable } from 'utils/typeUtils'

/** AUDIO utils */
const WEI_DECIMALS = 18 // 18 decimals on ETH AUDIO
const SPL_DECIMALS = 8 // 8 decimals on SPL AUDIO

export const zeroBNWei = new BN(0) as BNWei

export const weiToAudioString = (bnWei: BNWei): StringAudio => {
  const stringAudio = formatWeiToAudioString(bnWei) as StringAudio
  return stringAudio
}

export const weiToAudio = (bnWei: BNWei): BNAudio => {
  const stringAudio = formatWeiToAudioString(bnWei) as StringAudio
  return stringAudioToBN(stringAudio)
}

export const audioToWei = (stringAudio: StringAudio): BNWei => {
  const wei = parseWeiNumber(stringAudio) as BNWei
  return wei
}

export const stringWeiToBN = (stringWei: StringWei): BNWei => {
  return new BN(stringWei) as BNWei
}

export const stringAudioToBN = (stringAudio: StringAudio): BNAudio => {
  return new BN(stringAudio) as BNAudio
}

export const stringWeiToAudioBN = (stringWei: StringWei): BNAudio => {
  const bnWei = stringWeiToBN(stringWei)
  const stringAudio = weiToAudioString(bnWei)
  return new BN(stringAudio) as BNAudio
}

export const weiToString = (wei: BNWei): StringWei => {
  return wei.toString() as StringWei
}

export const stringAudioToStringWei = (stringAudio: StringAudio): StringWei => {
  return weiToString(audioToWei(stringAudio))
}

export const parseAudioInputToWei = (audio: StringAudio): Nullable<BNWei> => {
  if (!audio.length) return null
  // First try converting from float, in case audio has decimal value
  const floatWei = convertFloatToWei(audio) as Nullable<BNWei>
  if (floatWei) return floatWei
  // Safe to assume no decimals
  try {
    return audioToWei(audio)
  } catch {
    return null
  }
}

/**
 * Format wei BN to the full $AUDIO currency with decimals
 * @param amount The wei amount
 * @param shouldTruncate truncate decimals at truncation length
 * @param significantDigits if truncation set to true, how many significant digits to include
 * @returns $AUDIO The $AUDIO amount with decimals
 */
export const formatWei = (
  amount: BNWei,
  shouldTruncate = false,
  significantDigits = 4
): StringAudio => {
  const aud = amount.div(WEI)
  const wei = amount.sub(aud.mul(WEI))
  if (wei.isZero()) {
    return formatNumberCommas(aud.toString()) as StringAudio
  }
  const decimals = wei.toString().padStart(18, '0')

  let trimmed = `${aud}.${trimRightZeros(decimals)}`
  if (shouldTruncate) {
    const splitTrimmed = trimmed.split('.')
    const [before] = splitTrimmed
    let [, after] = splitTrimmed
    // If we have only zeros, just lose the decimal
    after = after.substr(0, significantDigits)
    if (parseInt(after) === 0) {
      trimmed = before
    } else {
      trimmed = `${before}.${after}`
    }
  }
  return formatNumberCommas(trimmed) as StringAudio
}

export const convertJSBIToAmountObject = (amount: JSBI, decimals: number) => {
  const divisor = JSBI.BigInt(10 ** decimals)
  const quotient = JSBI.divide(amount, divisor)
  const remainder = JSBI.remainder(amount, divisor)
  const uiAmountString = JSBI.greaterThan(remainder, JSBI.BigInt(0))
    ? `${quotient.toString()}.${remainder.toString().padStart(decimals, '0')}`
    : quotient.toString()
  return {
    amount: JSBI.toNumber(amount),
    amountString: amount.toString(),
    uiAmount: JSBI.toNumber(amount) / 10 ** decimals,
    uiAmountString
  }
}

export const convertWAudioToWei = (amount: BN) => {
  const decimals = WEI_DECIMALS - SPL_DECIMALS
  return amount.mul(new BN('1'.padEnd(decimals + 1, '0'))) as BNWei
}

export const convertWeiToWAudio = (amount: BN) => {
  const decimals = WEI_DECIMALS - SPL_DECIMALS
  return amount.div(new BN('1'.padEnd(decimals + 1, '0')))
}

/** USDC Utils */
const BN_USDC_WEI = new BN('1000000')

/** Formats a USDC wei string (full precision) to a fixed string suitable for
display as a dollar amount. Note: WILL lose precision by rounding to nearest cent */
export const formatUSDCWeiToUSDString = (amount: StringUSDC, precision = 2) => {
  // Since we only need two digits of precision, we will multiply up by 100
  // with BN, divide by $1 Wei, and then convert to JS number and divide back down
  // before formatting to two decimal places.
  const converted =
    new BN(amount).muln(100).divRound(BN_USDC_WEI).toNumber() / 100
  return converted.toFixed(precision)
}

/** General Wallet Utils */
export const shortenSPLAddress = (addr: string) => {
  return `${addr.substring(0, 4)}...${addr.substr(addr.length - 5)}`
}

export const shortenEthAddress = (addr: string) => {
  return `0x${addr.substring(2, 4)}...${addr.substr(addr.length - 5)}`
}
