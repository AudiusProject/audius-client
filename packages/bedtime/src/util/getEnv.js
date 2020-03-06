const Environment = Object.seal({
  PRODUCTION: 'PRODUCTION',
  STAGING: 'STAGING',
  DEVELOPMENT: 'DEVELOPMENT'
})

const PROD_HOSTNAME = "audius.co"
const PROD_HOSTNAME_REDIRECT = "redirect.audius.co"
const STAGING_HOSTNAME = "general-admission.staging.audius.co"
const STAGING_HOSTNAME_REDIRECT = "redirect.staging.audius.co"
const LOCALHOST = "localhost"

const envHostnameMap = {
  [PROD_HOSTNAME]: Environment.PRODUCTION,
  [STAGING_HOSTNAME]: Environment.STAGING,
  [LOCALHOST]: Environment.DEVELOPMENT
}

const getEnv = () => {
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
    return `http://localhost:${localGAPort}`
  }

  const env = getEnv()
  switch (env) {
    case Environment.PRODUCTION:
      return window.location.hostname
    case Environment.STAGING:
    case Environment.DEVELOPMENT:
    default:
      return STAGING_HOSTNAME
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
