import React from 'react'
import { WalletAddress } from 'store/wallet/slice'
import { ModalBodyWrapper } from '../WalletModal'

type ReceiveBodyProps = { wallet: WalletAddress }

const messages = {
  warning: 'PROCEED WITH CAUTION',
  warning2: 'If $AUDIO is sent to the wrong address it will be lost.',
  warning3: "Don't attempt to send tokens other than $AUDIO to this address.",
  yourAddress: 'YOUR ADDRESS'
}

const ReceiveBody = ({ wallet }: ReceiveBodyProps) => {
  return (
    <ModalBodyWrapper>
      {messages.warning}
      {messages.warning2}
      {messages.warning3}
      <div>
        {messages.yourAddress}
        {wallet}
      </div>
    </ModalBodyWrapper>
  )
}

export default ReceiveBody
