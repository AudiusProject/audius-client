import {
  developmentConfig,
  DiscoveryNodeSelector,
  productionConfig,
  stagingConfig
} from '@audius/sdk'

import { Env } from '../env'
import type { CachedDiscoveryProviderType } from '../local-storage'
import {
  BooleanKeys,
  IntKeys,
  RemoteConfigInstance,
  StringKeys
} from '../remote-config'

type DiscoveryNodeSelectorConfig = {
  env: Env
  remoteConfigInstance: RemoteConfigInstance
  initialSelectedNode: Promise<CachedDiscoveryProviderType | null>
}

export class DiscoveryNodeSelectorInstance {
  private env: Env
  private remoteConfigInstance: RemoteConfigInstance
  private discoveryNodeSelectorPromise: Promise<DiscoveryNodeSelector> | null
  public initialSelectedNode: Promise<CachedDiscoveryProviderType | null>

  constructor(config: DiscoveryNodeSelectorConfig) {
    const { env, remoteConfigInstance, initialSelectedNode } = config
    this.env = env
    this.remoteConfigInstance = remoteConfigInstance
    this.discoveryNodeSelectorPromise = null
    this.initialSelectedNode = initialSelectedNode
  }

  private async makeDiscoveryNodeSelector() {
    const { getRemoteVar, waitForRemoteConfig } = this.remoteConfigInstance

    await waitForRemoteConfig()

    const bootstrapConfig =
      this.env.ENVIRONMENT === 'development'
        ? developmentConfig
        : this.env.ENVIRONMENT === 'staging'
        ? stagingConfig
        : productionConfig

    const { minVersion, discoveryNodes } = bootstrapConfig

    const maxBlockDiff =
      getRemoteVar(IntKeys.DISCOVERY_NODE_MAX_BLOCK_DIFF) ?? undefined
    const maxSlotDiffPlays = getRemoteVar(
      BooleanKeys.ENABLE_DISCOVERY_NODE_MAX_SLOT_DIFF_PLAYS
    )
      ? getRemoteVar(IntKeys.DISCOVERY_NODE_MAX_SLOT_DIFF_PLAYS)
      : null

    const healthCheckThresholds = { minVersion, maxBlockDiff, maxSlotDiffPlays }

    const blocklist = this.getBlockList(StringKeys.DISCOVERY_NODE_BLOCK_LIST)

    const requestTimeout =
      getRemoteVar(IntKeys.DISCOVERY_PROVIDER_SELECTION_TIMEOUT_MS) ?? undefined

    const initialSelectedNode = await this.initialSelectedNode

    return new DiscoveryNodeSelector({
      healthCheckThresholds,
      blocklist,
      requestTimeout,
      bootstrapServices: discoveryNodes,
      initialSelectedNode: initialSelectedNode?.endpoint
    })
  }

  private getBlockList(remoteVarKey: StringKeys) {
    const list = this.remoteConfigInstance.getRemoteVar(remoteVarKey)
    if (list) {
      try {
        return new Set<string>(list.split(','))
      } catch (e) {
        console.error(e)
        return null
      }
    }
    return null
  }

  public async getDiscoveryNodeSelector() {
    if (!this.discoveryNodeSelectorPromise) {
      this.discoveryNodeSelectorPromise = this.makeDiscoveryNodeSelector()
    }
    return await this.discoveryNodeSelectorPromise
  }
}
