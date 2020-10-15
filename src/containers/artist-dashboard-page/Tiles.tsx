import React from 'react'
import styles from './Tiles.module.css'
import cn from 'classnames'
import { useSelector } from 'utils/reducer'
import { getAccountBalance, getClaimableBalance } from 'store/wallet/slice'
import BN from 'bn.js'
import { Button } from '@audius/stems'
import { useDispatch } from 'react-redux'
import {
  pressClaim,
  pressReceive,
  pressSend
} from 'store/token-dashboard/slice'

const messages = {
  claimCTA: 'CLAIM $AUDIO',
  balance: '$AUDIO BALANCE',
  receiveLabel: 'RECEIVE',
  sendLabel: 'SEND'
}

type TileProps = {
  className?: string
  children: React.ReactChild
}

const Tile = ({ className, children }: TileProps) => {
  return (
    <div className={cn([styles.tileContainer, className])}> {children}</div>
  )
}

export const ClaimTile = ({ className }: { className?: string }) => {
  const unclaimedAudio = useSelector(getClaimableBalance) ?? new BN(0)

  const dispatch = useDispatch()
  const onClick = () => dispatch(pressClaim())

  return (
    <Tile className={cn([styles.claimTile, className])}>
      <>
        <div> {unclaimedAudio.toString()}</div>
        <Button text={messages.claimCTA} onClick={onClick} />
      </>
    </Tile>
  )
}

export const WalletTile = ({ className }: { className?: string }) => {
  const balance = useSelector(getAccountBalance) ?? new BN(0)

  const dispatch = useDispatch()

  const onClickReceive = () => dispatch(pressReceive())
  const onClickSend = () => dispatch(pressSend())

  return (
    <Tile className={cn([styles.walletTile, className])}>
      <>
        <div>{balance.toString()}</div>
        {messages.balance}
        <div>
          <Button text={messages.receiveLabel} onClick={onClickReceive} />
          <Button text={messages.sendLabel} onClick={onClickSend} />
        </div>
      </>
    </Tile>
  )
}

export const ExplainerTile = ({ className }: { className?: string }) => {
  return (
    <Tile className={cn([styles.explainerTile, className])}>
      <div> Explainy boi</div>
    </Tile>
  )
}
