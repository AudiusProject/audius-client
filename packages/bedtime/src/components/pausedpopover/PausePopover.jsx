import { h } from 'preact'
import { useContext } from 'preact/hooks'
import cn from 'classnames'
import IconRemove from '../../assets/img/iconRemove.svg'
import Artwork from '../artwork/Artwork'
import AudiusLogo from './AudiusLogo'
import ListenOnAudiusCTA from './ListenOnAudiusCTA'
import PrimaryLabel from './PrimaryLabel'
import { CSSTransition } from 'react-transition-group'
import { PauseContext } from './PauseProvider'
import { PlayerFlavor } from '../app'

import styles from './PausePopover.module.css'
import pauseTransitions from './PauseTransitions.module.css'

// TODO: proptypes
// interface PausedPopoverCardProps {
//   artworkURL: string
//   artworkClickURL: string
//   listenOnAudiusURL: string
//   onClickDismiss: () => void
//   flavor: Flavor
// }

const PausedPopoverCard = ({
  artworkURL,
  artworkClickURL,
  listenOnAudiusURL,
  flavor,
}) => {
  const { popoverVisibility, setPopoverVisibility } = useContext(PauseContext)

  return (
      <CSSTransition
        in={popoverVisibility}
        mountOnEnter
        unmountOnExit
        timeout={1000}
        classNames={pauseTransitions}
      >
        <div className={styles.container}>
        { (flavor === PlayerFlavor.CARD) &&
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
        <div className={cn(styles.label, { [styles.compactLabel]: flavor === PlayerFlavor.COMPACT})}>
          <PrimaryLabel
            className={flavor === PlayerFlavor.COMPACT ? styles.compactLabelFont : undefined}
          />
        </div>
        <ListenOnAudiusCTA
          audiusURL={listenOnAudiusURL}
        />
        <div
          className={styles.dismissIcon}
          onClick={() => setPopoverVisibility(false)}
        >
          <IconRemove />
        </div>
        </div>
      </CSSTransition>
  )
}

export default PausedPopoverCard

