import React from 'react'

import Tooltip from 'components/tooltip/Tooltip'
import { BNWei } from 'store/wallet/types'
import { formatWei } from 'utils/wallet'

type TokenHoverTooltipProps = {
  children: React.ReactNode
  balance: BNWei
  parentMount?: boolean
}

const TokenHoverTooltip = ({
  balance,
  children,
  parentMount = false
}: TokenHoverTooltipProps) => {
  return (
    <Tooltip
      text={`${formatWei(balance)} $AUDIO`}
      disabled={balance.isZero()}
      placement='top'
      mouseEnterDelay={0.2}
      mount={parentMount ? 'parent' : undefined}
    >
      {children}
    </Tooltip>
  )
}

export default TokenHoverTooltip
