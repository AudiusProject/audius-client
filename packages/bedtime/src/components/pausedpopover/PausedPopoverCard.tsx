import { h } from 'preact'
import IconRemove from '../../assets/img/iconRemove.svg'
import Artwork from '../artwork/Artwork'
import AudiusLogo from './AudiusLogo'
import ListenOnAudiusCTA from './ListenOnAudiusCTA'
import PrimaryLabel from './PrimaryLabel'

import styles from './PausedPopoverCard.module.css'

interface PausedPopoverCardProps {
  artworkURL: string
  artworkClickURL: string
  listenOnAudiusURL: string
  onClickDismiss: () => void
}

const PausedPopoverCard = ({
  artworkURL,
  artworkClickURL,
  listenOnAudiusURL,
  onClickDismiss
}: PausedPopoverCardProps) => {
  return (
    <div className={styles.container}>
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
      <div className={styles.label}>
        <PrimaryLabel/>
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

