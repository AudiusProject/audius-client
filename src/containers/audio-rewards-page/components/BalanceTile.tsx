import React from 'react'
import styles from './BalanceTile.module.css'
import cn from 'classnames'
import { useSelector } from 'utils/reducer'
import {
  getAccountBalance,
  getAccountTotalBalance,
  formatWei,
  BNWei
} from 'store/wallet/slice'
import BN from 'bn.js'
import TokenHoverTooltip from './TokenHoverTooltip'
import { getAssociatedWallets } from 'store/token-dashboard/slice'

const messages = {
  audio: '$AUDIO',
  multipleWallets: 'Total $AUDIO across Wallets: '
}

type TileProps = {
  className?: string
}

export const Tile: React.FC<TileProps> = ({ className, children }) => {
  return (
    <div className={cn([styles.tileContainer, className])}> {children}</div>
  )
}

export const BalanceTile = ({ className }: { className?: string }) => {
  const balance = useSelector(getAccountBalance) ?? (new BN(0) as BNWei)
  const totalBalance =
    useSelector(getAccountTotalBalance) ?? (new BN(0) as BNWei)
  const { connectedWallets: wallets } = useSelector(getAssociatedWallets)
  const hasMultipleWallets = (wallets?.length ?? 0) > 0

  return (
    <Tile className={cn([styles.container, className])}>
      <>
        <TokenHoverTooltip balance={balance}>
          <div className={styles.balanceAmount}>{formatWei(balance, true)}</div>
        </TokenHoverTooltip>
        <div className={styles.balanceLabel}>{messages.audio}</div>
        {hasMultipleWallets && (
          <div className={styles.multipleWalletsContainer}>
            <span className={styles.multipleWalletsMessage}>
              {messages.multipleWallets}
            </span>
            <TokenHoverTooltip balance={totalBalance}>
              <span className={styles.totalBalance}>
                {formatWei(totalBalance, true)}
              </span>
            </TokenHoverTooltip>
          </div>
        )}
      </>
    </Tile>
  )
}

export default BalanceTile
