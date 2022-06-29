// NOTE: This page is temporary for testing

import { useState, useCallback } from 'react'

import { Button, ButtonType } from '@audius/stems'
import { Keypair, PublicKey } from '@solana/web3.js'
import base58 from 'bs58'

import Input from 'components/data-entry/Input'

import styles from './WalletInputPage.module.css'

export const WalletInputPage = ({
  onSubmit
}: {
  onSubmit: (keypair: Keypair) => void
}) => {
  const [publicKey, setPublicKey] = useState()
  const [secretKey, setSecretKey] = useState()

  const handlePublicKeyChange = useCallback(
    value => {
      setPublicKey(value)
    },
    [setPublicKey]
  )

  const handleSecretKeyChange = useCallback(
    value => {
      setSecretKey(value)
    },
    [setSecretKey]
  )

  const handleSubmit = useCallback(() => {
    if (publicKey && secretKey) {
      try {
        const keypair = new Keypair({
          publicKey: new PublicKey(publicKey).toBytes(),
          secretKey: base58.decode(secretKey)
        })
        onSubmit(keypair)
      } catch (e) {
        console.error(e)
      }
    } else {
      console.error({ publicKey, secretKey })
    }
  }, [publicKey, secretKey, onSubmit])

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>Enter your wallet information</h2>
      <p className={styles.paragraph}>
        NOTE: This is temporary for testing purposes until a hedgehog wallet is
        available.
      </p>
      <Input
        variant={'elevatedPlaceholder'}
        placeholder={'Public key'}
        onChange={handlePublicKeyChange}
        value={publicKey}
      />
      <Input
        variant={'elevatedPlaceholder'}
        placeholder={'Secret key'}
        onChange={handleSecretKeyChange}
        value={secretKey}
      />
      <Button
        style={{ width: '100%' }}
        type={ButtonType.PRIMARY_ALT}
        text={'Use Wallet'}
        onClick={handleSubmit}
      />
    </div>
  )
}
