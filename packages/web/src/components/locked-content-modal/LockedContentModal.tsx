import { useCallback } from 'react'

import {
  premiumContentActions,
  useLockedContent,
  usePremiumContentAccess
} from '@audius/common'
import { IconLock, ModalContent, ModalHeader, ModalTitle } from '@audius/stems'
import cn from 'classnames'
import { useDispatch } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { LockedTrackDetailsTile } from 'components/track/LockedTrackDetailsTile'
import { PremiumTrackSection } from 'components/track/PremiumTrackSection'
import ModalDrawer from 'pages/audio-rewards-page/components/modals/ModalDrawer'
import { isMobile } from 'utils/clientUtil'

import styles from './LockedContentModal.module.css'

const { resetLockedContentId } = premiumContentActions

const messages = {
  howToUnlock: 'HOW TO UNLOCK'
}

export const LockedContentModal = () => {
  const [isOpen, setIsOpen] = useModalState('LockedContent')
  const dispatch = useDispatch()
  const { id, track, owner } = useLockedContent()
  const { doesUserHaveAccess } = usePremiumContentAccess(track)

  const handleClose = useCallback(() => {
    setIsOpen(false)
    dispatch(resetLockedContentId())
  }, [setIsOpen, dispatch])

  const mobile = isMobile()

  return (
    <ModalDrawer
      isOpen={isOpen}
      onClose={handleClose}
      bodyClassName={styles.modalBody}
      dismissOnClickOutside
      isFullscreen={false}
      useGradientTitle={false}
    >
      <ModalHeader
        className={cn(styles.modalHeader, { [styles.mobile]: mobile })}
        onClose={handleClose}
        dismissButtonClassName={styles.modalHeaderDismissButton}
        showDismissButton={!mobile}
      >
        <ModalTitle
          title={messages.howToUnlock}
          icon={<IconLock className={styles.modalTitleIcon} />}
        />
      </ModalHeader>
      <ModalContent>
        {id && track && track.premium_conditions && owner && (
          <div>
            <LockedTrackDetailsTile trackId={id} />
            <PremiumTrackSection
              isLoading={false}
              trackId={track.track_id}
              premiumConditions={track.premium_conditions}
              doesUserHaveAccess={doesUserHaveAccess}
              isOwner={false}
              wrapperClassName={styles.premiumTrackSectionWrapper}
              className={styles.premiumTrackSection}
              buttonClassName={styles.premiumTrackSectionButton}
              ownerId={owner.user_id}
            />
          </div>
        )}
      </ModalContent>
    </ModalDrawer>
  )
}
