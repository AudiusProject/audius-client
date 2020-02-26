const OPEN = 'Embed: Open Player'
const ERROR = 'Embed: Player Error'
const PLAYBACK_PLAY = 'Playback: Play'
const PLAYBACK_PAUSE = 'Playback: Pause'

const track = (event, properties) => {
  if (window.analytics) {
    window.analytics.track(event, properties)
  }
}

export const recordOpen = () => {
  track(OPEN)
}

export const recordError = () => {
  track(ERROR)
}

export const recordPlay = (id) => {
  track(PLAYBACK_PLAY, { id: `${id}`, source: 'embed player' })
}

export const recordPause = (id) => {
  track(PLAYBACK_PAUSE, { id: `${id}`, source: 'embed player' })
}
