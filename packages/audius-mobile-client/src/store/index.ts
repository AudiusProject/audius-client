import { CommonState } from 'audius-client/src/common/store'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'

import audio, { AudioState } from './audio/reducer'
import clientStore from './clientStore/slice'
import drawers, { DrawersState } from './drawers/slice'
import googleCast, { GoogleCastState } from './googleCast/reducer'
import keyboard, { KeyboardState } from './keyboard/slice'
import lifecycle, { LifecycleState } from './lifecycle/reducer'
import notifications, { NotificationsState } from './notifications/reducer'
import oauth, { OAuthState } from './oauth/reducer'
import rootSaga from './sagas'
import search, { SearchState } from './search/reducer'
import signon, { SignonState } from './signon/reducer'
import theme, { ThemeState } from './theme/reducer'
import web, { WebState } from './web/reducer'

export type AppState = {
  audio: AudioState
  clientStore: CommonState
  drawers: DrawersState
  googleCast: GoogleCastState
  keyboard: KeyboardState
  lifecycle: LifecycleState
  notifications: NotificationsState
  oauth: OAuthState
  search: SearchState
  signon: SignonState
  theme: ThemeState
  web: WebState
}

const createRootReducer = () =>
  combineReducers({
    audio,
    clientStore,
    drawers,
    googleCast,
    keyboard,
    lifecycle,
    notifications,
    oauth,
    search,
    signon,
    theme,
    web
  })

export default () => {
  const sagaMiddleware = createSagaMiddleware()
  const middlewares = applyMiddleware(sagaMiddleware)
  const composeEnhancers = composeWithDevTools({ trace: true, traceLimit: 25 })
  const store = createStore(createRootReducer(), composeEnhancers(middlewares))
  sagaMiddleware.run(rootSaga)
  return store
}
