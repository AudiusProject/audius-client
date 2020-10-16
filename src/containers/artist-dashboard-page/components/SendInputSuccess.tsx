import React from 'react'
import { BNWei, WalletAddress, formatWei } from 'store/wallet/slice'
import { formatAudio } from 'utils/formatUtil'
import { ModalBodyTitle, ModalBodyWrapper } from '../WalletModal'
import Tooltip from 'components/tooltip/Tooltip'
import DisplayAudio from './DisplayAudio'
import { AddressWithArrow } from './SendInputConfirmation'
import PurpleBox from './PurpleBox'

import styles from './SendInputSuccess.module.css'

type SendInputSuccessProps = {
  sentAmount: BNWei
  recipientAddress: WalletAddress
  balance: BNWei
}

const messages = {
  success: 'You have successfully sent',
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
            <Tooltip
              text={formatWei(balance)}
              className={styles.tooltip}
              placement={'top'}
              mount={'parent'}
              mouseEnterDelay={0.2}
            >
              <span className={styles.amount}>{formatAudio(balance)}</span>
            </Tooltip>
            <span className={styles.label}>{messages.currency}</span>
          </>
        }
      />
    </ModalBodyWrapper>
  )
}

export default SendInputSuccess
