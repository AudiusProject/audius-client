import React from 'react'
import styles from './Tiles.module.css'
import cn from 'classnames'

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
  return (
    <Tile className={cn([styles.claimTile, className])}>
      <div> Claimy boi</div>
    </Tile>
  )
}

export const WalletTile = ({ className }: { className?: string }) => {
  return (
    <Tile className={cn([styles.walletTile, className])}>
      <div> WalletBoi boi</div>
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
