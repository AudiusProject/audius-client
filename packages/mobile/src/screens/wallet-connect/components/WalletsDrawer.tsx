import { useCallback, useEffect } from 'react'

import type {
  RenderQrcodeModalProps,
  WalletService
} from '@walletconnect/react-native-dapp'
import { useWalletConnectContext } from '@walletconnect/react-native-dapp'
import bs58 from 'bs58'
import { Linking, View, Image, Text, TouchableOpacity } from 'react-native'
import { useDispatch } from 'react-redux'

// import IconPhantom from 'app/assets/images/iconPhantom.svg'
import { NativeDrawer } from 'app/components/drawer'
import { setVisibility } from 'app/store/drawers/slice'
import { makeStyles } from 'app/styles'

import { buildUrl, useDappKeyPair } from '../utils'

const SUPPORTED_SERVICES = new Set(['MetaMask', 'Rainbow'])
const MODAL_NAME = 'ConnectWallets'

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    marginVertical: spacing(8),
    marginHorizontal: spacing(4)
  }
}))

type WalletOptionProps = {
  name: string
  imageUri: string
  onPress: () => void
}

const WalletOption = ({ name, imageUri, onPress }: WalletOptionProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image height={200} width={200} source={{ uri: imageUri }} />
      <Text>{name}</Text>
    </TouchableOpacity>
  )
}

export const WalletsDrawer = () => {
  const styles = useStyles()
  const { walletServices, connectToWalletService, redirectUrl } =
    useWalletConnectContext()

  const supportedWalletServices = (walletServices || []).filter((service) =>
    SUPPORTED_SERVICES.has(service.name)
  )

  const [dappKeyPair] = useDappKeyPair()

  const handleConnectWallet = useCallback(() => {
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: 'mainnet-beta',
      app_url: 'https://audius.co',
      redirect_link: 'audius://wallet-connect'
    })
    const url = buildUrl('connect', params)
    Linking.openURL(url)
  }, [dappKeyPair])

  return (
    <NativeDrawer drawerName={MODAL_NAME}>
      <View style={styles.root}>
        {supportedWalletServices.map(
          (walletService: WalletService, i: number) => {
            return (
              <WalletOption
                key={i}
                name={walletService.name}
                // @ts-ignore
                imageUri={walletService.image_url.sm}
                onPress={() =>
                  connectToWalletService?.(walletService, redirectUrl)
                }
              />
            )
          }
        )}
        <WalletOption
          name='Phantom'
          imageUri={'app/assets/images/iconPhantom.svg'}
          onPress={handleConnectWallet}
        />
        {/* TODO: Add Solana Phone as an option */}
      </View>
    </NativeDrawer>
  )
}

export const WalletConnectProviderRenderModal = ({
  visible
}: RenderQrcodeModalProps) => {
  const dispatch = useDispatch()
  useEffect(() => {
    if (visible) {
      dispatch(setVisibility({ drawer: MODAL_NAME, visible: true }))
    }
  }, [visible, dispatch])
  // Must be an element to comply with interface
  return <></>
}
