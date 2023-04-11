import { Amplitude } from '@amplitude/react-native'
import Config from 'react-native-config'
import VersionNumber from 'react-native-version-number'

import { versionInfo } from 'app/utils/appVersionWithCodepush'

import type { Track, Screen, AllEvents } from '../types/analytics'
import { EventNames } from '../types/analytics'

let analyticsSetupStatus: 'ready' | 'pending' | 'error' = 'pending'

const AmplitudeWriteKey = Config.AMPLITUDE_WRITE_KEY
const AmplitudeProxy = Config.AMPLITUDE_PROXY
const amplitudeInstance = Amplitude.getInstance()

export const init = async () => {
  try {
    if (AmplitudeWriteKey && AmplitudeProxy) {
      await amplitudeInstance.setServerUrl(AmplitudeProxy)
      await amplitudeInstance.init(AmplitudeWriteKey)
      analyticsSetupStatus = 'ready'
    } else {
      analyticsSetupStatus = 'error'
      console.error(
        'Analytics unable to setup: missing amplitude write key or proxy url'
      )
    }
  } catch (err) {
    analyticsSetupStatus = 'error'
    console.error(`Amplitude error: ${err}`)
  }
}

const isAudiusSetup = async () => {
  if (analyticsSetupStatus === 'pending') {
    const ready = await new Promise((resolve, reject) => {
      const checkStatusInterval = setInterval(() => {
        if (analyticsSetupStatus === 'pending') return
        clearInterval(checkStatusInterval)
        if (analyticsSetupStatus === 'ready') resolve(true)
        resolve(false)
      }, 500)
    })
    return ready
  } else if (analyticsSetupStatus === 'ready') return true
  else {
    return false
  }
}

export const make = (event: AllEvents) => {
  const { eventName, ...props } = event
  return {
    eventName,
    properties: props as any
  }
}

// Identify User
// Docs: https://segment.com/docs/connections/spec/identify
export const identify = async (
  handle: string,
  traits: Record<string, any> = {}
) => {
  const isSetup = await isAudiusSetup()
  if (!isSetup) return
  amplitudeInstance.setUserId(handle)
  amplitudeInstance.setUserProperties(traits)
}

// Track Event
// Docs: https://segment.com/docs/connections/spec/track/
export const track = async ({ eventName, properties }: Track) => {
  const isSetup = await isAudiusSetup()
  if (!isSetup) return
  const version = VersionNumber.appVersion
  const propertiesWithContext = {
    ...properties,
    mobileClientVersion: version,
    mobileClientVersionInclOTA: versionInfo ?? 'unknown'
  }
  amplitudeInstance.logEvent(eventName, propertiesWithContext)
}

// Screen Event
// Docs: https://segment.com/docs/connections/sources/catalog/libraries/mobile/react-native/#screen
export const screen = async ({ route, properties = {} }: Screen) => {
  const isSetup = await isAudiusSetup()
  if (!isSetup) return
  amplitudeInstance.logEvent(EventNames.PAGE_VIEW, { route, ...properties })
}
