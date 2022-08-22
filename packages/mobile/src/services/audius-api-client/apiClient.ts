import { AudiusAPIClient } from '@audius/common'

import { audiusBackendInstance, audiusLibs } from '../audius-backend-instance'
import { env } from '../env'
import { localStorage } from '../local-storage'
import { remoteConfigInstance } from '../remote-config'

export const apiClient = new AudiusAPIClient({
  audiusBackendInstance,
  remoteConfigInstance,
  audiusLibs,
  localStorage,
  env
})
