import { useCallback, useContext, useEffect } from 'react'

import type { BNWei } from '@audius/common'
import {
  Chain,
  formatWei,
  tokenDashboardPageSelectors,
  tokenDashboardPageActions
} from '@audius/common'
import Clipboard from '@react-native-clipboard/clipboard'
import { View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'

import IconCopy from 'app/assets/images/iconCopy.svg'
import IconRemoveTrack from 'app/assets/images/iconRemoveTrack.svg'
import LogoEth from 'app/assets/images/logoEth.svg'
import LogoSol from 'app/assets/images/logoSol.svg'
import { Divider, FlatList, IconButton, Text } from 'app/components/core'
import LoadingSpinner from 'app/components/loading-spinner'
import { ToastContext } from 'app/components/toast/ToastContext'
import { useDrawer } from 'app/hooks/useDrawer'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'

const { getAssociatedWallets, getRemoveWallet } = tokenDashboardPageSelectors
const { requestRemoveWallet, resetStatus } = tokenDashboardPageActions

const messages = {
  linkedWallets: 'Linked Wallets',
  newWalletConnected: 'New Wallet Connected!',
  audio: '$AUDIO',
  copied: 'Copied To Clipboard!'
}

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    marginTop: spacing(6)
  },
  linkedWalletsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: spacing(2),
    marginRight: spacing(14)
  },
  divider: {
    marginVertical: spacing(2)
  },
  linkedWallet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  linkedWalletKey: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 150
  },
  linkedWalletLogo: {
    marginRight: spacing(2)
  },
  chainIcon: {
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    borderRadius: 14,
    padding: 2,
    marginRight: spacing(2)
  },
  address: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  copyIcon: {
    lineHeight: 16,
    marginBottom: 2,
    color: palette.neutralLight4,
    marginLeft: 10
  },
  audioAmount: {
    marginRight: spacing(2)
  },
  iconContainer: {
    marginLeft: spacing(2)
  },
  removeIcon: {
    height: 20,
    width: 20
  },
  loading: {
    marginVertical: spacing(2)
  }
}))

type WalletProps = {
  chain: Chain
  address: string
  audioBalance: BNWei
  isLoading: boolean
}

const Wallet = ({ chain, address, audioBalance, isLoading }: WalletProps) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const { toast } = useContext(ToastContext)

  const { onOpen: onOpenConfirmationDrawer } = useDrawer('ConfirmRemoveWallet')
  const onRequestRemoveWallet = useCallback(() => {
    dispatch(requestRemoveWallet({ wallet: address, chain }))
    onOpenConfirmationDrawer()
  }, [onOpenConfirmationDrawer, dispatch, address, chain])

  const handlePressAddress = useCallback(() => {
    Clipboard.setString(address)
    toast({ content: messages.copied, type: 'info' })
  }, [toast, address])

  return (
    <View style={styles.linkedWallet}>
      <View style={styles.linkedWalletKey}>
        <View style={styles.chainIcon}>
          {chain === Chain.Eth ? (
            <LogoEth height={spacing(5)} width={spacing(5)} />
          ) : (
            <LogoSol height={spacing(5)} width={spacing(5)} />
          )}
        </View>
        <TouchableOpacity style={styles.address} onPress={handlePressAddress}>
          <Text ellipsizeMode='middle' numberOfLines={1}>
            {address}
          </Text>
          <IconCopy style={styles.copyIcon} height={16} width={16} />
        </TouchableOpacity>
      </View>
      <Text style={styles.audioAmount}>{formatWei(audioBalance, true)}</Text>
      {isLoading ? (
        <LoadingSpinner style={styles.loading} />
      ) : (
        <IconButton
          icon={IconRemoveTrack}
          styles={{
            root: styles.iconContainer,
            icon: styles.removeIcon
          }}
          onPress={onRequestRemoveWallet}
        />
      )}
    </View>
  )
}

export const LinkedWallets = () => {
  const styles = useStyles()

  const dispatch = useDispatch()
  const {
    status,
    confirmingWallet,
    errorMessage,
    connectedEthWallets,
    connectedSolWallets
  } = useSelector(getAssociatedWallets)
  const removeWallets = useSelector(getRemoveWallet)

  const { toast } = useContext(ToastContext)

  useEffect(() => {
    if (status === 'Confirmed') {
      toast({ content: messages.newWalletConnected, type: 'info' })
      setTimeout(() => {
        dispatch(resetStatus())
      }, 2000)
      return () => {
        dispatch(resetStatus())
      }
    }
  }, [toast, dispatch, status])

  useEffect(() => {
    if (errorMessage) {
      toast({ content: errorMessage, type: 'error' })
      setTimeout(() => {
        dispatch(resetStatus())
      }, 2000)
      return () => {
        dispatch(resetStatus())
      }
    }
  }, [toast, dispatch, errorMessage])

  const wallets = [
    ...(connectedEthWallets
      ? connectedEthWallets.map((wallet) => ({ ...wallet, chain: Chain.Eth }))
      : []),
    ...(connectedSolWallets
      ? connectedSolWallets.map((wallet) => ({ ...wallet, chain: Chain.Sol }))
      : []),
    { ...confirmingWallet, isConfirming: true }
  ]

  if (!(wallets.length > 0)) {
    return null
  }

  return (
    <View style={styles.root}>
      <View style={styles.linkedWalletsHeader}>
        <Text
          fontSize='small'
          textTransform='uppercase'
          weight='bold'
          color='neutralLight4'
        >
          {messages.linkedWallets}
        </Text>
        <Text
          fontSize='small'
          textTransform='uppercase'
          weight='bold'
          color='neutralLight4'
        >
          {messages.audio}
        </Text>
      </View>
      <Divider style={styles.divider} />
      <FlatList
        renderItem={({ item }) => (
          <Wallet
            chain={item.chain}
            address={item.address}
            audioBalance={item.balance}
            isLoading={
              removeWallets.wallet === item.address || item.isConfirming
            }
          />
        )}
        data={wallets}
      />
    </View>
  )
}
