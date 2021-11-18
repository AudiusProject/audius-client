// Amplitude Analytics
import { Nullable } from 'common/utils/typeUtils'
import {
  SetAnalyticsUser,
  TrackAnalyticsEvent
} from 'services/native-mobile-interface/analytics'

import { version } from '../../../../package.json'

const AMP_API_KEY = process.env.REACT_APP_AMPLITUDE_API_KEY
const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE
const IS_PRODUCTION_BUILD = process.env.NODE_ENV === 'production'

const TRACK_LIMIT = 10000
const AMPLITUDE_PROXY = 'metrics.audius.co'

/**
 * ========================= Amplitude Analytics =========================
 * Description:
 *  The Ampltude library
 *
 * Link for more info: https://amplitude.github.io/Amplitude-JavaScript/
 */
let amp: Nullable<any> = null
export const init = async () => {
  try {
    if (!amp && AMP_API_KEY) {
      const amplitude = await import('amplitude-js')
      amplitude
        .getInstance()
        .init(AMP_API_KEY, undefined, { apiEndpoint: AMPLITUDE_PROXY })
      amp = amplitude
    }
  } catch (err) {
    console.log(err)
  }
}

// Identify User
// Docs: https://developers.amplitude.com/docs/javascript#setting-user-id
export const identify = (
  handle: string,
  traits?: Record<string, any>,
  callback?: () => void
) => {
  if (!IS_PRODUCTION_BUILD) {
    console.info('Amplitude | identify', handle, traits)
  }
  if (NATIVE_MOBILE) {
    const message = new SetAnalyticsUser(handle, traits)
    message.send()
  } else {
    if (!amp) {
      if (callback) callback()
      return
    }
    amp.getInstance().setUserId(handle)
    if (traits && Object.keys(traits).length > 0) {
      amp.getInstance().setUserProperties(traits)
    }
    if (callback) callback()
  }
}

let trackCounter = 0

// Track Event
// Docs: https://developers.amplitude.com/docs/javascript#sending-events
export const track = (
  event: string,
  properties?: Record<string, any>,
  callback?: () => void
) => {
  if (!IS_PRODUCTION_BUILD) {
    console.info('Amplitude | track', event, properties)
  }
  // stop tracking analytics after we reach session limit
  if (trackCounter++ >= TRACK_LIMIT) return

  // Add generic track event context for every event
  const propertiesWithContext = {
    ...properties,
    clientVersion: version
  }

  if (NATIVE_MOBILE) {
    const message = new TrackAnalyticsEvent(event, propertiesWithContext)
    message.send()
  } else {
    if (!amp) {
      if (callback) callback()
      return
    }
    amp.getInstance().logEvent(event, propertiesWithContext)
  }
  console.log({ callback })
  if (callback) callback()
}
