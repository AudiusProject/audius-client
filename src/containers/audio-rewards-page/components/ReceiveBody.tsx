import React, { useState } from 'react'

import { Button, ButtonType, LogoSol } from '@audius/stems'
import cn from 'classnames'

import { WalletAddress } from 'common/models/Wallet'
import { BooleanKeys } from 'common/services/remote-config'
import { getJSONValue, setJSONValue } from 'services/LocalStorage'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'

import { ModalBodyWrapper } from '../WalletModal'

import ClickableAddress from './ClickableAddress'
import styles from './ReceiveBody.module.css'

type ReceiveBodyProps = { wallet: WalletAddress; solWallet: WalletAddress }

const { getRemoteVar } = remoteConfigInstance
const messages = {
  warning: 'PROCEED WITH CAUTION',
  warning2: 'If $AUDIO is sent to the wrong address it will be lost.',
  warning3: "Don't attempt to send tokens other than $AUDIO to this address.",
  splWarning1: 'You can only send Solana (SPL) $AUDIO tokens to this address.',
  splWarning2: 'Be sure to send your $AUDIO to the correct address!',
  splWarning3: 'Be careful, tokens are easy to lose and impossible to recover.',
  understand: 'I UNDERSTAND',
  yourAddress: 'YOUR ADDRESS',
  clickableSPLAddressTitle: 'YOUR SPL $AUDIO ADDRESS'
}

const useLocalStorageClickedReceiveUnderstand = (): [boolean, () => void] => {
  const key = 'receiveSPLAudioUnderstand'
  const [hasClickedUnderstand, setHasClickedUnderstand] = useState(
    getJSONValue(key)
  )
  const onClickUnderstand = () => {
    setHasClickedUnderstand(true)
    setJSONValue(key, true)
  }
  return [hasClickedUnderstand, onClickUnderstand]
}

const ReceiveBody = ({ wallet, solWallet }: ReceiveBodyProps) => {
  const useSolSPLAudio = getRemoteVar(BooleanKeys.USE_SPL_AUDIO) as boolean
  const [
    hasClickedUnderstand,
    onClickUnderstand
  ] = useLocalStorageClickedReceiveUnderstand()

  const renderReceiveEth = () => {
    return (
      <>
        <div className={styles.warning}>{messages.warning}</div>
        <div className={styles.description}>
          <div>{messages.warning2}</div>
          <div>{messages.warning3}</div>
        </div>
        <ClickableAddress address={wallet} />
      </>
    )
  }

  const renderSolAudioHeader = () => {
    return (
      <div className={styles.solClickableHeader}>
        <div className={styles.iconSolContainer}>
          <LogoSol className={styles.iconSolHeader} />
        </div>
        <span>{messages.clickableSPLAddressTitle}</span>
      </div>
    )
  }
  const renderReceiveSol = () => {
    return (
      <>
        <div className={styles.warning}>{messages.warning}</div>
        <div className={styles.description}>
          <LogoSol className={styles.chainIconSol} />
          <ul className={styles.splWarning}>
            <li>{messages.splWarning2}</li>
            <li>{messages.splWarning3}</li>
            <li>{messages.splWarning3}</li>
          </ul>
        </div>
        {hasClickedUnderstand ? (
          <ClickableAddress
            label={renderSolAudioHeader()}
            address={solWallet}
          />
        ) : (
          <Button
            text={messages.understand}
            onClick={onClickUnderstand}
            textClassName={styles.understandText}
            type={ButtonType.PRIMARY_ALT}
          />
        )}
      </>
    )
  }

  return (
    <ModalBodyWrapper
      className={cn(styles.container, {
        [styles.solContainer]: useSolSPLAudio
      })}
    >
      {useSolSPLAudio ? renderReceiveSol() : renderReceiveEth()}
    </ModalBodyWrapper>
  )
}

export default ReceiveBody
