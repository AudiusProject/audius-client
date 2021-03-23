import React from 'react'
import styles from './Tiles.module.css'
import cn from 'classnames'
import { useSelector } from 'utils/reducer'
import { getAccountBalance, formatWei, BNWei } from 'store/wallet/slice'
import BN from 'bn.js'
import { Button, ButtonType } from '@audius/stems'
import { useDispatch } from 'react-redux'
import { ReactComponent as IconSend } from 'assets/img/iconSend.svg'
import { ReactComponent as IconReceive } from 'assets/img/iconReceive.svg'
import { pressReceive, pressSend } from 'store/token-dashboard/slice'
import TokenHoverTooltip from './components/TokenHoverTooltip'

const messages = {
  noClaim1: 'You earn $AUDIO by using Audius.',
  noClaim2: 'The more you use Audius, the more $AUDIO you earn.',
  balance: '$AUDIO BALANCE',
  receiveLabel: 'RECEIVE $AUDIO',
  sendLabel: 'SEND $AUDIO',
  audio: '$AUDIO'
}

export const LEARN_MORE_URL = 'http://blog.audius.co/posts/community-meet-audio'

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

  return (
    <Tile className={cn([styles.balanceTile, className])}>
      <>
        <TokenHoverTooltip balance={balance}>
          <div className={styles.balanceAmount}>{formatWei(balance, true)}</div>
        </TokenHoverTooltip>
        <div className={styles.balance}>{messages.audio}</div>
      </>
    </Tile>
  )
}

export const WalletTile = ({ className }: { className?: string }) => {
  const balance = useSelector(getAccountBalance) ?? (new BN(0) as BNWei)
  const hasBalance = balance && !balance.isZero()
  const dispatch = useDispatch()

  const onClickReceive = () => dispatch(pressReceive())
  const onClickSend = () => dispatch(pressSend())

  return (
    <Tile className={cn([styles.walletTile, className])}>
      <>
        <div className={styles.buttons}>
          <Button
            className={cn(styles.balanceBtn, {
              [styles.balanceDisabled]: !hasBalance
            })}
            text={messages.sendLabel}
            isDisabled={!hasBalance}
            includeHoverAnimations={hasBalance}
            textClassName={styles.textClassName}
            onClick={onClickSend}
            leftIcon={<IconSend className={styles.iconStyle} />}
            type={ButtonType.GLASS}
          />
          <Button
            className={cn(styles.balanceBtn, styles.receiveBtn)}
            text={messages.receiveLabel}
            textClassName={styles.textClassName}
            onClick={onClickReceive}
            leftIcon={<IconReceive className={styles.iconStyle} />}
            type={ButtonType.GLASS}
          />
        </div>
      </>
    </Tile>
  )
}
