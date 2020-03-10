const SOURCE = 'embed player'

const OPEN = 'Embed: Open Player'
const ERROR = 'Embed: Player Error'
const PLAYBACK_PLAY = 'Playback: Play'
const PLAYBACK_PAUSE = 'Playback: Pause'

const track = (event, properties) => {
  if (window.analytics) {
    window.analytics.track(event, properties)
  }
}

export const recordOpen = (id, title, handle, path) => {
  track(
    OPEN,
    { id: `${id}`, handle, title, path, referrer: document.referrer }
  )
}

export const recordError = () => {
  track(ERROR, { referrer: document.referrer })
}

export const recordPlay = (id) => {
  track(
    PLAYBACK_PLAY,
    { id: `${id}`, source: SOURCE, referrer: document.referrer }
  )
}

export const recordPause = (id) => {
  track(
    PLAYBACK_PAUSE,
    { id: `${id}`, source: SOURCE, referrer: document.referrer }
  )
}
