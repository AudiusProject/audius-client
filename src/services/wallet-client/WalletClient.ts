import BN from 'bn.js'
import { WalletAddress } from 'store/wallet/slice'

class WalletClient {
  init() {}

  async getCurrentBalance(): Promise<BN> {
    // TODO: replace placeholder
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(new BN('100000'))
      }, 1500)
    })
  }

  async getClaimableBalance(): Promise<BN> {
    // TODO: replace placeholder
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(new BN('10000'))
      }, 1500)
    })
  }

  async claim(): Promise<void> {
    // TODO: replace placeholder
    console.log('Claiming')
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 3500)
    })
  }

  async sendTokens(address: WalletAddress, amount: BN): Promise<void> {
    // TODO: replace placeholder
    console.log('Sending tokens')
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 3500)
    })
  }
}

const client = new WalletClient()

export default client
