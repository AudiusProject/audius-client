import args from './args'

export const config = {
  staging: {
    baseUrl: 'https://app.staging.audius.co'
  },
  local: {
    baseUrl: 'http://localhost:3000'
  }
}

export default function getCofig (env = 'local') {
  let c = config[env]
  if (args.endpoint) {
    c.baseUrl = args.endpoint
  }
  return c
}
