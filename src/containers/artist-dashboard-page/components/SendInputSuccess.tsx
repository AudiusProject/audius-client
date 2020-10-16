import React from 'react'
import { BNWei, WalletAddress, weiToAudioString } from 'store/wallet/slice'
import { ModalBodyTitle, ModalBodyWrapper } from '../WalletModal'
import DisplayAudio from './DisplayAudio'
import { AddressWithArrow } from './SendInputConfirmation'

import styles from './SendInputSuccess.module.css'

type SendInputSuccessProps = {
  sentAmount: BNWei
  recipientAddress: WalletAddress
  balance: BNWei
}

const messages = {
  success: 'You have successfully sent',
  note: 'Note: The $AUDIO may take a couple minutes to show up',
  newBalance: 'YOUR BALANCE IS NOW'
}

const SendInputSuccess = ({
  sentAmount,
  recipientAddress,
  balance
}: SendInputSuccessProps) => {
  return (
    <ModalBodyWrapper>
      <div className={styles.titleWrapper}>
        <ModalBodyTitle text={messages.success} />
      </div>
      <DisplayAudio amount={sentAmount} />
      <AddressWithArrow address={recipientAddress} />
      <div className={styles.noteWrapper}>{messages.note}</div>
      <div>
        {messages.newBalance} {weiToAudioString(balance)}
      </div>
    </ModalBodyWrapper>
  )
}

export default SendInputSuccess
