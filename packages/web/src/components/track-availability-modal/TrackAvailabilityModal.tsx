import { ChangeEvent, useCallback, useMemo, useState } from 'react'

import {
  FeatureFlags,
  PremiumConditions,
  accountSelectors,
  TrackAvailabilityType,
  collectiblesSelectors,
  Nullable,
  Track
} from '@audius/common'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  IconHidden,
  ButtonType,
  Button,
  RadioButtonGroup,
  IconSpecialAccess,
  IconVisibilityPublic,
  IconCollectible,
  IconArrow
} from '@audius/stems'
import cn from 'classnames'
import { useSelector } from 'react-redux'

import { HelpCallout } from 'components/help-callout/HelpCallout'
import { ModalRadioItem } from 'components/modal-radio/ModalRadioItem'
import { useFlag } from 'hooks/useRemoteConfig'

import { CollectibleGatedAvailability } from './CollectibleGatedAvailability'
import { HiddenAvailability } from './HiddenAvailability'
import { SpecialAccessAvailability } from './SpecialAccessAvailability'
import styles from './TrackAvailabilityModal.module.css'
import { TrackMetadataState, UnlistedTrackMetadataField } from './types'

const { getUserId } = accountSelectors
const { getSupportedUserCollections, getHasUnsupportedCollection } =
  collectiblesSelectors

const messages = {
  title: 'AVAILABILITY',
  isRemix:
    'This track is marked as a remix. To enable additional availability options, unmark within Remix Settings.',
  done: 'Done',
  public: 'Public (Default)',
  publicSubtitle:
    'Public tracks are visible to all users and appear throughout Audius.',
  specialAccess: 'Special Access',
  specialAccessSubtitle:
    'Special Access tracks are only available to users who meet certain criteria, such as following the artist.',
  collectibleGated: 'Collectible Gated',
  collectibleGatedSubtitle:
    'Users who own a digital collectible matching your selection will have access to your track. Collectible gated content does not appear on trending or in user feeds.',
  noCollectibles:
    'No Collectibles found. To enable this option, link a wallet containing a collectible.',
  compatibilityTitle: "Not seeing what you're looking for?",
  compatibilitySubtitle:
    'Unverified Solana NFT Collections are not compatible at this time.',
  hidden: 'Hidden',
  hiddenSubtitle:
    "Hidden tracks won't be visible to your followers. Only you will see them on your profile. Anyone who has the link will be able to listen.",
  learnMore: 'Learn More'
}

const LEARN_MORE_URL =
  'https://blog.audius.co/article/introducing-nft-collectible-gated-content'

const defaultAvailabilityFields = {
  is_premium: false,
  premium_conditions: null,
  unlisted: false,
  genre: true,
  mood: true,
  tags: true,
  plays: true,
  share: true
}

const CollectibleGatedDescription = ({
  hasCollectibles,
  isUpload
}: {
  hasCollectibles: boolean
  isUpload: boolean
}) => {
  const hasUnsupportedCollection = useSelector(getHasUnsupportedCollection)

  const renderContent = useCallback(() => {
    return hasUnsupportedCollection ? (
      <div>
        <div>{messages.compatibilityTitle}</div>
        <div>{messages.compatibilitySubtitle}</div>
      </div>
    ) : (
      messages.noCollectibles
    )
  }, [hasUnsupportedCollection])

  return (
    <div className={styles.innerDescription}>
      {messages.collectibleGatedSubtitle}
      {!hasCollectibles && isUpload ? (
        <HelpCallout content={renderContent()} />
      ) : null}
      <a
        className={styles.learnMore}
        href={LEARN_MORE_URL}
        target='_blank'
        rel='noreferrer'
      >
        <span>{messages.learnMore}</span>
        <IconArrow className={styles.learnMoreArrow} />
      </a>
    </div>
  )
}

type TrackAvailabilityModalProps = {
  isOpen: boolean
  isRemix: boolean
  isUpload: boolean
  initialForm: Track
  metadataState: TrackMetadataState
  didUpdateState: (newState: TrackMetadataState) => void
  onClose: () => void
}

