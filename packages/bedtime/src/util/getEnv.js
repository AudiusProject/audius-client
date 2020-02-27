const env = Object.seal({
  PRODUCTION: 'PRODUCTION',
  STAGING: 'STAGING',
  DEVELOPMENT: 'DEVELOPMENT'
})

const PROD_HOSTNAME = "audius.co"
const STAGING_GA = "general-admission.staging.audius.co"
const STAGING_HOSTNAME = "staging.audius.co"
const LOCALHOST = "localhost"

const envHostnameMap = {
  [PROD_HOSTNAME]: env.PRODUCTION,
  [STAGING_HOSTNAME]: env.STAGING,
  [LOCALHOST]: env.DEVELOPMENT
}

const getEnv = () => {
  const hostname = window.location.hostname
  return envHostnameMap[hostname]
}

export const getIdentityEndpoint = () => {
  const env = getEnv()
  switch (env) {
    case env.PRODUCTION:
      return process.env.PREACT_APP_IDENTITY_ENDPOINT_PROD
    case env.STAGING:
    case env.DEVELOPMENT:
    default:
      return process.env.PREACT_APP_IDENTITY_ENDPOINT_STAGE
  }
}

export const getCreatorNodeWhitelist = () => {
  const env = getEnv()
  switch (env) {
    case env.PRODUCTION:
      return process.env.PREACT_APP_CREATOR_NODE_WHITELIST_PROD
    case env.STAGING:
    case env.DEVELOPMENT:
    default:
      return process.env.PREACT_APP_CREATOR_NODE_WHITELIST_STAGE
  }
}

// Need some way to run against GA locally
export const getAPIHostname = () => {
  const localGAPort = process.env.PREACT_APP_LOCAL_GA_PORT
  if (localGAPort) {
    return `http://localhost:${localGAPort}`
  }

  const env = getEnv()
  switch (env) {
    case env.PRODUCTION:
      return window.location.hostname
    case env.STAGING:
    case env.DEVELOPMENT:
    default:
      return STAGING_GA
  }
}

export const getAudiusHostname = () => {
  const env = getEnv()
  switch (env) {
    case env.PRODUCTION:
      return PROD_HOSTNAME
    case env.DEVELOPMENT:
    case env.STAGING:
    default:
      return STAGING_HOSTNAME
  }
}

export const getScriptDirectory = () => {
  const env = getEnv()
  switch (env) {
    case env.PRODUCTION:
    case env.STAGING:
      return process.env.PREACT_APP_SCRIPT_DIRECTORY
    case env.DEVELOPMENT:
    default:
      return process.env.PREACT_APP_SCRIPT_DIRECTORY_DEV
  }
}