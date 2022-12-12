import { useCallback } from 'react'

import bs58 from 'bs58'
import { Linking } from 'react-native'
import { useDispatch } from 'react-redux'
import nacl from 'tweetnacl'

import IconPhantom from 'app/assets/images/iconPhantom.svg'
import {
  setConnectionType,
  setDappKeyPair
} from 'app/store/wallet-connect/slice'
import { buildUrl, serializeKeyPair } from 'app/store/wallet-connect/utils'

import { WalletConnectOption } from './WalletConnectOption'

export const PhantomWalletConnectOption = () => {
  const dispatch = useDispatch()

  const handleConnectWallet = useCallback(() => {
    const dappKeyPair = nacl.box.keyPair()
    dispatch(setConnectionType({ connectionType: 'phantom' }))
    dispatch(setDappKeyPair({ dappKeyPair: serializeKeyPair(dappKeyPair) }))

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: 'mainnet-beta',
      app_url: 'https://audius.co',
      redirect_link: 'audius://wallet-connect'
    })

    const url = buildUrl('connect', params)

    Linking.openURL(url)
  }, [dispatch])

  return (
    <WalletConnectOption
      name='Phantom'
      icon={<IconPhantom height={64} width={64} />}
      onPress={handleConnectWallet}
    />
  )
}
