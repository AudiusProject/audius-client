import { useCallback } from 'react'

import { accountSelectors } from '@audius/common'
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol'
import { useDispatch, useSelector } from 'react-redux'

import IconSolana from 'app/assets/images/iconSolana.svg'
import { setConnectionType, signMessage } from 'app/store/wallet-connect/slice'

import { WalletConnectOption } from './WalletConnectOption'
import useAuthorization from './useSolanaPhoneAuthorization'

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

    let publicKey

    // @ts-ignore: wallet adapter types are wrong
    const [signature] = await transact(async (wallet) => {
      const freshAccount = await authorizeSession(wallet)
      // Existing account or newly connected account
      publicKey = selectedAccount?.address ?? freshAccount.address
      return await wallet.signMessages({
        addresses: [publicKey],
        // @ts-ignore: wallet adapter types are wrong
        payloads: [messageBuffer]
      })
    })

    dispatch(
      signMessage({ path: 'wallet-sign-message', data: signature, publicKey })
    )
  }, [dispatch, authorizeSession, selectedAccount, accountUserId])

  return (
    <WalletConnectOption
      name='Solana'
      icon={<IconSolana height={50} width={50} />}
      onPress={handleConnectWallet}
    />
  )
}
