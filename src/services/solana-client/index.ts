import transferWAudioBalance from './transferWAudioBalance'
import transferAudioIntoWormhole from './transferAudioIntoWormhole'
import createUserBank, { getBankAccountAddress } from './createUserBank'
import relay from './relay'

export const IDENTITY_SERVICE = process.env.REACT_APP_IDENTITY_SERVICE

export class SolanaClient {
  // Static methods
  static transferWAudioBalance = transferWAudioBalance
  static createUserBank = createUserBank
  static transferAudioIntoWormhole = transferAudioIntoWormhole

  // helper methods
  static relay = relay
  static getBankAccountAddress = getBankAccountAddress
}

// @ts-ignore
window.SolanaClient = SolanaClient

export default SolanaClient
