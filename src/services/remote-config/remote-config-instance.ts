import optimizely from '@optimizely/optimizely-sdk'

import { remoteConfig } from 'common/services/remote-config/remote-config'

export const FEATURE_FLAG_LOCAL_STORAGE_SESSION_KEY = 'featureFlagSessionId'

export const remoteConfigInstance = remoteConfig({
  createOptimizelyClient: () =>
    optimizely.createInstance({
      // @ts-ignore: injected in index.html
      datafile: window.optimizelyDatafile
    }),
  getFeatureFlagSessionId: () =>
    window.localStorage?.getItem(FEATURE_FLAG_LOCAL_STORAGE_SESSION_KEY),
  setFeatureFlagSessionId: id =>
    window.localStorage?.setItem(FEATURE_FLAG_LOCAL_STORAGE_SESSION_KEY, id),
  setLogLevel: () => optimizely.setLogLevel('warn')
})
