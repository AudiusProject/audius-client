import { useCallback, useEffect } from 'react'

import {
  accountSelectors,
  tokenDashboardPageSelectors,
  deletePlaylistConfirmationModalUIActions
} from '@audius/common'
import { useRoute } from '@react-navigation/native'
import { useWalletConnect } from '@walletconnect/react-native-dapp'
import { Platform, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconLink from 'app/assets/images/iconLink.svg'
import IconRemove from 'app/assets/images/iconRemove.svg'
import { Button, Text, Screen } from 'app/components/core'
import { useNavigation } from 'app/hooks/useNavigation'
import { setVisibility } from 'app/store/drawers/slice'
import { getStatus } from 'app/store/wallet-connect/selectors'
import {
  connectNewWallet,
  setConnectionStatus,
  signMessage
} from 'app/store/wallet-connect/slice'
import { makeStyles } from 'app/styles'

import { TopBarIconButton } from '../app-screen'

import { LinkedWallets } from './components'
import type { WalletConnectParamList, WalletConnectRoute } from './types'

const { getUserId } = accountSelectors

const { getConfirmingWallet } = tokenDashboardPageSelectors

const messages = {
  title: 'Connect Wallets',
  subtitle: 'Connect Additional Wallets With Your Account',
  text: 'Show off your NFT Collectibles and flaunt your $AUDIO with a VIP badge on your profile.',
  connect: 'Connect New Wallet',
  linkedWallets: 'Linked Wallets',
  audio: '$AUDIO'
}

const useStyles = makeStyles(({ spacing, typography, palette }) => ({
  root: {
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(4)
  },
  subtitle: {
    textAlign: 'center',
    fontSize: typography.fontSize.xxl,
    color: palette.secondary,
    marginVertical: spacing(6)
  },
  text: {
    marginHorizontal: spacing(4),
    textAlign: 'center',
    lineHeight: 24
  },
  connectButton: {
    marginTop: spacing(6)
  },
  linkedWallets: {
    marginTop: spacing(6)
  }
}))

export const WalletConnectScreen = () => {
  const styles = useStyles()
  const navigation = useNavigation<WalletConnectParamList>()
  const connector = useWalletConnect()
  const dispatch = useDispatch()
  const { params } = useRoute<WalletConnectRoute<'Wallets'>>()
  const connectionStatus = useSelector(getStatus)
  const { wallet } = useSelector(getConfirmingWallet)
  const accountUserId = useSelector(getUserId)

  console.log(
    'status',
    connectionStatus === 'connected',
    connector.session.connected,
    wallet
  )

  useEffect(() => {
    if (connectionStatus === 'connected' && wallet) {
      dispatch(setConnectionStatus({ status: 'signing' }))

      const message = `AudiusUserID:${accountUserId}`
      const messageParams = [message, wallet]

      setTimeout(() => {
        connector
          .signPersonalMessage(messageParams)
          .then((result) => {
            dispatch(
              signMessage({ data: result, connectionType: 'wallet-connect' })
            )
          })
          .catch((e) => {
            console.log('personal sign error', e)
          })
      }, 1000) // is this necessary?
      // return () => clearTimeout(signMessagetTimeout)
    } else if (connectionStatus === 'done') {
      connector.killSession()
    }
  }, [wallet, accountUserId, connector, dispatch, connectionStatus])

  useEffect(() => {
    connector.on('connect', (_, payload) => {
      const { accounts } = payload.params[0]
      const wallet = accounts[0]
      console.log('connecting happening?')

      dispatch(
        connectNewWallet({
          publicKey: wallet,
          connectionType: 'wallet-connect'
        })
      )
    })
    return () => {
      connector?.off('connect')
    }
  }, [connector, dispatch])

  useEffect(() => {
    if (!params) return
    if (params.path === 'wallet-connect') {
      dispatch(connectNewWallet({ ...params, connectionType: 'phantom' }))
    } else if (params.path === 'wallet-sign-message') {
      dispatch(signMessage({ ...params, connectionType: 'phantom' }))
    }
  }, [params?.path, params, dispatch])

  const handleConnectWallet = useCallback(() => {
    // The wallet connect modal houses all of our wallet
    // connections, so asking it to connect opens the
    // drawer to connect any wallet.
    // if (Platform.OS === 'android') {
    //   dispatch(
    //     setVisibility({
    //       drawer: 'ConnectWallets',
    //       visible: true
    //     })
    //   )
    // } else {
    connector.connect()
    // }
  }, [connector])

  return (
    <Screen
      title={messages.title}
      icon={IconLink}
      variant='white'
      topbarLeft={
        <TopBarIconButton icon={IconRemove} onPress={navigation.goBack} />
      }
      url='/wallet-connect'
    >
      <View style={styles.root}>
        <Text weight='bold' style={styles.subtitle}>
          {messages.subtitle}
        </Text>
        <Text weight='medium' fontSize='medium' style={styles.text}>
          {messages.text}
        </Text>
        <Button
          style={styles.connectButton}
          title={messages.connect}
          variant='primary'
          size='large'
          onPress={handleConnectWallet}
        />
        <View style={styles.linkedWallets}>
          <LinkedWallets />
        </View>
      </View>
    </Screen>
  )
}
