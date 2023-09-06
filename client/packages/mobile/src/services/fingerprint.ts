import { FingerprintClient } from '@audius/common'
import { FingerprintJsProAgent } from '@fingerprintjs/fingerprintjs-pro-react-native'
import Config from 'react-native-config'

const apiKey = Config.FINGERPRINT_PUBLIC_API_KEY || ''
const endpoint = Config.FINGERPRINT_ENDPOINT || ''
const identityService = Config.IDENTITY_SERVICE || ''

export const fingerprintClient = new FingerprintClient<FingerprintJsProAgent>({
  apiKey,
  endpoint,
  identityService,
  initFingerprint: async (apiKey, endpoint) => {
    return new FingerprintJsProAgent(apiKey, undefined, endpoint)
  },
  getFingerprint: (client, { tag, linkedId }) => {
    return client.getVisitorId(tag, linkedId)
  }
})
