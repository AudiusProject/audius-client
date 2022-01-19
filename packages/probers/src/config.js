import args from './args'

// Generic config applies to all environments
const genericConfig = {
  tenSeconds: 10 /* sec */ * 1000 /* ms */,
  playlistRoute: 'df/playlist/probers_playlist_do_not_delete-511',
  trackRoute: 'df/probers_track_do_not_delete-2851',
  albumRoute: 'df/album/probers_album_do_not_delete-512',
  remixRoute: 'df/probers_remix_do_not_delete-2859',
  remixesRoute: 'chrisyu321/happy-buddy-987/remixes'
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

export default function getConfig (env = 'local') {
  let c = config[env]
  if (args.endpoint) {
    c.baseUrl = args.endpoint
  }
  if (process.env.endpoint) {
    c.baseUrl = process.env.endpoint
  }
  return c
}
