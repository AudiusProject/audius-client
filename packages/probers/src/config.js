export const config = {
  staging: {
    baseUrl: "https://app.staging.audius.co"
  },
  local: {
    baseUrl: "http://localhost:3000"
  }
}


export default function getCofig (env = 'local') {
  return config[env]
}