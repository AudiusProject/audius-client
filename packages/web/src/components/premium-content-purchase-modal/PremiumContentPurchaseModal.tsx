import { useCallback } from 'react'

import { IconCart, Modal, ModalContentPages, ModalHeader } from '@audius/stems'
import cn from 'classnames'

// import { buyAudioSelectors, BuyAudioStage } from '@audius/common'
// import { useSelector } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { Icon } from 'components/Icon'
import typeStyles from 'components/typography/typography.module.css'

import styles from './PremiumContentPurchaseModal.module.css'
import { PurchaseDetailsPage } from './components/PurchaseDetailsPage'

// import { AmountInputPage } from './components/AmountInputPage'
// import { InProgressPage } from './components/InProgressPage'
// import { SuccessPage } from './components/SuccessPage'

// const { getBuyAudioFlowStage, getBuyAudioFlowError } = buyAudioSelectors

const messages = {
  completePurchase: 'Complete Purchase'
}

enum PurchaseSteps {
  DETAILS = 1
}

// const stageToPage = (stage: BuyAudioStage) => {
//   switch (stage) {
//     case BuyAudioStage.START:
//       return 0
//     case BuyAudioStage.PURCHASING:
//     case BuyAudioStage.CONFIRMING_PURCHASE:
//     case BuyAudioStage.SWAPPING:
//     case BuyAudioStage.CONFIRMING_SWAP:
//     case BuyAudioStage.TRANSFERRING:
//       return 1
//     case BuyAudioStage.FINISH:
//       return 2
//   }
// }

export const PremiumContentPurchaseModal = () => {
  const [isOpen, setIsOpen] = useModalState('PremiumContentPurchase')
  //   const stage = useSelector(getBuyAudioFlowStage)
  //   const error = useSelector(getBuyAudioFlowError)
  //   const currentPage = stageToPage(stage)
  //   const inProgress = currentPage === 1

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      bodyClassName={styles.modal}
      //   dismissOnClickOutside={!inProgress || error}
    >
      <ModalHeader
        onClose={handleClose}
        // showDismissButton={!inProgress || error}
      >
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
      <ModalContentPages
        // contentClassName={styles.modalContent}
        currentPage={PurchaseSteps.DETAILS}
      >
        <PurchaseDetailsPage />
      </ModalContentPages>
    </Modal>
  )
}
