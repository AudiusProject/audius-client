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

const PausedPopoverCard = ({
  artworkURL,
  artworkClickURL,
  listenOnAudiusURL,
  flavor,
  isMobileWebTwitter
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
        <div
          className={styles.container}
          // Ensure that when the popover
          // is animating out, it's not clickable.
          style={popoverVisibility
            ? {}
            : { pointerEvents: 'none' }
          }
        >
        { (flavor === PlayerFlavor.CARD) &&
          <>
            <div className={styles.logo}>
              <AudiusLogo />
            </div>
            { !isMobileWebTwitter && <Artwork
              artworkURL={artworkURL}
              onClickURL={artworkClickURL}
              className={styles.artworkSizing}
            /> }
          </>
        }
        <PrimaryLabel
          className={flavor === PlayerFlavor.COMPACT ? styles.compactLabelFont : undefined}
        />
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
