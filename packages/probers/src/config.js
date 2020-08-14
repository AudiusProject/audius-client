import args from './args'

// Generic config applies to all environments
const genericConfig = {
  defaultTestTimeout: 2 /* min */ * 60 /* sec */ * 1000 /* ms */,
  fiveSeconds: 5 /* sec */ * 1000 /* ms */,
  tenSeconds: 10 /* sec */ * 1000 /* ms */
}

export const config = {
  staging: {
    ...genericConfig,
    baseUrl: 'https://staging.audius.co',
    playlistUrl: 'https://staging.audius.co/df/playlist/probers_playlist_do_not_delete-511',
    trackUrl: 'https://staging.audius.co/df/probers_track_do_not_delete-2851'
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
