import { useCallback, useMemo } from 'react'

import {
  FeatureFlags,
  PremiumConditions,
  accountSelectors,
} from '@audius/common'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  IconHidden,
  ButtonType,
  Button
} from '@audius/stems'
import cn from 'classnames'
import { useSelector } from 'react-redux'

import { useFlag } from 'hooks/useRemoteConfig'

import { AvailabilityType, TrackMetadataState } from './types'

import styles from './TrackAvailabilityModal.module.css'
import { CollectibleGatedAvailability } from './CollectibleGatedAvailability'
import { SpecialAccessAvailability } from './SpecialAccessAvailability'
import { HiddenAvailability } from './HiddenAvailability'
import { PublicAvailability } from './PublicAvailability'

const { getUserId } = accountSelectors

const messages = {
  title: 'AVAILABILITY',
  hideTrack: 'Hide Track',
  done: 'Done'
}

const defaultAvailabilityFields = {
  is_premium: false,
  premium_conditions: null,
  unlisted: false,
  genre: true,
  mood: true,
  tags: true,
  plays: false,
  share: false
}

type TrackAvailabilityModalProps = {
  isOpen: boolean
  metadataState: TrackMetadataState
  didUpdateState: (newState: TrackMetadataState) => void
  onClose: () => void
}

// A modal that allows you to set a track as collectible-gated, special access, or unlisted,
// as well as toggle individual unlisted metadata field visibility.
const TrackAvailabilityModal = ({
  isOpen,
  metadataState,
  didUpdateState,
  onClose
}: TrackAvailabilityModalProps) => {
  const { isEnabled: isNFTGateEnabled } = useFlag(FeatureFlags.NFT_GATE_ENABLED)
  const { isEnabled: isSpecialAccessGateEnabled } = useFlag(
    FeatureFlags.SPECIAL_ACCESS_GATE_ENABLED
  )

  const accountUserId = useSelector(getUserId)
  const defaultSpecialAccess = useMemo(
    () => (accountUserId ? { follow_user_id: accountUserId } : null),
    [accountUserId]
  )

  let availability = AvailabilityType.PUBLIC
  if (metadataState.unlisted) {
    availability = AvailabilityType.HIDDEN
  } else if (
    metadataState.is_premium &&
    metadataState.premium_conditions &&
    'nft_collection' in metadataState.premium_conditions
  ) {
    availability = AvailabilityType.COLLECTIBLE_GATED
  } else if (metadataState.is_premium) {
    availability = AvailabilityType.SPECIAL_ACCESS
  }

  const handleSelection = useCallback(
    (availability: AvailabilityType) => {
      if (availability === AvailabilityType.PUBLIC) {
        didUpdateState({ ...defaultAvailabilityFields })
      } else if (availability === AvailabilityType.SPECIAL_ACCESS) {
        didUpdateState({
          ...defaultAvailabilityFields,
          is_premium: true,
          premium_conditions:
            'nft_collection' in (metadataState.premium_conditions ?? {})
              ? defaultSpecialAccess
              : metadataState?.premium_conditions ?? defaultSpecialAccess
        })
      } else if (availability === AvailabilityType.COLLECTIBLE_GATED) {
        didUpdateState({
          ...defaultAvailabilityFields,
          is_premium: true,
          premium_conditions: { nft_collection: undefined }
        })
      } else {
        didUpdateState({
          ...defaultAvailabilityFields,
          unlisted: true
        })
      }
    },
    [didUpdateState, metadataState, defaultSpecialAccess]
  )

  const updateHiddenField = useCallback(
    (field: string) => (visible: boolean) => {
      didUpdateState({
        ...metadataState,
        [field]: visible
      })
    },
    [didUpdateState, metadataState]
  )

  const updatePremiumContentFields = useCallback(
    (premiumConditions: PremiumConditions) => {
      didUpdateState({
        ...metadataState,
        premium_conditions: premiumConditions
      })
    },
    [didUpdateState, metadataState]
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      wrapperClassName={styles.modalWrapper}
    >
      <ModalHeader
        className={styles.modalHeader}
        onClose={onClose}
        dismissButtonClassName={styles.modalHeaderDismissButton}
      >
        <ModalTitle
          title={messages.title}
          icon={<IconHidden className={styles.modalTitleIcon} />}
        />
      </ModalHeader>
      <ModalContent className={styles.content}>
        <PublicAvailability
          selected={availability === AvailabilityType.PUBLIC}
          metadataState={metadataState}
          handleSelection={handleSelection}
        />
        {isSpecialAccessGateEnabled && (
          <SpecialAccessAvailability
            selected={availability === AvailabilityType.SPECIAL_ACCESS}
            metadataState={metadataState}
            handleSelection={handleSelection}
            updatePremiumContentFields={updatePremiumContentFields}
          />
        )}
        {isNFTGateEnabled && (
          <CollectibleGatedAvailability
            selected={availability === AvailabilityType.COLLECTIBLE_GATED}
            metadataState={metadataState}
            handleSelection={handleSelection}
            updatePremiumContentFields={updatePremiumContentFields}
          />
        )}
        <HiddenAvailability
          selected={availability === AvailabilityType.HIDDEN}
          metadataState={metadataState}
          handleSelection={handleSelection}
          updateHiddenField={updateHiddenField}
        />
        <div className={styles.doneButtonContainer}>
          <Button
            type={ButtonType.PRIMARY_ALT}
            textClassName={cn(styles.doneButton)}
            text={messages.done}
            onClick={onClose}
          />
        </div>
      </ModalContent>
    </Modal>
  )
}

export default TrackAvailabilityModal
