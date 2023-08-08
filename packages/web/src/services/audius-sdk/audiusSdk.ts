import { sdk, AudiusSdk, AudiusLibs } from '@audius/sdk'

import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'
import { discoveryNodeSelectorService } from 'services/audius-sdk/discoveryNodeSelector'
import { getStorageNodeSelector } from 'services/audius-sdk/storageNodeSelector'
import { makeEntityManagerInstance } from 'services/entity-manager'

import { auth } from './auth'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'
import { BooleanKeys } from '@audius/common/dist/services/remote-config/types'
import { getFeatureEnabled } from 'services/remote-config/featureFlagHelpers'
import { FeatureFlags } from '@audius/common'

declare global {
  interface Window {
    audiusLibs: AudiusLibs
    audiusSdk: AudiusSdk
  }
}

let inProgress = false
const SDK_LOADED_EVENT_NAME = 'AUDIUS_SDK_LOADED'

const initSdk = async () => {
  inProgress = true
  // We wait for libs here because AudiusBackend needs to register a listener that
  // will let AudiusAPIClient know that libs has loaded, and without it AudiusAPIClient
  // retries failed requests ad nauseum with no delays or backoffs and won't ever get
  // the signal that libs is loaded. It sucks. But the easiest thing to do right now...
  console.debug('[audiusSdk] Waiting for libs init...')
  await waitForLibsInit()
  console.debug('[audiusSdk] Libs initted, initializing SDK...')
  const discoveryNodeSelector = await discoveryNodeSelectorService.getInstance()
  console.debug('[audiusSdk] Waiting for remoteConfig init...')
  await remoteConfigInstance.waitForRemoteConfig()
  const networkUseDiscoveryRelay = remoteConfigInstance.getRemoteVar(
    BooleanKeys.USE_DISCOVERY_RELAY
  ) ?? false
  const userUseDiscoveryRelay = getFeatureEnabled(FeatureFlags.DISCOVERY_RELAY)
  console.debug(`[audiusSdk] Discovery relay for network ${networkUseDiscoveryRelay} and user ${userUseDiscoveryRelay}`)
  const useDiscoveryRelay = networkUseDiscoveryRelay || userUseDiscoveryRelay
  const audiusSdk = sdk({
    appName: 'audius-client',
    services: {
      discoveryNodeSelector,
      entityManager: makeEntityManagerInstance(discoveryNodeSelector, useDiscoveryRelay),
      auth,
      storageNodeSelector: await getStorageNodeSelector()
    }
  })
  console.debug('[audiusSdk] SDK initted.')
  window.audiusSdk = audiusSdk
  inProgress = false
  window.dispatchEvent(new CustomEvent(SDK_LOADED_EVENT_NAME))
  return audiusSdk
}

export const audiusSdk = async () => {
  if (inProgress) {
    await new Promise((resolve) => {
      window.addEventListener(SDK_LOADED_EVENT_NAME, resolve)
    })
  } else if (!window.audiusSdk) {
    return await initSdk()
  }
  return window.audiusSdk
}
