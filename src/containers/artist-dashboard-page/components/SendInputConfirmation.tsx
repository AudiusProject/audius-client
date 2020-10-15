import { Button } from '@audius/stems'
import BN from 'bn.js'
import React from 'react'
import { WalletAddress } from 'store/wallet/slice'
import { ModalBodyWrapper } from '../WalletModal'

const messages = {
  title: "YOU'RE ABOUT TO SEND",
  sendButton: 'SEND $AUDIO'
}

type SendInputConfirmationProps = {
  balance: BN
  amountToTransfer: BN
  recipientAddress: WalletAddress
  onSend: () => void
}

const SendInputConfirmation = ({
  balance,
  amountToTransfer,
  recipientAddress,
  onSend
}: SendInputConfirmationProps) => {
  return (
    <ModalBodyWrapper>
      {messages.title}
      {/* ValSlider goes here! */}
      {`${amountToTransfer.toString()} $AUDIO`}${recipientAddress}
      <Button text={messages.sendButton} onClick={onSend} />
    </ModalBodyWrapper>
  )
}

export default SendInputConfirmation
