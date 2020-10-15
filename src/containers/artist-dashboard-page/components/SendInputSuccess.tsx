import BN from 'bn.js'
import React from 'react'
import { WalletAddress } from 'store/wallet/slice'
import { ModalBodyWrapper } from '../WalletModal'

type SendInputSuccessProps = {
  sentAmount: BN
  recipientAddress: WalletAddress
  balance: BN
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
      {messages.success}
      {`${sentAmount.toString()} $AUDIO`}
      {recipientAddress}
      {messages.note}
      <div>
        {messages.newBalance}
        {balance.toString()}
      </div>
    </ModalBodyWrapper>
  )
}

export default SendInputSuccess
