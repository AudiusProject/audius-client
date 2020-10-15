import BN from 'bn.js'
import TwitterButton from 'components/general/TwitterButton'
import React from 'react'
import { ModalBodyWrapper } from '../WalletModal'

const messages = {
  newBalance: 'Your $AUDIO balance is now:',
  subtitle:
    'You now own a small part of Audius. You can earn more just by using the platform and contributing to its success!'
}
type ClaimSuccessBodyProps = { balance: BN }

const ClaimSuccessBody = ({ balance }: ClaimSuccessBodyProps) => {
  return (
    <ModalBodyWrapper>
      {messages.newBalance}
      {`${balance.toString()} $AUDIO`}
      {messages.subtitle}
      <TwitterButton />
    </ModalBodyWrapper>
  )
}

export default ClaimSuccessBody
