const AUDIUS_CONFIG = '.audius/config.json'
const AUDIUS_SOL_CONFIG = '.audius/solana-program-config.json'
const AUDIUS_ETH_CONFIG = '.audius/eth-config.json'

const fs = require('fs')
const path = require('path')
const homeDir = require('os').homedir()

let HOST = 'localhost'
if (process.argv[2] && process.argv[2] === '--remote-host') {
  HOST = process.env.AUDIUS_REMOTE_DEV_HOST
  if (!HOST) {
    throw new Error(
      'Misconfigured local env. Ensure AUDIUS_REMOTE_DEV_HOST envvar has been exported.'
    )
  }
}

/*
REACT_APP_SOLANA_FEE_PAYER_ADDRESS
REACT_APP_CLAIMABLE_TOKEN_PDA
*/

try {
  const configFile = require(path.join(homeDir, AUDIUS_CONFIG))
  const ethConfigFile = require(path.join(homeDir, AUDIUS_ETH_CONFIG))
  const solConfigFile = require(path.join(homeDir, AUDIUS_SOL_CONFIG))

  const REACT_APP_ENVIRONMENT = 'development'
  const REACT_APP_EAGER_DISCOVERY_NODES =
    'http://audius-disc-prov_web-server_1:5000'
  const REACT_APP_IDENTITY_SERVICE = `http://${HOST}:7000`
  const REACT_APP_USER_NODE = 'http://cn-um_creator-node_1:4099'

  const REACT_APP_REGISTRY_ADDRESS = configFile.registryAddress
  const REACT_APP_WEB3_PROVIDER_URLS = `http://${HOST}:8545,http://${HOST}:8545`

  const REACT_APP_ETH_REGISTRY_ADDRESS = ethConfigFile.registryAddress
  const REACT_APP_ETH_PROVIDER_URL = `http://${HOST}:8546`
  const REACT_APP_ETH_TOKEN_ADDRESS = ethConfigFile.audiusTokenAddress
  const REACT_APP_ETH_OWNER_WALLET = ethConfigFile.ownerWallet

  const REACT_APP_CLAIMABLE_TOKEN_PROGRAM_ADDRESS =
    solConfigFile.claimableTokenAddress
  const REACT_APP_SOLANA_TOKEN_PROGRAM_ADDRESS =
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  const REACT_APP_SOLANA_CLUSTER_ENDPOINT = solConfigFile.endpoint
  const REACT_APP_WAUDIO_MINT_ADDRESS = solConfigFile.splToken
  const REACT_APP_SOLANA_FEE_PAYER_ADDRESS = solConfigFile.feePayerWalletPubkey

  const REACT_APP_RECAPTCHA_SITE_KEY =
    '6LfVR-0ZAAAAADFcqNM1P1IafKwQwN0E_l-gxQ9q'

  const REACT_APP_OPENSEA_API_URL = 'https://rinkeby-api.opensea.io/api/v1'
  const REACT_APP_CLAIMABLE_TOKEN_PDA='3owhanvjrWBSkDRCe9xDq7AoSaVn4b7fvKYJHfpa6noB'

  const contents = `
  # DO NOT MODIFY. SEE /scripts/configureLocalEnv.js

  REACT_APP_ENVIRONMENT=${REACT_APP_ENVIRONMENT}

  REACT_APP_EAGER_DISCOVERY_NODES=${REACT_APP_EAGER_DISCOVERY_NODES}
  REACT_APP_IDENTITY_SERVICE=${REACT_APP_IDENTITY_SERVICE}
  REACT_APP_USER_NODE=${REACT_APP_USER_NODE}

  REACT_APP_REGISTRY_ADDRESS=${REACT_APP_REGISTRY_ADDRESS}
  REACT_APP_WEB3_PROVIDER_URL=${REACT_APP_WEB3_PROVIDER_URLS}

  REACT_APP_ETH_REGISTRY_ADDRESS=${REACT_APP_ETH_REGISTRY_ADDRESS}
  REACT_APP_ETH_PROVIDER_URL=${REACT_APP_ETH_PROVIDER_URL}
  REACT_APP_ETH_TOKEN_ADDRESS=${REACT_APP_ETH_TOKEN_ADDRESS}
  REACT_APP_ETH_OWNER_WALLET=${REACT_APP_ETH_OWNER_WALLET}

  REACT_APP_RECAPTCHA_SITE_KEY=${REACT_APP_RECAPTCHA_SITE_KEY}

  REACT_APP_OPENSEA_API_URL=${REACT_APP_OPENSEA_API_URL}
  REACT_APP_CLAIMABLE_TOKEN_PROGRAM_ADDRESS=${REACT_APP_CLAIMABLE_TOKEN_PROGRAM_ADDRESS}
  REACT_APP_SOLANA_TOKEN_PROGRAM_ADDRESS=${REACT_APP_SOLANA_TOKEN_PROGRAM_ADDRESS}
  REACT_APP_SOLANA_CLUSTER_ENDPOINT=${REACT_APP_SOLANA_CLUSTER_ENDPOINT}
  REACT_APP_WAUDIO_MINT_ADDRESS=${REACT_APP_WAUDIO_MINT_ADDRESS}
  REACT_APP_SOLANA_FEE_PAYER_ADDRESS=${REACT_APP_SOLANA_FEE_PAYER_ADDRESS}
  REACT_APP_CLAIMABLE_TOKEN_PDA=${REACT_APP_CLAIMABLE_TOKEN_PDA}
  REACT_APP_B_ITEMS_URL=
  `

  // Note .env.dev.local takes precidence over .env.dev
  // https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables
  fs.writeFile('./.env/.env.dev.local', contents, err => {
    if (err) {
      console.error(err)
    }
    console.log('Configured .env.dev.local')
  })
} catch (e) {
  console.log(`Error configuring local env: ${e}`)
  console.error(`
    Did not find ~/${AUDIUS_CONFIG} configuration file.
    See https://github.com/AudiusProject/audius-e2e-tests to configure a local dev environment.
  `)
}
