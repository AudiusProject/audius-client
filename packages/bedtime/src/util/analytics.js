import amplitude from 'amplitude-js'

import { getAmplitudeAPIKey, getAmplitudeProxy } from './getEnv'

const AMP_API_KEY = getAmplitudeAPIKey()
const AMP_PROXY = getAmplitudeProxy()

export const initTrackSessionStart = async () => {
  try {
    if (AMP_API_KEY && AMP_PROXY) {
      const SESSION_START = 'Session Start'
      const SOURCE = 'embed player'
      const amplitudeInstance = amplitude
        .getInstance()
      const res = amplitudeInstance.init(AMP_API_KEY, undefined, { apiEndpoint: AMP_PROXY })
  
      amplitudeInstance
        .logEvent(
          SESSION_START,
          { source: SOURCE, referrer: document.referrer }
        )  
    }
  } catch (err) {
    console.error(err)
  }
}
