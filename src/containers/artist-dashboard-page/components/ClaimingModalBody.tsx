import BN from 'bn.js'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import React from 'react'
import { ModalBodyWrapper } from '../WalletModal'

import styles from './ClaimingModalBody.module.css'

type ClaimingModalBodyProps = {
  balance: BN
}

const messages = {
  message1:
    "Please don't go anywhere. This may take a couple minutes, but it will be worth it.",
  message2:
    "You now own a small part of Audius. You can earn more just by using the platform and contributing to it's success!"
}

const ClaimingModalBody = ({ balance }: ClaimingModalBodyProps) => {
  return (
    <ModalBodyWrapper>
      {`${balance.toString()} $AUDIO`}
      <LoadingSpinner className={styles.spinner} />
      {messages.message1}
      {messages.message2}
    </ModalBodyWrapper>
  )
}

export default ClaimingModalBody
