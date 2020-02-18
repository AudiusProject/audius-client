import cn from 'classnames'
import { h } from 'preact'
import IconRemove from '../../assets/img/iconRemove.svg'
import Artwork from '../artwork/Artwork'
import AudiusLogo from './AudiusLogo'
import ListenOnAudiusCTA from './ListenOnAudiusCTA'
import PrimaryLabel from './PrimaryLabel'

import styles from './PausedPopoverCard.module.css'

export enum Flavor {
  CARD = 'CARD',
  COMPACT = 'COMPACT'
}

interface PausedPopoverCardProps {
  artworkURL: string
  artworkClickURL: string
  listenOnAudiusURL: string
  onClickDismiss: () => void
  flavor: Flavor
}

const PausedPopoverCard = ({
  artworkURL,
  artworkClickURL,
  listenOnAudiusURL,
  onClickDismiss,
  flavor
}: PausedPopoverCardProps) => {
  return (
    <div className={styles.container}>
      { (flavor === Flavor.CARD) && 
        <>
          <div className={styles.logo}>
            <AudiusLogo />
          </div>
          <div className={styles.artwork}>
            <Artwork
              artworkURL={artworkURL}
              onClickURL={artworkClickURL}
              className={styles.artworkSizing}
            />
          </div>
        </>
      }
      <div className={cn(styles.label, { [styles.compactLabel]: flavor === Flavor.COMPACT})}>
        <PrimaryLabel
          className={flavor === Flavor.COMPACT ? styles.compactLabelFont : undefined}
        />
      </div>
      <ListenOnAudiusCTA
        audiusURL={listenOnAudiusURL}
      />
      <div
        className={styles.dismissIcon}
        onClick={onClickDismiss}
      >
        <IconRemove />
      </div>
    </div>
  )
}

export default PausedPopoverCard

