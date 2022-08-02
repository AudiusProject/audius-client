import { audiusBackend } from 'services/AudiusBackend'
import { LIBS_INITTED_EVENT } from 'services/audius-backend/eagerLoadUtils'
import { Name } from '@audius/common'

import { track } from 'store/analytics/providers'
import { Recording } from 'utils/performance'

export const audiusBackendInstance = audiusBackend({
  identityServiceUrl: process.env.REACT_APP_IDENTITY_SERVICE,
  userNodeUrl: process.env.REACT_APP_USER_NODE,
  legacyUserNodeUrl: process.env.REACT_APP_LEGACY_USER_NODE,

  registryAddress: process.env.REACT_APP_REGISTRY_ADDRESS,
  web3ProviderUrls: (process.env.REACT_APP_WEB3_PROVIDER_URL || '').split(','),

  web3NetworkId: process.env.REACT_APP_WEB3_NETWORK_ID,

  ethRegistryAddress: process.env.REACT_APP_ETH_REGISTRY_ADDRESS,
  ethTokenAddress: process.env.REACT_APP_ETH_TOKEN_ADDRESS,
  ethOwnerWallet: process.env.REACT_APP_ETH_OWNER_WALLET,
  ethProviderUrls: (process.env.REACT_APP_ETH_PROVIDER_URL || '').split(','),
  claimDistributionContractAddress:
    process.env.REACT_APP_CLAIM_DISTRIBUTION_CONTRACT_ADDRESS,

  solanaConfig: {
    solanaClusterEndpoint: process.env.REACT_APP_SOLANA_CLUSTER_ENDPOINT,
    waudioMintAddress: process.env.REACT_APP_WAUDIO_MINT_ADDRESS,
    solanaTokenAddress: process.env.REACT_APP_SOLANA_TOKEN_PROGRAM_ADDRESS,
    claimableTokenPda: process.env.REACT_APP_CLAIMABLE_TOKEN_PDA,
    solanaFeePayerAddress: process.env.REACT_APP_SOLANA_FEE_PAYER_ADDRESS,

    claimableTokenProgramAddress:
      process.env.REACT_APP_CLAIMABLE_TOKEN_PROGRAM_ADDRESS,
    wormholeAddress: process.env.REACT_APP_WORMHOLE_ADDRESS,
    rewardsManagerProgramId: process.env.REACT_APP_REWARDS_MANAGER_PROGRAM_ID,
    rewardsManagerProgramPda: process.env.REACT_APP_REWARDS_MANAGER_PROGRAM_PDA,
    rewardsManagerTokenPda: process.env.REACT_APP_REWARDS_MANAGER_TOKEN_PDA,
    anchorProgramId: process.env.REACT_APP_ANCHOR_PROGRAM_ID,
    anchorAdminAccount: process.env.REACT_APP_ANCHOR_ADMIN_ACCOUNT
  },

  wormholeConfig: {
    wormholeRpcHosts: process.env.REACT_APP_WORMHOLE_RPC_HOSTS,
    ethBridgeAddress: process.env.REACT_APP_ETH_BRIDGE_ADDRESS,
    solBridgeAddress: process.env.REACT_APP_SOL_BRIDGE_ADDRESS,
    ethTokenBridgeAddress: process.env.REACT_APP_ETH_TOKEN_BRIDGE_ADDRESS,
    solTokenBridgeAddress: process.env.REACT_APP_SOL_TOKEN_BRIDGE_ADDRESS
  },
  recaptchaSiteKey: process.env.REACT_APP_RECAPTCHA_SITE_KEY,
  nativeMobile: process.env.REACT_APP_NATIVE_MOBILE === 'true',
  audiusOrigin: `${process.env.REACT_APP_PUBLIC_PROTOCOL}//${process.env.REACT_APP_PUBLIC_HOSTNAME}`,

  waitForWeb3: async () => {
    if (!window.web3Loaded) {
      await new Promise<void>((resolve) => {
        const onLoad = () => {
          window.removeEventListener('WEB3_LOADED', onLoad)
          resolve()
        }
        window.addEventListener('WEB3_LOADED', onLoad)
      })
    }
  },
  onLibsInit: (libs: any) => {
    window.audiusLibs = libs
    const event = new CustomEvent(LIBS_INITTED_EVENT)
    window.dispatchEvent(event)
  },
  getWeb3Config: async (
    libs,
    registryAddress,
    web3ProviderUrls,
    web3NetworkId
  ) => {
    const useMetaMaskSerialized = localStorage.getItem('useMetaMask')
    const useMetaMask = useMetaMaskSerialized
      ? JSON.parse(useMetaMaskSerialized)
      : false

    if (useMetaMask && window.web3) {
      try {
        return {
          error: false,
          web3Config: await libs.configExternalWeb3(
            registryAddress,
            window.web3.currentProvider,
            web3NetworkId
          )
        }
      } catch (e) {
        return {
          error: true,
          web3Config: libs.configInternalWeb3(registryAddress, web3ProviderUrls)
        }
      }
    }
    return {
      error: false,
      web3Config: libs.configInternalWeb3(registryAddress, web3ProviderUrls)
    }
  },
  setLocalStorageItem: async (key, value) =>
    window.localStorage.setItem(key, value),
  recordPerformance: ({ name, duration }: Recording) => {
    console.info(`Recorded event ${name} with duration ${duration}`)
    track(Name.PERFORMANCE, {
      metric: name,
      value: duration
    })
  }
})
