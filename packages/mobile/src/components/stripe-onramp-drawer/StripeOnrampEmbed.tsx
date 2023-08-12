import { useCallback } from 'react'

import { stripeModalUISelectors, stripeModalUIActions } from '@audius/common'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'
import { useDispatch, useSelector } from 'react-redux'

import { useIsUSDCEnabled } from 'app/hooks/useIsUSDCEnabled'
import { env } from 'app/services/env'
import { makeStyles } from 'app/styles'

import LoadingSpinner from '../loading-spinner/LoadingSpinner'

const { getStripeClientSecret } = stripeModalUISelectors
const { stripeSessionStatusChanged, cancelStripeOnramp } = stripeModalUIActions

const STRIPE_PUBLISHABLE_KEY = env.REACT_APP_STRIPE_CLIENT_PUBLISHABLE_KEY

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    height: '85%'
  },
  spinnerContainer: {
    height: '85%',
    justifyContent: 'center',
    alignItems: 'center'
  }
}))

export const StripeOnrampEmbed = () => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const isUSDCEnabled = useIsUSDCEnabled()
  const clientSecret = useSelector(getStripeClientSecret)

  const handleSessionUpdate = useCallback((event) => {
    if (event?.payload?.session?.status) {
      dispatch(
        stripeSessionStatusChanged({ status: event.payload.session.status })
      )
    }
  }, [])

  const handleError = useCallback(
    (event) => {
      const { nativeEvent } = event
      console.error('Stripe WebView onError: ', nativeEvent)
      dispatch(cancelStripeOnramp())
    },
    [dispatch]
  )

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Crypto Onramp</title>
    <meta name="description" content="A demo of hosted onramp" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://js.stripe.com/v3/"></script>
    <script type="text/javascript" src="https://crypto-js.stripe.com/crypto-onramp-outer.js"></script>
  </head>
  <body>
    <div id="onramp-element" />
    <script type="text/javascript">
      const handleSessionUpdate = (event) => {
        window.ReactNativeWebView.postMessage(event)
      }
      try {
        const onramp = new window.StripeOnramp("${STRIPE_PUBLISHABLE_KEY}")
        const session = onramp.createSession({clientSecret:"${clientSecret}"})
        session.mount('#onramp-element')
        session.addEventListener('onramp_session_updated', handleSessionUpdate)
      } catch (e) {
        window.ReactNativeWebView.postMessage(e)
      }
    </script>
  </body>
  </html>
  `

  if (!STRIPE_PUBLISHABLE_KEY) {
    console.error('Stripe publishable key not found')
    return null
  }

  if (!isUSDCEnabled) return null

  return (
    <View style={styles.root}>
      {clientSecret ? (
        <WebView
          source={{ html }}
          scrollEnabled={false}
          onError={handleError}
          onMessage={handleSessionUpdate}
        />
      ) : (
        <View style={styles.spinnerContainer}>
          <LoadingSpinner />
        </View>
      )}
    </View>
  )
}
