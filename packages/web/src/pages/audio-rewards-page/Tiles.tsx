import { useCallback, ReactNode } from 'react'

import {
  formatWei,
  tokenDashboardPageActions,
  tokenDashboardPageSelectors,
  walletSelectors
} from '@audius/common'
import { Button, ButtonType, IconInfo } from '@audius/stems'
import cn from 'classnames'
import { useDispatch } from 'react-redux'

import { ReactComponent as IconReceive } from 'assets/img/iconReceive.svg'
import { ReactComponent as IconSend } from 'assets/img/iconSend.svg'
import { useModalState } from 'common/hooks/useModalState'
import MobileConnectWalletsDrawer from 'components/mobile-connect-wallets-drawer/MobileConnectWalletsDrawer'
import { useWithMobileStyle } from 'hooks/useWithMobileStyle'
import { isMobile } from 'utils/clientUtil'
import { useSelector } from 'utils/reducer'

import styles from './Tiles.module.css'
import TokenHoverTooltip from './components/TokenHoverTooltip'
const { getAccountBalance, getAccountTotalBalance } = walletSelectors
const { getHasAssociatedWallets } = tokenDashboardPageSelectors
const { pressConnectWallets, pressReceive, pressSend } =
  tokenDashboardPageActions

const messages = {
  noClaim1: 'You earn $AUDIO by using Audius.',
  noClaim2: 'The more you use Audius, the more $AUDIO you earn.',
  balance: '$AUDIO BALANCE',
  receiveLabel: 'RECEIVE $AUDIO',
  sendLabel: 'SEND $AUDIO',
  audio: '$AUDIO',
  manageWallets: 'Manage Wallets',
  totalAudio: 'Total $AUDIO'
}

export const LEARN_MORE_URL = 'http://blog.audius.co/posts/community-meet-audio'

type TileProps = {
  className?: string
  children: ReactNode
}

export const Tile = ({ className, children }: TileProps) => {
  return (
    <div className={cn([styles.tileContainer, className])}> {children}</div>
  )
}

export const BalanceTile = ({ className }: { className?: string }) => {
  const totalBalance = useSelector(getAccountTotalBalance)
  const hasMultipleWallets = useSelector(getHasAssociatedWallets)

  const [, setOpen] = useModalState('AudioBreakdown')
  const onClickOpen = useCallback(() => {
    setOpen(true)
  }, [setOpen])

  const wm = useWithMobileStyle(styles.mobile)

  return (
    <Tile className={wm(styles.balanceTile, className)}>
      <>
        <TokenHoverTooltip balance={totalBalance}>
          <div className={cn(styles.balanceAmount)}>
            {formatWei(totalBalance, true, 0)}
          </div>
        </TokenHoverTooltip>
        <div className={styles.balance}>
          {hasMultipleWallets ? (
            <div onClick={onClickOpen}>
              {messages.totalAudio}
              <IconInfo className={styles.iconInfo} />
            </div>
          ) : (
            messages.audio
          )}
        </div>
      </>
    </Tile>
  )
}

export const WalletTile = ({ className }: { className?: string }) => {
  const balance = useSelector(getAccountBalance)
  const hasBalance = balance && !balance.isZero()
  const dispatch = useDispatch()
  const [, openTransferDrawer] = useModalState('TransferAudioMobileWarning')

  const mobile = isMobile()
  const onClickReceive = useCallback(() => {
    if (mobile) {
      openTransferDrawer(true)
    } else {
      dispatch(pressReceive())
    }
  }, [dispatch, mobile, openTransferDrawer])

  const onClickSend = useCallback(() => {
    if (mobile) {
      openTransferDrawer(true)
    } else {
      dispatch(pressSend())
    }
  }, [mobile, dispatch, openTransferDrawer])
  const [, setOpen] = useModalState('MobileConnectWalletsDrawer')

  const onClickConnectWallets = useCallback(() => {
    if (mobile) {
      setOpen(true)
    } else {
      dispatch(pressConnectWallets())
    }
  }, [mobile, setOpen, dispatch])

  const onCloseConnectWalletsDrawer = useCallback(() => {
    setOpen(false)
  }, [setOpen])

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
          <Button
            className={cn(styles.balanceBtn, styles.connectWalletsBtn)}
            text={messages.manageWallets}
            includeHoverAnimations
            textClassName={styles.textClassName}
            onClick={onClickConnectWallets}
            type={ButtonType.GLASS}
          />
          {mobile && (
            <MobileConnectWalletsDrawer onClose={onCloseConnectWalletsDrawer} />
          )}
        </div>
      </>
    </Tile>
  )
}
