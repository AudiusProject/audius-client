import type { Agent } from '@fingerprintjs/fingerprintjs-pro'

type FingerprintClientConfig = {
  apiKey: string
  endpoint: string
  identityService: string
  initFingerprint: (apiKey: string, endpoint: string) => any
  getFingerprint: (linkedId: string, tag: any) => any
}

export class FingerprintClient {
  private apiKey: string
  private fingerprint: Agent | null
  private endpoint: string
  private identityService: string
  private initFingerprint: (apiKey: string, endpoint: string) => any
  private getFingerprint: (
    client: any,
    options: { linkedId: string; tag: any }
  ) => Promise<any>

  constructor(config: FingerprintClientConfig) {
    const {
      apiKey,
      endpoint,
      identityService,
      initFingerprint,
      getFingerprint
    } = config
    this.apiKey = apiKey
    this.fingerprint = null
    this.endpoint = endpoint
    this.identityService = identityService
    this.initFingerprint = initFingerprint
    this.getFingerprint = getFingerprint
  }

  async init() {
    console.log('Initializing Fingerprint client')
    try {
      const fp = await this.initFingerprint(this.apiKey, this.endpoint)
      console.log(`Fingerprint loaded`)
      this.fingerprint = fp
    } catch (e) {
      console.error(`Error initializing fingerprint client: ${e}`)
    }
  }

  async identify(userId: number, clientOrigin: 'desktop' | 'mobile' | 'web') {
    if (!this.fingerprint) {
      console.warn('Fingerprint client not yet initted')
      return
    }
    try {
      // First, see if we've fingerprinted this user before
      const response = await fetch(
        `${this.identityService}/fp?userId=${userId}&origin=${clientOrigin}`
      )

      if (response.status !== 200) {
        console.error(
          `Got status code ${response.status} from identity during fingerprint`
        )
        return
      }
      const { count } = await response.json()

      if (count >= 1) {
        console.log('Previously fingerprinted this user<>platform')
        return
      }

      // If we haven't, fingerprint 'em
      await this.getFingerprint(this.fingerprint, {
        linkedId: userId.toString(),
        tag: { origin: clientOrigin }
      })
      console.log('Fingerprint identify')
    } catch (e) {
      console.error(`Error identifying fingerprint client: ${e}`)
    }
  }
}
