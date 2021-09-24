const Environment = Object.seal({
  PRODUCTION: 'PRODUCTION',
  STAGING: 'STAGING',
  DEVELOPMENT: 'DEVELOPMENT'
})

const PROD_HOSTNAME = "audius.co"
const PROD_GA_HOSTNAME = "audius.co"
const PROD_HOSTNAME_REDIRECT = "redirect.audius.co"
const STAGING_HOSTNAME = "staging.audius.co"
const STAGING_GA_HOSTNAME = "staging.audius.co"
const STAGING_HOSTNAME_REDIRECT = "redirect.staging.audius.co"
const LOCALHOST = "localhost"

const envHostnameMap = {
  [PROD_HOSTNAME]: Environment.PRODUCTION,
  [PROD_GA_HOSTNAME]: Environment.PRODUCTION,
  [STAGING_HOSTNAME]: Environment.STAGING,
  [STAGING_GA_HOSTNAME]: Environment.STAGING,
  [LOCALHOST]: Environment.DEVELOPMENT
}

const getEnv = () => {
  // Determine what env we are in at runtime by checking window.location
  const hostname = window.location.hostname
  return envHostnameMap[hostname]
}

export const getIdentityEndpoint = () => {
  const env = getEnv()
  switch (env) {
    case Environment.PRODUCTION:
      return process.env.PREACT_APP_IDENTITY_ENDPOINT_PROD
    case Environment.STAGING:
    case Environment.DEVELOPMENT:
    default:
      return process.env.PREACT_APP_IDENTITY_ENDPOINT_STAGE
  }
}

export const getCreatorNodeWhitelist = () => {
  const env = getEnv()
  switch (env) {
    case Environment.PRODUCTION:
      return process.env.PREACT_APP_CREATOR_NODE_WHITELIST_PROD
    case Environment.STAGING:
    case Environment.DEVELOPMENT:
    default:
      return process.env.PREACT_APP_CREATOR_NODE_WHITELIST_STAGE
  }
}

// Need some way to run against GA locally
export const getAPIHostname = () => {
  const localGAPort = process.env.PREACT_APP_LOCAL_GA_PORT
  if (localGAPort) {
    return `localhost:${localGAPort}`
  }

  // Switch on the current env and determine where to send API
  // requests.
  const env = getEnv()
  switch (env) {
    case Environment.PRODUCTION:
      return PROD_GA_HOSTNAME
    case Environment.STAGING:
    case Environment.DEVELOPMENT:
      return STAGING_GA_HOSTNAME
    default:
      // There shouldn't be a case where we hit default,
      // but err on the side of caution and use prod
      return PROD_GA_HOSTNAME
  }
}

export const getAudiusHostname = () => {
  const env = getEnv()
  switch (env) {
    case Environment.PRODUCTION:
      return PROD_HOSTNAME_REDIRECT
    case Environment.DEVELOPMENT:
    case Environment.STAGING:
    default:
      return STAGING_HOSTNAME_REDIRECT
  }
}
