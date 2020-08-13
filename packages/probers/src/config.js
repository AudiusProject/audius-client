import args from './args'

// Generic config applies to all environments
const genericConfig = {
  defaultTestTimeout: 2 /* min */ * 60 /* sec */ * 1000 /* ms */
}

export const config = {
  staging: {
    ...genericConfig,
    baseUrl: 'https://staging.audius.co'
  },
  local: {
    ...genericConfig,
    baseUrl: 'http://localhost:3001'
  }
}

export default function getCofig (env = 'local') {
  let c = config[env]
  if (args.endpoint) {
    c.baseUrl = args.endpoint
  }
  return c
}
