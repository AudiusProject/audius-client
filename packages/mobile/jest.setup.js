const React = require('react')

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('react-native-track-player', () => {
  return {
    Capability: {},
    Event: {},
    TrackType: {},
    addEventListener: jest.fn(),
    registerEventHandler: jest.fn(),
    registerPlaybackService: jest.fn(),
    setupPlayer: jest.fn(),
    destroy: jest.fn(),
    updateOptions: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
    skip: jest.fn(),
    skipToNext: jest.fn(),
    skipToPrevious: jest.fn(),
    removeUpcomingTracks: jest.fn(),
    // playback commands
    reset: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    seekTo: jest.fn(),
    setVolume: jest.fn(),
    setRate: jest.fn(),
    // player getters
    getQueue: jest.fn(),
    getTrack: jest.fn(),
    getCurrentTrack: jest.fn(),
    getVolume: jest.fn(),
    getDuration: jest.fn(),
    getPosition: jest.fn(),
    getBufferedPosition: jest.fn(),
    getState: jest.fn(),
    getRate: jest.fn()
  }
})

jest.mock('react-native-code-push', () => {
  const cp = (_) => (app) => app
  Object.assign(cp, {
    InstallMode: {},
    CheckFrequency: {},
    SyncStatus: {},
    UpdateState: {},
    DeploymentStatus: {},
    DEFAULT_UPDATE_DIALOG: {},

    checkForUpdate: jest.fn(),
    codePushify: jest.fn(),
    getConfiguration: jest.fn(),
    getCurrentPackage: jest.fn(),
    getUpdateMetadata: jest.fn(
      () =>
        new Promise((resolve, reject) => {
          resolve()
        })
    ),
    log: jest.fn(),
    notifyAppReady: jest.fn(),
    notifyApplicationReady: jest.fn(),
    sync: jest.fn()
  })
  return cp
})

jest.mock('@amplitude/react-native')
jest.mock('rn-fetch-blob')

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native')

  RN.NativeModules.RNFetchBlob = {
    DocumentDir: '',
    fetchBlobForm: jest.fn(),
    fetchBlob: jest.fn()
  }
  RN.NativeModules.RNCNetInfo = {}
  RN.NativeModules.RNPermissions = {}
  RN.NativeModules.RNFSManager = {}
  RN.NativeModules.RNShare = {}
  RN.NativeModules.RNViewShot = {}
  RN.NativeModules.RNGestureHandlerModule = {}
  RN.NativeModules.RNFingerprintjsPro = {
    init: () => {}
  }
  RN.NativeModules.Flipper = {
    registerPlugin: jest.fn()
  }

  return RN
})

jest.mock('@react-native-cookies/cookies', () => {
  return {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    openURL: jest.fn(),
    canOpenURL: jest.fn(),
    getInitialURL: jest.fn()
  }
})

jest.mock('jscrypto')

const nodeCrypto = require('crypto')

window.crypto = {
  getRandomValues: function (buffer) {
    return nodeCrypto.randomFillSync(buffer)
  }
}

const Blob = require('blob-polyfill').Blob

window.Blob = Blob

global.navigator = {
  userAgent: 'node.js'
}

jest.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect)
