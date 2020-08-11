import args from './args'

export const config = {
  staging: {
    baseUrl: 'https://staging.audius.co'
  },
  local: {
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
