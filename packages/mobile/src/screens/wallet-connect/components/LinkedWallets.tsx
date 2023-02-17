import type { AssociatedWallet } from '@audius/common'
import { Chain, tokenDashboardPageSelectors } from '@audius/common'
import { FlatList, View } from 'react-native'
import { useSelector } from 'react-redux'

import { Divider, Text } from 'app/components/core'
import { makeStyles } from 'app/styles'

import { LinkedWallet } from './LinkedWallet'

const { getAssociatedWallets, getRemoveWallet } = tokenDashboardPageSelectors

const messages = {
  linkedWallets: 'Linked Wallet',
  audio: '$AUDIO',
  copied: 'Copied To Clipboard!'
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    marginTop: spacing(6),
    flex: 1
  },
  linkedWalletsHeader: {
    paddingHorizontal: spacing(6),
    flexDirection: 'row'
  },
  divider: {
    marginVertical: spacing(3)
  }
}))

type LinkedWalletData = AssociatedWallet & {
  chain: Chain
  isConfirming?: boolean
}

export const LinkedWallets = () => {
  const styles = useStyles()

  const {
    confirmingWallet,
    connectedEthWallets = [],
    connectedSolWallets
  } = useSelector(getAssociatedWallets)
  const removeWallets = useSelector(getRemoveWallet)

  const ethWallets =
    connectedEthWallets?.map((wallet) => ({ ...wallet, chain: Chain.Eth })) ??
    []

  const solWallets =
    connectedSolWallets?.map((wallet) => ({ ...wallet, chain: Chain.Sol })) ??
    []

  const wallets: LinkedWalletData[] = [...ethWallets, ...solWallets]

  if (confirmingWallet && confirmingWallet.wallet && confirmingWallet.chain) {
    wallets.push({
      chain: confirmingWallet.chain,
      address: confirmingWallet.wallet,
      balance: confirmingWallet.balance,
      collectibleCount: confirmingWallet.collectibleCount || 0,
      isConfirming: true
    })
  }

  if (!(wallets.length > 0)) {
    return null
  }

  return (
    <View style={styles.root}>
      <View style={styles.linkedWalletsHeader}>
        <View style={{ flex: 6 }}>
          <Text
            fontSize='medium'
            textTransform='uppercase'
            weight='bold'
            color='neutralLight4'
          >
            {messages.linkedWallets}
          </Text>
        </View>
        <View style={{ flex: 2 }}>
          <Text
            style={{ textAlign: 'right' }}
            fontSize='medium'
            textTransform='uppercase'
            weight='bold'
            color='neutralLight4'
          >
            {messages.audio}
          </Text>
        </View>
        <View style={{ flex: 2 }} />
      </View>
      <Divider style={styles.divider} />
      <FlatList
        renderItem={({ item }) => (
          <LinkedWallet
            chain={item.chain}
            address={item.address}
            audioBalance={item.balance}
            isLoading={Boolean(
              removeWallets.wallet === item.address || item.isConfirming
            )}
          />
        )}
        data={wallets}
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
      />
    </View>
  )
}
