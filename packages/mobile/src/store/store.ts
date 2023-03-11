import type { CommonState, RemoteConfigState } from '@audius/common'
import {
  uuid,
  toastActions,
  ErrorLevel,
  remoteConfigReducer as remoteConfig,
  reducers as commonReducers
} from '@audius/common'
import backend from 'audius-client/src/common/store/backend/reducer'
import type { BackendState } from 'audius-client/src/common/store/backend/types'
import confirmer from 'audius-client/src/common/store/confirmer/reducer'
import type { ConfirmerState } from 'audius-client/src/common/store/confirmer/types'
import signOnReducer from 'audius-client/src/common/store/pages/signon/reducer'
import type {
  SignOnPageState,
  SignOnPageReducer
} from 'audius-client/src/common/store/pages/signon/types'
import searchBar from 'audius-client/src/common/store/search-bar/reducer'
import type SearchBarState from 'audius-client/src/common/store/search-bar/types'
import RNRestart from 'react-native-restart'
import type { Store } from 'redux'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { persistStore } from 'redux-persist'
import createSagaMiddleware from 'redux-saga'

import { reportToSentry } from 'app/utils/reportToSentry'

import type { DownloadState } from './download/slice'
import downloads from './download/slice'
import type { DrawersState } from './drawers/slice'
import drawers from './drawers/slice'
import type { KeyboardState } from './keyboard/slice'
import keyboard from './keyboard/slice'
import { listenerMiddleware } from './listenerMiddleware'
import mobileUi from './mobileUi/slice'
import type { MobileUiState } from './mobileUi/slice'
import type { OAuthState } from './oauth/reducer'
import oauth from './oauth/reducer'
import type { OfflineDownloadsState } from './offline-downloads/slice'
import offlineDownloads from './offline-downloads/slice'
import rootSaga from './sagas'
import type { SearchState } from './search/searchSlice'
import search from './search/searchSlice'
import shareToStoryProgress from './share-to-story-progress/slice'
import type { ShareToStoryProgressState } from './share-to-story-progress/slice'
import { storeContext } from './storeContext'
import type { WalletConnectState } from './wallet-connect/slice'
import walletConnect from './wallet-connect/slice'

const errorRestartTimeout = 2000

const { addToast } = toastActions

export type AppState = CommonState & {
  // These also belong in CommonState but are here until we move them to the @audius/common package:
  signOn: SignOnPageState
  backend: BackendState
  confirmer: ConfirmerState
  searchBar: SearchBarState

  drawers: DrawersState
  downloads: DownloadState
  keyboard: KeyboardState
  oauth: OAuthState
  offlineDownloads: OfflineDownloadsState
  remoteConfig: RemoteConfigState
  search: SearchState
  mobileUi: MobileUiState
  walletConnect: WalletConnectState
  shareToStoryProgress: ShareToStoryProgressState
}

const messages = {
  error: 'Something went wrong'
}

const initializationTime = Date.now()

const onSagaError = (
  error: Error,
  errorInfo: {
    sagaStack: string
  }
) => {
  console.error(
    `Caught saga error: ${error} ${JSON.stringify(errorInfo, null, 4)}`
  )

  dispatch(
    addToast({
      content: messages.error,
      type: 'error',
      timeout: errorRestartTimeout,
      key: uuid()
    })
  )

  reportToSentry({
    level: ErrorLevel.Fatal,
    error,
    additionalInfo: errorInfo
  })

  // Automatically restart the app if the session is longer
  // than 30 seconds. Don't want to restart for shorter sessions
  // because it could result in a restart loop
  if (Date.now() - initializationTime > 30000) {
    setTimeout(() => {
      RNRestart.Restart()
    }, errorRestartTimeout)
  }
}

const commonStoreReducers = commonReducers()

const rootReducer = combineReducers({
  ...commonStoreReducers,
  // These also belong in common store reducers but are here until we move them to the @audius/common package:
  backend,
  confirmer,
  signOn: signOnReducer as SignOnPageReducer,
  searchBar,

  drawers,
  downloads,
  keyboard,
  oauth,
  offlineDownloads,
  remoteConfig,
  search,
  mobileUi,
  walletConnect,
  shareToStoryProgress
})

const sagaMiddleware = createSagaMiddleware({
  context: storeContext,
  onError: onSagaError
})

const middlewares = [sagaMiddleware, listenerMiddleware.middleware]

if (__DEV__) {
  const createDebugger = require('redux-flipper').default
  middlewares.push(createDebugger())
}

export const store = createStore(
  rootReducer,
  applyMiddleware(...middlewares)
) as unknown as Store<AppState> // need to explicitly type the store for offline-mode store reference

export const persistor = persistStore(store)

sagaMiddleware.run(rootSaga)

const { dispatch } = store
export { dispatch }
