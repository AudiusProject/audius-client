/**
 * This is a modified version of configureLocalEnv.js, to enable running dapp on a remote host.
 * It allows you to interact with dapp from local browser by configuring env to point to services on a remote host.
 * This script requires AUDIUS_REMOTE_DEV_HOST envvar to point to ip address of remote host
 */

const AUDIUS_CONFIG = '.audius/config.json'
const AUDIUS_ETH_CONFIG = '.audius/eth-config.json'

const fs = require('fs')
const path = require('path')
const homeDir = require('os').homedir()

const REMOTE_DEV_HOST = process.env.AUDIUS_REMOTE_DEV_HOST
if (!REMOTE_DEV_HOST) {
  throw new Error('Misconfigured local env. Ensure AUDIUS_REMOTE_DEV_HOST envvar has been exported.')
}

try {
  const configFile = require(path.join(homeDir, AUDIUS_CONFIG))
  const ethConfigFile = require(path.join(homeDir, AUDIUS_ETH_CONFIG))

  const REACT_APP_ENVIRONMENT = 'development'
  const REACT_APP_DISCOVERY_PROVIDER_FALLBACKS =
    'http://audius-disc-prov_web-server_1:5000'
  const REACT_APP_IDENTITY_SERVICE = `http://${REMOTE_DEV_HOST}:7000`
  const REACT_APP_USER_NODE = 'http://cn1_creator-node_1:4000'

  const REACT_APP_REGISTRY_ADDRESS = configFile.registryAddress
  const REACT_APP_WEB3_PROVIDER_URLS =
    `http://${REMOTE_DEV_HOST}:8545,http://${REMOTE_DEV_HOST}:8545`

  const REACT_APP_ETH_REGISTRY_ADDRESS = ethConfigFile.registryAddress
  const REACT_APP_ETH_PROVIDER_URL = `http://${REMOTE_DEV_HOST}:8546`
  const REACT_APP_ETH_TOKEN_ADDRESS = ethConfigFile.audiusTokenAddress
  const REACT_APP_ETH_OWNER_WALLET = ethConfigFile.ownerWallet

  const contents = `
  # DO NOT MODIFY. SEE /scripts/configureLocalEnv.js
  
  REACT_APP_ENVIRONMENT=${REACT_APP_ENVIRONMENT}
  
  REACT_APP_DISCOVERY_PROVIDER_FALLBACKS=${REACT_APP_DISCOVERY_PROVIDER_FALLBACKS}
  REACT_APP_IDENTITY_SERVICE=${REACT_APP_IDENTITY_SERVICE}
  REACT_APP_USER_NODE=${REACT_APP_USER_NODE}
  
  REACT_APP_REGISTRY_ADDRESS=${REACT_APP_REGISTRY_ADDRESS}
  REACT_APP_WEB3_PROVIDER_URL=${REACT_APP_WEB3_PROVIDER_URLS}

  REACT_APP_ETH_REGISTRY_ADDRESS=${REACT_APP_ETH_REGISTRY_ADDRESS}
  REACT_APP_ETH_PROVIDER_URL=${REACT_APP_ETH_PROVIDER_URL}
  REACT_APP_ETH_TOKEN_ADDRESS=${REACT_APP_ETH_TOKEN_ADDRESS}
  REACT_APP_ETH_OWNER_WALLET=${REACT_APP_ETH_OWNER_WALLET}
  `

  // Note .env.development.local takes precidence over .env.development
  // https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables
  fs.writeFile('./.env.development.local', contents, err => {
    if (err) {
      console.error(err)
    }
    console.log('Configured .env.development.local')
  })
} catch (e) {
  console.error(`
    Did not find ~/${AUDIUS_CONFIG} configuration file.
    See https://github.com/AudiusProject/audius-e2e-tests to configure a local dev environment.
  `)
}
