import { isMobile, isElectron } from 'utils/clientUtil'

// TODO: make the sending attestation stuff fire-and-forget
export class ClientRewardsReporter {
  source: 'mobile' | 'electron' | 'web'
  libs: any

  constructor(libs: any) {
    this.source = isMobile() ? 'mobile' : isElectron() ? 'electron' : 'web'
    this.libs = libs
  }

  async reportSuccess({
    userId,
    challengeId,
    amount,
    specifier
  }: {
    userId: string
    challengeId: string
    amount: number
    specifier: string
  }) {
    try {
      await this.libs.Rewards.sendAttestationResult({
        status: 'success',
        userId,
        challengeId,
        amount,
        source: this.source,
        specifier
      })
    } catch (e) {
      console.log(`Report success failure: ${e}`)
    }
  }

  async reportFailure({
    userId,
    challengeId,
    amount,
    error,
    phase,
    specifier
  }: {
    userId: string
    challengeId: string
    amount: number
    error: string
    phase: string
    specifier: string
  }) {
    try {
      await this.libs.Rewards.sendAttestationResult({
        status: 'failure',
        userId,
        challengeId,
        amount,
        error,
        phase,
        source: this.source,
        specifier
      })
    } catch (e) {
      console.log(`Report failure failure: ${e}`)
    }
  }

  async reportAAORejection({
    userId,
    challengeId,
    amount,
    error,
    specifier
  }: {
    userId: string
    challengeId: string
    amount: number
    error: string
    specifier: string
  }) {
    try {
      await this.libs.Rewards.sendAttestationResult({
        status: 'rejection',
        userId,
        challengeId,
        amount,
        error,
        source: this.source,
        specifier
      })
    } catch (e) {
      console.log(`Report AAO rejection failure: ${e}`)
    }
  }
}
