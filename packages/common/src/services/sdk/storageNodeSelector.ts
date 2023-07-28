import type { Auth, StorageNodeSelectorService } from '@audius/sdk'
import { StorageNodeSelector, Logger } from '@audius/sdk'

import { Maybe } from 'utils/typeUtils'

import { Env } from '../env'

import { getBootstrapNodes } from './bootstrapNodes'
import { DiscoveryNodeSelectorService } from './discovery-node-selector'

const logger = new Logger()

let storageNodeSelectorPromise: Maybe<Promise<StorageNodeSelectorService>>

type StorageNodeSelectorConfig = {
  auth: Auth
  discoveryNodeSelectorService: DiscoveryNodeSelectorService
  env: Env
}

const makeStorageNodeSelector = async (config: StorageNodeSelectorConfig) => {
  const { discoveryNodeSelectorService, auth, env } = config
  const discoveryNodeSelector = await discoveryNodeSelectorService.getInstance()
  return new StorageNodeSelector({
    auth,
    discoveryNodeSelector,
    bootstrapNodes: getBootstrapNodes(env),
    logger
  })
}

export const makeGetStorageNodeSelector = (
  config: StorageNodeSelectorConfig
) => {
  return async function getStorageNodeSelector() {
    if (!storageNodeSelectorPromise) {
      storageNodeSelectorPromise = makeStorageNodeSelector(config)
    }
    return await storageNodeSelectorPromise
  }
}
