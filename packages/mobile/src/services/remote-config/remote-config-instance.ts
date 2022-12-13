import type { Environment } from '@audius/common'
import { remoteConfig } from '@audius/common'
import * as optimizely from '@optimizely/optimizely-sdk'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Config from 'react-native-config'

export const FEATURE_FLAG_ASYNC_STORAGE_SESSION_KEY = 'featureFlagSessionId-2'

const OPTIMIZELY_KEY = Config.OPTIMIZELY_KEY
const DATA_FILE_URL = 'https://experiments.audius.co/datafiles/%s.json'

export const remoteConfigInstance = remoteConfig({
  createOptimizelyClient: async () => {
    return optimizely.createInstance({
      sdkKey: OPTIMIZELY_KEY,
      datafileOptions: {
        urlTemplate: DATA_FILE_URL
      }
    })
  },
  getFeatureFlagSessionId: async () => {
    const sessionId = await AsyncStorage.getItem(
      FEATURE_FLAG_ASYNC_STORAGE_SESSION_KEY
    )
    return sessionId ? parseInt(sessionId) : null
  },
  setFeatureFlagSessionId: async (id) =>
    AsyncStorage.setItem(FEATURE_FLAG_ASYNC_STORAGE_SESSION_KEY, id.toString()),
  setLogLevel: () => optimizely.setLogLevel('warn'),
  environment: Config.ENVIRONMENT as Environment
})

remoteConfigInstance.init()
