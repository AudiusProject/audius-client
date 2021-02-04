import React, { useCallback } from 'react'
import { Button, ButtonSize, ButtonType, Modal } from '@audius/stems'
import { Tier } from 'containers/artist-dashboard-page/Tiers'

import styles from './TierExplainerModal.module.css'
import { useSelector } from 'utils/reducer'
import {
  getModalVisibility,
  setVisibility
} from 'store/application/ui/modals/slice'
import { useDispatch } from 'react-redux'
import { useProfileTier } from './hooks'

export const messages = {
  title: '$AUDIO VIP Tiers',
  desc1: 'Unlock $AUDIO VIP Tiers by simply holding more $AUDIO.',
  desc2:
    'Advancing to a new tier will earn you a profile badge, visible throughout the app, and unlock various new features, as they are released.',
  learnMore: 'LEARN MORE'
}

const TierExplainerModal = () => {
  const dispatch = useDispatch()
  const tier = useProfileTier()

  const isOpen = useSelector(state =>
    getModalVisibility(state, 'TiersExplainer')
  )

  const handleDismiss = useCallback(() => {
    dispatch(setVisibility({ modal: 'TiersExplainer', visible: false }))
  }, [dispatch])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDismiss}
      bodyClassName={styles.modalBody}
      showTitleHeader
      title={messages.title}
      showDismissButton
      dismissOnClickOutside
      contentHorizontalPadding={48}
    >
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.textContainer}>
            {messages.desc1}
            <br />
            <br />
            {messages.desc2}
          </div>
          <Button
            type={ButtonType.PRIMARY_ALT}
            size={ButtonSize.MEDIUM}
            text={messages.learnMore}
            className={styles.button}
          />
        </div>
        {tier !== 'none' && <Tier isCompact tier={tier} />}
      </div>
    </Modal>
  )
}

export default TierExplainerModal
