import {
  audioToWei,
  BNWei,
  StringAudio,
  StringWei,
  stringWeiToBN,
  WalletAddress
} from 'store/wallet/slice'

// 0.001 Audio
export const MIN_TRANSFERRABLE_WEI = stringWeiToBN(
  '1000000000000000' as StringWei
)

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
    if (amount.lt(MIN_TRANSFERRABLE_WEI)) {
      throw new Error('Insufficient Audio to transfer')
    }
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 3500)
    })
  }
}

const client = new WalletClient()

export default client
