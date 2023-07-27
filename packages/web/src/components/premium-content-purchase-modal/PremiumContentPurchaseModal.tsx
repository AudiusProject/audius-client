import { useCallback } from 'react'

import { premiumContentSelectors, useGetTrackById } from '@audius/common'
import { IconCart, Modal, ModalContentPages, ModalHeader } from '@audius/stems'
import cn from 'classnames'
import { useSelector } from 'react-redux'

// import { buyAudioSelectors, BuyAudioStage } from '@audius/common'
// import { useSelector } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { Icon } from 'components/Icon'
import typeStyles from 'components/typography/typography.module.css'

import styles from './PremiumContentPurchaseModal.module.css'
import { LoadingPage } from './components/LoadingPage'
import { PurchaseDetailsPage } from './components/PurchaseDetailsPage'

const { getPurchaseContentId } = premiumContentSelectors

const messages = {
  completePurchase: 'Complete Purchase'
}

enum PurchaseSteps {
  LOADING = 0,
  DETAILS = 1
}

export const PremiumContentPurchaseModal = () => {
  const [isOpen, setIsOpen] = useModalState('PremiumContentPurchase')
  const trackId = useSelector(getPurchaseContentId)
  const { data: track } = useGetTrackById(
    { id: trackId! },
    { disabled: !trackId }
  )

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const currentStep = !track ? PurchaseSteps.LOADING : PurchaseSteps.DETAILS

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      bodyClassName={styles.modal}
      dismissOnClickOutside
    >
      <ModalHeader onClose={handleClose} showDismissButton>
        <div
          className={cn(
            styles.title,
            typeStyles.labelXLarge,
            typeStyles.labelStrong
          )}
        >
          <Icon size='large' icon={IconCart} />
          {messages.completePurchase}
        </div>
      </ModalHeader>
      {track ? (
        <ModalContentPages currentPage={currentStep}>
          <LoadingPage />
          <PurchaseDetailsPage track={track} />
        </ModalContentPages>
      ) : null}
    </Modal>
  )
}
