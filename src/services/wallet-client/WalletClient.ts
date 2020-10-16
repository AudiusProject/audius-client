import {
  BNWei,
  StringWei,
  stringWeiToBN,
  WalletAddress
} from 'store/wallet/slice'
import AudiusBackend from 'services/AudiusBackend'
import BN from 'bn.js'

// 0.001 Audio
export const MIN_TRANSFERRABLE_WEI = stringWeiToBN(
  '1000000000000000' as StringWei
)

class WalletClient {
  init() {}

  async getCurrentBalance(): Promise<BNWei> {
    try {
      const balance = await AudiusBackend.getBalance()
      return balance as BNWei
    } catch (err) {
      console.log(err)
      return new BN('0') as BNWei
    }
  }

  async getClaimableBalance(): Promise<BNWei> {
    try {
      const hasClaimed = await AudiusBackend.getHasClaimed()
      if (hasClaimed) return new BN('0') as BNWei
      const claimAmount = await AudiusBackend.getClaimDistributionAmount()
      if (claimAmount) return claimAmount as BNWei
      return new BN('0') as BNWei
    } catch (err) {
      console.log(err)
      return new BN('0') as BNWei
    }
  }

  async claim(): Promise<void> {
    try {
      await AudiusBackend.makeDistributionClaim()
    } catch (err) {
      console.log(err)
    }
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
