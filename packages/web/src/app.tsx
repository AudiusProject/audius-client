import '@audius/stems/dist/stems.css'

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql
} from '@apollo/client'
import { RestLink } from 'apollo-link-rest'
import { ConnectedRouter } from 'connected-react-router'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { LastLocationProvider } from 'react-router-last-location'

import { CoinbasePayButtonProvider } from 'components/coinbase-pay-button'
import App from 'pages/App'
import AppContext from 'pages/AppContext'
import { AppErrorBoundary } from 'pages/AppErrorBoundary'
import { MainContentContext } from 'pages/MainContentContext'
import { OAuthLoginPage } from 'pages/oauth-login-page/OAuthLoginPage'
import { SomethingWrong } from 'pages/something-wrong/SomethingWrong'
import history from 'utils/history'

import { store } from './store/configureStore'

import './services/webVitals'
import './index.css'

const restLink = new RestLink({ uri: 'discoveryprovider.audius.co/v1/full' })

const client = new ApolloClient({
  link: restLink,
  cache: new InMemoryCache()
})

const query = gql`
  query Luke {
    user @rest(type: "User", path: "users/nlGNe") {
      data {
        id
        name
      }
    }
  }
`

client.query({ query }).then((response) => {
  console.log('GRAPHQL', response.data.user.data.name)
})

type AudiusAppProps = {
  shouldShowPopover: boolean
}

const AudiusApp = ({ shouldShowPopover }: AudiusAppProps) => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <LastLocationProvider>
          <AppContext>
            <MainContentContext.Consumer>
              {({ mainContentRef }) => (
                <Switch>
                  <Route path='/error'>
                    <SomethingWrong />
                  </Route>
                  <Route
                    exact
                    path={'/oauth/auth'}
                    component={OAuthLoginPage}
                  />
                  <Route path='/'>
                    <AppErrorBoundary>
                      <CoinbasePayButtonProvider>
                        <App
                          mainContentRef={mainContentRef}
                          shouldShowPopover={shouldShowPopover}
                        />
                      </CoinbasePayButtonProvider>
                    </AppErrorBoundary>
                  </Route>
                </Switch>
              )}
            </MainContentContext.Consumer>
          </AppContext>
        </LastLocationProvider>
      </ConnectedRouter>
    </Provider>
  )
}

export default AudiusApp
