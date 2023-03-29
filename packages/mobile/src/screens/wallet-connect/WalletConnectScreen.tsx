import { View } from 'react-native'

import IconLink from 'app/assets/images/iconLink.svg'
import IconRemove from 'app/assets/images/iconRemove.svg'
import { Text, Screen, ScreenContent } from 'app/components/core'
import { useNavigation } from 'app/hooks/useNavigation'
import { makeStyles } from 'app/styles'

import { TopBarIconButton } from '../app-screen'

import { ConnectNewWalletButton } from './ConnectNewWalletButton'
import { LinkedWallets } from './components'
import type { WalletConnectParamList } from './types'
import { useWalletStatusToasts } from './useWalletStatusToasts'

const messages = {
  title: 'Connect Wallets',
  subtitle: 'Connect Additional Wallets With Your Account',
  text: 'Show off your NFT Collectibles and flaunt your $AUDIO with a VIP badge on your profile.',
  linkedWallets: 'Linked Wallets',
  audio: '$AUDIO'
}

const useStyles = makeStyles(({ spacing, typography, palette }) => ({
  root: {
    paddingVertical: spacing(4),
    flex: 1
  },
  header: {
    marginHorizontal: spacing(6)
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
  }
}))

export const WalletConnectScreen = () => {
  const styles = useStyles()
  const navigation = useNavigation<WalletConnectParamList>()
  useWalletStatusToasts()

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
      <ScreenContent>
        <View style={styles.root}>
          <View style={styles.header}>
            <Text weight='bold' style={styles.subtitle}>
              {messages.subtitle}
            </Text>
            <Text weight='medium' fontSize='medium' style={styles.text}>
              {messages.text}
            </Text>
          </View>
          <ConnectNewWalletButton />
          <LinkedWallets />
        </View>
      </ScreenContent>
    </Screen>
  )
}
