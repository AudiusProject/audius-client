import { FingerprintClient } from '@audius/common'
import Config from 'react-native-config'

const apiKey = Config.FINGERPRINT_PUBLIC_API_KEY || ''
const endpoint = Config.FINGERPRINT_ENDPOINT || ''
const identityService = Config.IDENTITY_SERVICE || ''

export const fingerprintClient = new FingerprintClient({
  apiKey,
  endpoint,
  identityService
})
