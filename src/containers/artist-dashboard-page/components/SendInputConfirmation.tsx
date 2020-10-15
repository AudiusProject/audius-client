import { Button } from '@audius/stems'
import React from 'react'
import { BNWei, WalletAddress } from 'store/wallet/slice'
import { ModalBodyWrapper } from '../WalletModal'
import DisplayAudio from './DisplayAudio'

const messages = {
  title: "YOU'RE ABOUT TO SEND",
  sendButton: 'SEND $AUDIO'
}

type SendInputConfirmationProps = {
  amountToTransfer: BNWei
  recipientAddress: WalletAddress
  onSend: () => void
}

const SendInputConfirmation = ({
  amountToTransfer,
  recipientAddress,
  onSend
}: SendInputConfirmationProps) => {
  return (
    <ModalBodyWrapper>
      {messages.title}
      {/* ValSlider goes here! */}
      <DisplayAudio amount={amountToTransfer} />
      <div>{recipientAddress}</div>
      <Button text={messages.sendButton} onClick={onSend} />
    </ModalBodyWrapper>
  )
}

export default SendInputConfirmation