// A modal that allows you to set a track as collectible-gated, special access, or unlisted,
// as well as toggle individual unlisted metadata field visibility.
const TrackAvailabilityModal = ({
  isOpen,
  isRemix,
  isUpload,
  initialForm,
  metadataState,
  didUpdateState,
  onClose
}: TrackAvailabilityModalProps) => {
  const { isEnabled: isCollectibleGatedEnabled } = useFlag(
    FeatureFlags.COLLECTIBLE_GATED_ENABLED
  )
  const { isEnabled: isSpecialAccessEnabled } = useFlag(
    FeatureFlags.SPECIAL_ACCESS_ENABLED
  )
  const { ethCollectionMap, solCollectionMap } = useSelector(
    getSupportedUserCollections
  )
  const numEthCollectibles = Object.keys(ethCollectionMap).length
  const numSolCollectibles = Object.keys(solCollectionMap).length
  const hasCollectibles = numEthCollectibles + numSolCollectibles > 0

  const initialPremiumConditions = initialForm.premium_conditions

  const isInitiallySpecialAccess =
    !isUpload &&
    !!(
      initialPremiumConditions?.follow_user_id ||
      initialPremiumConditions?.tip_user_id
    )
  const noCollectibleGate =
    isInitiallySpecialAccess || isRemix || !hasCollectibles
  const noCollectibleDropdown = noCollectibleGate || !isUpload

  const isInitiallyCollectibleGated =
    !isUpload && !!initialPremiumConditions?.nft_collection
  const noSpecialAccess = isInitiallyCollectibleGated || isRemix
  const noSpecialAccessOptions = noSpecialAccess || !isUpload

  const isInitiallyNonHidden = !isUpload && !initialForm.is_unlisted
  const noHidden = isInitiallyNonHidden

  const accountUserId = useSelector(getUserId)
  const defaultSpecialAccess = useMemo(
    () => (accountUserId ? { follow_user_id: accountUserId } : null),
    [accountUserId]
  )

  const [selectedNFTCollection, setSelectedNFTCollection] = useState(
    metadataState.premium_conditions?.nft_collection
  )
  const [selectedSpecialAccessGate, setSelectedSpecialAccessGate] = useState(
    !('nft_collection' in (metadataState.premium_conditions ?? {}))
      ? metadataState.premium_conditions ?? defaultSpecialAccess
      : defaultSpecialAccess
  )

  let availability = TrackAvailabilityType.PUBLIC
  if (
    metadataState.is_premium &&
    metadataState.premium_conditions &&
    'nft_collection' in metadataState.premium_conditions
  ) {
    availability = TrackAvailabilityType.COLLECTIBLE_GATED
  } else if (metadataState.is_premium) {
    availability = TrackAvailabilityType.SPECIAL_ACCESS
  } else if (metadataState.unlisted) {
    availability = TrackAvailabilityType.HIDDEN
  }

  const updatePublicField = useCallback(() => {
    didUpdateState({ ...defaultAvailabilityFields })
  }, [didUpdateState])

  const updatePremiumContentFields = useCallback(
    (
      premiumConditions: Nullable<PremiumConditions>,
      availabilityType: TrackAvailabilityType
    ) => {
      if (premiumConditions) {
        didUpdateState({
          ...defaultAvailabilityFields,
          is_premium: true,
          premium_conditions: premiumConditions
        })

        // Keep track of previously selected collectible and special access gates
        // in case the user switches back and forth between radio items
        if (premiumConditions.nft_collection) {
          setSelectedNFTCollection(premiumConditions.nft_collection)
        } else {
          setSelectedSpecialAccessGate(premiumConditions)
        }
      } else if (availabilityType === availability) {
      } else if (availabilityType === TrackAvailabilityType.SPECIAL_ACCESS) {
        didUpdateState({
          ...defaultAvailabilityFields,
          is_premium: true,
          premium_conditions: selectedSpecialAccessGate
        })
      } else if (availabilityType === TrackAvailabilityType.COLLECTIBLE_GATED) {
        didUpdateState({
          ...defaultAvailabilityFields,
          is_premium: true,
          premium_conditions: {
            nft_collection: selectedNFTCollection
          }
        })
      }
    },
    [
      didUpdateState,
      availability,
      selectedSpecialAccessGate,
      selectedNFTCollection
    ]
  )

  const updateUnlistedField = useCallback(() => {
    didUpdateState({
      ...defaultAvailabilityFields,
      unlisted: true,
      plays: false,
      share: false
    })
  }, [didUpdateState])

  const toggleHiddenField = useCallback(
    (field: UnlistedTrackMetadataField) => {
      didUpdateState({
        ...metadataState,
        [field]: !metadataState[field]
      })
    },
    [didUpdateState, metadataState]
  )

  const handleSelectionChanged = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const availability = e.target.value as TrackAvailabilityType
      if (availability === TrackAvailabilityType.PUBLIC) {
        updatePublicField()
      } else if (availability === TrackAvailabilityType.HIDDEN) {
        updateUnlistedField()
      } else {
        updatePremiumContentFields(null, availability)
      }
    },
    [updatePremiumContentFields, updateUnlistedField, updatePublicField]
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} bodyClassName={styles.modalBody}>
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
      <ModalContent>
        {isRemix ? (
          <HelpCallout className={styles.isRemix} content={messages.isRemix} />
        ) : null}
        <RadioButtonGroup
          name={'access'}
          value={availability}
          onChange={handleSelectionChanged}
        >
          <ModalRadioItem
            icon={<IconVisibilityPublic className={styles.icon} />}
            label={messages.public}
            description={messages.publicSubtitle}
            value={TrackAvailabilityType.PUBLIC}
          />
          {isSpecialAccessEnabled ? (
            <ModalRadioItem
              icon={<IconSpecialAccess />}
              label={messages.specialAccess}
              description={messages.specialAccessSubtitle}
              value={TrackAvailabilityType.SPECIAL_ACCESS}
              disabled={noSpecialAccess}
              checkedContent={
                <SpecialAccessAvailability
                  state={metadataState}
                  onStateUpdate={updatePremiumContentFields}
                  disabled={noSpecialAccessOptions}
                />
              }
            />
          ) : null}
          {isCollectibleGatedEnabled ? (
            <ModalRadioItem
              icon={<IconCollectible />}
              label={messages.collectibleGated}
              value={TrackAvailabilityType.COLLECTIBLE_GATED}
              disabled={noCollectibleGate}
              description={
                <CollectibleGatedDescription
                  hasCollectibles={hasCollectibles}
                  isUpload={isUpload}
                />
              }
              checkedContent={
                <CollectibleGatedAvailability
                  state={metadataState}
                  onStateUpdate={updatePremiumContentFields}
                  disabled={noCollectibleDropdown}
                />
              }
            />
          ) : null}
          <ModalRadioItem
            icon={<IconHidden />}
            label={messages.hidden}
            value={TrackAvailabilityType.HIDDEN}
            disabled={noHidden}
            description={messages.hiddenSubtitle}
            checkedContent={
              <HiddenAvailability
                state={metadataState}
                toggleField={toggleHiddenField}
              />
            }
          />
        </RadioButtonGroup>
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
