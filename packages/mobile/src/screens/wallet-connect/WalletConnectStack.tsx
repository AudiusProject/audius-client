import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { useAppScreenOptions } from '../app-screen/useAppScreenOptions'

import { ConfirmWalletConnectionScreen } from './ConfirmWalletConnectionScreen'
import { WalletConnectScreen } from './WalletConnectScreen'

const Stack = createNativeStackNavigator()

const screenOptionOverrides = { headerRight: () => null }

export const WalletConnectStack = () => {
  const screenOptions = useAppScreenOptions(screenOptionOverrides)

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name='Wallets' component={WalletConnectScreen} />
      <Stack.Screen
        name='ConfirmWalletConnection'
        component={ConfirmWalletConnectionScreen}
      />
    </Stack.Navigator>
  )
}
