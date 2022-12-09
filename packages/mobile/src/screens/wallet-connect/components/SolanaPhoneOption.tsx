import { useCallback } from 'react'

import {
  accountSelectors,
  Chain,
  tokenDashboardPageActions
} from '@audius/common'
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol'
import { BN } from 'bn.js'
import bs58 from 'bs58'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import nacl from 'tweetnacl'
import { put } from 'typed-redux-saga'

import IconSolana from 'app/assets/images/iconSolana.svg'
import { setConnectionType, signMessage } from 'app/store/wallet-connect/slice'

import { WalletConnectOption } from './WalletConnectOption'
import useAuthorization from './useSolanaPhoneAuthorization'

const { setIsConnectingWallet } = tokenDashboardPageActions

const { getUserId } = accountSelectors

export const SolanaPhoneOption = () => {
  const dispatch = useDispatch()
  const accountUserId = useSelector(getUserId)

  const { authorizeSession, selectedAccount } = useAuthorization()
  const handleConnectWallet = useCallback(async () => {
    dispatch(
      setConnectionType({ connectionType: 'solana-phone-wallet-adapter' })
    )

    const message = `AudiusUserID:${accountUserId}`
    const messageBuffer = new Uint8Array(
      message.split('').map((c) => c.charCodeAt(0))
    )

    console.log('got dat message', message, messageBuffer)

    let publicKey

    // @ts-ignore: wallet adapter types are wrong
    const {
      signed_payloads: [signature]
    } = await transact(async (wallet) => {
      console.log('starting authorization!')
      const freshAccount = await authorizeSession(wallet)
      console.log('got an account!', freshAccount)
      // Existing account or newly connected account
      publicKey = selectedAccount?.address ?? freshAccount.address

      console.log('got the public key!', publicKey)
      try {
        return await wallet.signMessages({
          addresses: [publicKey],
          // @ts-ignore: wallet adapter types are wrong
          payloads: [Buffer.from(messageBuffer).toString('base64')]
        })
      } catch (e) {
        console.log('error', e)
        return ['']
      }
    })

    console.log('base64 sig', signature)

    const publicKeyEncoded = bs58.encode(Buffer.from(publicKey, 'base64'))

    const signatureEncoded = Buffer.from(signature, 'base64')
      .slice(-64)
      .toString('hex')

    // const isValid = nacl.sign.detached.verify(
    //   Buffer.from(message),
    //   sigBS58,
    //   publicKey58
    // )

    // bs58.decode(bs58.encode(Buffer.from(signature, 'base64'))),
    // bs58.decode(bs58.encode(Buffer.from(publicKey, 'base64')))

    // console.log('is valid??', isValid)

    dispatch(
      setIsConnectingWallet({
        wallet: publicKeyEncoded,
        chain: Chain.Sol,
        balance: new BN('0'),
        collectibleCount: 0
      })
    )

    dispatch(
      signMessage({
        path: 'wallet-sign-message',
        data: signatureEncoded,
        publicKey: publicKeyEncoded,
        connectionType: 'solana-phone-wallet-adapter'
      })
    )
  }, [dispatch, authorizeSession, selectedAccount, accountUserId])

  return (
    <WalletConnectOption
      name='Solana'
      icon={
        <View
          style={{
            backgroundColor: 'black',
            height: 50,
            width: 50,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 25
          }}
        >
          <IconSolana height={30} width={30} />
        </View>
      }
      onPress={handleConnectWallet}
    />
  )
}
