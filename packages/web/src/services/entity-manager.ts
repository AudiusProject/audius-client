import {
  EntityManager,
  developmentConfig,
  productionConfig,
  stagingConfig
} from '@audius/sdk'

import { env } from './env'

const bootstrapConfig =
  env.ENVIRONMENT === 'development'
    ? developmentConfig
    : env.ENVIRONMENT === 'staging'
    ? stagingConfig
    : productionConfig

export const entityManagerInstance = new EntityManager({
  contractAddress: bootstrapConfig.entityManagerContractAddress,
  web3ProviderUrl: bootstrapConfig.web3ProviderUrl,
  identityServiceUrl: bootstrapConfig.identityServiceEndpoint
})
