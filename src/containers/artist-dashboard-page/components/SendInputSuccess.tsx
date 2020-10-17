import React from 'react'
import { WalletAddress, formatWei, BNWei } from 'store/wallet/slice'

import { ModalBodyTitle, ModalBodyWrapper } from '../WalletModal'
import DisplayAudio from './DisplayAudio'
import { AddressWithArrow } from './SendInputConfirmation'
import PurpleBox from './PurpleBox'

import styles from './SendInputSuccess.module.css'
import TokenHoverTooltip from './TokenHoverTooltip'

type SendInputSuccessProps = {
  sentAmount: BNWei
  recipientAddress: WalletAddress
  balance: BNWei
}

const messages = {
  success: 'YOU HAVE SUCCESSFULLY SENT',
  note: 'Note: The $AUDIO may take a couple minutes to show up',
  newBalance: 'YOUR BALANCE IS NOW',
  currency: '$AUDIO'
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
      <PurpleBox
        className={styles.box}
        label={messages.newBalance}
        text={
          <>
            <TokenHoverTooltip balance={balance}>
              <span className={styles.amount}>{formatWei(balance, true)}</span>
            </TokenHoverTooltip>
            <span className={styles.label}>{messages.currency}</span>
          </>
        }
      />
    </ModalBodyWrapper>
  )
}

export default SendInputSuccess
