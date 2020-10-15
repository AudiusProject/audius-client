import TwitterButton from 'components/general/TwitterButton'
import React from 'react'
import { BNWei } from 'store/wallet/slice'
import { ModalBodyWrapper } from '../WalletModal'
import DisplayAudio from './DisplayAudio'

const messages = {
  newBalance: 'Your $AUDIO balance is now:',
  subtitle:
    'You now own a small part of Audius. You can earn more just by using the platform and contributing to its success!'
}
type ClaimSuccessBodyProps = { balance: BNWei }

const ClaimSuccessBody = ({ balance }: ClaimSuccessBodyProps) => {
  return (
    <ModalBodyWrapper>
      {messages.newBalance}
      <DisplayAudio amount={balance} />
      {messages.subtitle}
      <TwitterButton />
    </ModalBodyWrapper>
  )
}

export default ClaimSuccessBody
