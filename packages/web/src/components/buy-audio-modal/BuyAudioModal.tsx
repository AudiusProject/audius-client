import { useCallback } from 'react'

import { buyAudioSelectors, BuyAudioStage } from '@audius/common'
import {
  Modal,
  ModalContentPages,
  ModalHeader,
  ModalTitle
} from '@audius/stems'
import { useSelector } from 'react-redux'

import IconGoldBadgeSrc from 'assets/img/tokenBadgeGold40@2x.png'
import { useModalState } from 'common/hooks/useModalState'

import styles from './BuyAudioModal.module.css'
import { AmountInputPage } from './components/AmountInputPage'
import { InProgressPage } from './components/InProgressPage'
import { SuccessPage } from './components/SuccessPage'

const { getBuyAudioFlowStage, getBuyAudioProvider, getBuyAudioFlowError } =
  buyAudioSelectors

const messages = {
  buyAudio: 'Buy $AUDIO'
}

const IconGoldBadge = () => (
  <img
    draggable={false}
    src={IconGoldBadgeSrc}
    alt='Gold Badge Icon'
    width={24}
    height={24}
  />
)

const stageToPage = (stage: BuyAudioStage) => {
  switch (stage) {
    case BuyAudioStage.START:
      return 0
    case BuyAudioStage.PURCHASING:
    case BuyAudioStage.CONFIRMING_PURCHASE:
    case BuyAudioStage.SWAPPING:
    case BuyAudioStage.CONFIRMING_SWAP:
    case BuyAudioStage.TRANSFERRING:
      return 1
    case BuyAudioStage.FINISH:
      return 2
  }
}

export const BuyAudioModal = () => {
  const [isOpen, setIsOpen] = useModalState('BuyAudio')
  const stage = useSelector(getBuyAudioFlowStage)
  const provider = useSelector(getBuyAudioProvider)
  const error = useSelector(getBuyAudioFlowError)
  const currentPage = stageToPage(stage)
  const inProgress = currentPage === 1

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  if (provider === undefined && isOpen) {
    console.error('BuyAudio modal opened without a provider. Aborting...')
    return null
  }

  return (
    <Modal
      isOpen={isOpen && provider !== undefined}
      onClose={handleClose}
      bodyClassName={styles.modal}
      dismissOnClickOutside={!inProgress || error}
    >
      <ModalHeader
        onClose={handleClose}
        showDismissButton={!inProgress || error}
      >
        <ModalTitle title={messages.buyAudio} icon={<IconGoldBadge />} />
      </ModalHeader>
      <ModalContentPages
        contentClassName={styles.modalContent}
        currentPage={currentPage}
      >
        <AmountInputPage />
        <InProgressPage />
        <SuccessPage />
      </ModalContentPages>
    </Modal>
  )
}
