import {
  audioToWei,
  BNWei,
  StringAudio,
  WalletAddress
} from 'store/wallet/slice'

class WalletClient {
  init() {}

  async getCurrentBalance(): Promise<BNWei> {
    // TODO: replace placeholder
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(audioToWei('100000' as StringAudio))
      }, 1500)
    })
  }

  async getClaimableBalance(): Promise<BNWei> {
    // TODO: replace placeholder
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(audioToWei('1000' as StringAudio))
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

  async sendTokens(address: WalletAddress, amount: BNWei): Promise<void> {
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
