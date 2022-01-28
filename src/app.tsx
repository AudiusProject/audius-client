import React from 'react'

import '@audius/stems/dist/stems.css'
import { ConnectedRouter } from 'connected-react-router'
import { Provider } from 'react-redux'

import App from 'pages/App'
import AppContext from 'pages/AppContext'
import { MainContentContext } from 'pages/MainContentContext'
import logger from 'utils/logger'

import configureStore from './store/configureStore'
import history from './utils/history'

import './services/webVitals'
import './index.css'

declare global {
  interface Window {
    store: any
  }
}

const store = configureStore()
window.store = store
logger(store)

type AudiusAppProps = {
  setReady: () => void
  isReady: boolean
  setConnectivityFailure: (failure: boolean) => void
  shouldShowPopover: boolean
}

const AudiusApp = ({
  setReady,
  isReady,
  setConnectivityFailure,
  shouldShowPopover
}: AudiusAppProps) => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <AppContext>
          <MainContentContext.Consumer>
            {({ mainContentRef }) => (
              <App
                setReady={setReady}
                isReady={isReady}
                mainContentRef={mainContentRef}
                setConnectivityFailure={setConnectivityFailure}
                shouldShowPopover={shouldShowPopover}
              />
            )}
          </MainContentContext.Consumer>
        </AppContext>
      </ConnectedRouter>
    </Provider>
  )
}

export default AudiusApp
