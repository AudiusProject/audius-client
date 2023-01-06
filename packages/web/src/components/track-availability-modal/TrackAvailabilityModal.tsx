import { MouseEvent, useCallback, useMemo, useState } from 'react'

import {
  CommonState,
  FeatureFlags,
  Nullable,
  PremiumConditions,
  collectiblesSelectors,
  Collectible,
  accountSelectors,
  Chain,
  TokenStandard
} from '@audius/common'
import {
  IconSpecialAccess,
  IconCollectible,
  IconVisibilityPublic,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  IconHidden,
  ButtonType,
  Button,
  IconInfo
} from '@audius/stems'
import cn from 'classnames'
import { useSelector } from 'react-redux'

import DropdownInput from 'components/data-entry/DropdownInput'
import Tooltip from 'components/tooltip/Tooltip'
import { useFlag } from 'hooks/useRemoteConfig'

import Switch from '../switch/Switch'

import styles from './TrackAvailabilityModal.module.css'

const { getUserId } = accountSelectors
const { getUserCollectibles, getSolCollections } = collectiblesSelectors

const messages = {
  title: 'AVAILABILITY',
  hideTrack: 'Hide Track',
  public: 'Public (Default)',
  publicSubtitle:
    'Public uploads will appear throughout Audius and will be visible to all users.',
  specialAccess: 'Special Access',
  specialAccessSubtitle:
    'Special Access content is only available to users who meet your pre-specified criteria.',
  collectibleGated: 'Collectible Gated',
  collectibleGatedSubtitle:
    'Collectible gated content can only be accessed by users with linked wallets containing a collectible from the specified collection. These tracks do not appear on trending or in user feeds.',
  hidden: 'Hidden',
  hiddenSubtitle:
    "Hidden tracks won't be visible to your followers. Only you will see them on your profile. Anyone who has the link will be able to listen.",
  followersOnly: 'Available to Followers Only',
  supportersOnly: 'Available to Supporters Only',
  showUnlisted: 'Show Unlisted',
  showGenre: 'Show Genre',
  showMood: 'Show Mood',
  showTags: 'Show Tags',
  showShareButton: 'Show Share Button',
  showPlayCount: 'Show Play Count',
  supportersInfo: 'Supporters are users who have sent you a tip',
  pickACollection: 'Pick a Collection',
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

enum AvailabilityType {
  PUBLIC = 'PUBLIC',
  SPECIAL_ACCESS = 'SPECIAL_ACCESS',
  COLLECTIBLE_GATED = 'COLLECTIBLE_GATED',
  HIDDEN = 'HIDDEN'
}

enum PremiumTrackMetadataField {
  IS_PREMIUM = 'is_premium',
  PREMIUM_CONDITIONS = 'premium_conditions'
}

enum UnlistedTrackMetadataField {
  UNLISTED = 'unlisted',
  GENRE = 'genre',
  MOOD = 'mood',
  TAGS = 'tags',
  SHARE = 'share',
  PLAYS = 'plays'
}

// The order of toggles in the modal
const unlistedTrackMetadataOrder = [
  UnlistedTrackMetadataField.GENRE,
  UnlistedTrackMetadataField.MOOD,
  UnlistedTrackMetadataField.TAGS,
  UnlistedTrackMetadataField.SHARE,
  UnlistedTrackMetadataField.PLAYS
]

const hiddenTrackMetadataMap = {
  [UnlistedTrackMetadataField.UNLISTED]: '',
  [UnlistedTrackMetadataField.GENRE]: messages.showGenre,
  [UnlistedTrackMetadataField.MOOD]: messages.showMood,
  [UnlistedTrackMetadataField.TAGS]: messages.showTags,
  [UnlistedTrackMetadataField.SHARE]: messages.showShareButton,
  [UnlistedTrackMetadataField.PLAYS]: messages.showPlayCount
}

type TrackMetadataState = {
  [PremiumTrackMetadataField.IS_PREMIUM]: boolean
  [PremiumTrackMetadataField.PREMIUM_CONDITIONS]: Nullable<PremiumConditions>
  [UnlistedTrackMetadataField.UNLISTED]: boolean
  [UnlistedTrackMetadataField.GENRE]: boolean
  [UnlistedTrackMetadataField.MOOD]: boolean
  [UnlistedTrackMetadataField.TAGS]: boolean
  [UnlistedTrackMetadataField.SHARE]: boolean
  [UnlistedTrackMetadataField.PLAYS]: boolean
}

type TrackMetadataSectionProps = {
  title: string
  isVisible: boolean
  isDisabled: boolean
  didSet: (enabled: boolean) => void
}

// Individual section of the modal.
const TrackMetadataSection = ({
  title,
  isVisible,
  isDisabled,
  didSet
}: TrackMetadataSectionProps) => {
  return (
    <div className={styles.section}>
      <span className={styles.sectionTitleClassname}>{title}</span>
      <div className={styles.switchContainer}>
        <Switch
          isOn={isVisible}
          handleToggle={(e: MouseEvent) => {
            e.stopPropagation()
            didSet(!isVisible)
          }}
          isDisabled={isDisabled}
        />
      </div>
    </div>
  )
}

type TrackAvailabilityModalProps = {
  isOpen: boolean
  metadataState: TrackMetadataState
  didUpdateState: (newState: TrackMetadataState) => void
  onClose: () => void
}

type TrackAvailabilitySelectionProps = {
  selected: boolean
  metadataState: TrackMetadataState
  handleSelection: (availability: AvailabilityType) => void
  updateHiddenField?: (field: string) => (visible: boolean) => void
  updatePremiumContentFields?: (premiumConditions: PremiumConditions) => void
}

const PublicAvailability = ({
  selected,
  handleSelection
}: TrackAvailabilitySelectionProps) => {
  return (
    <label className={cn(styles.radioItem, { [styles.selected]: selected })}>
      <input
        className={styles.radioInput}
        type='radio'
        name='availability'
        value='public'
        checked={selected}
      />
      <div
        className={styles.availabilityRowContent}
        onClick={() => handleSelection(AvailabilityType.PUBLIC)}
      >
        <div className={styles.availabilityRowTitle}>
          <IconVisibilityPublic className={styles.availabilityRowIcon} />
          <span>{messages.public}</span>
        </div>
        <div className={styles.availabilityRowDescription}>
          {messages.publicSubtitle}
        </div>
      </div>
    </label>
  )
}

const SpecialAccessAvailability = ({
  selected,
  metadataState,
  handleSelection,
  updatePremiumContentFields
}: TrackAvailabilitySelectionProps) => {
  const accountUserId = useSelector(getUserId)

  return (
    <label className={cn(styles.radioItem, { [styles.selected]: selected })}>
      <input
        className={styles.radioInput}
        type='radio'
        name='availability'
        value='special-access'
        checked={selected}
      />
      <div
        className={styles.availabilityRowContent}
        onClick={() => handleSelection(AvailabilityType.SPECIAL_ACCESS)}
      >
        <div className={styles.availabilityRowTitle}>
          <IconSpecialAccess className={styles.availabilityRowIcon} />
          <span>{messages.specialAccess}</span>
        </div>
        <div className={styles.availabilityRowDescription}>
          {messages.specialAccessSubtitle}
        </div>
        {selected && (
          <div className={styles.availabilityRowSelection}>
            <label
              className={cn(styles.radioItem, styles.specialAccessRadioItem, {
                [styles.selected]:
                  !!metadataState.premium_conditions?.follow_user_id
              })}
            >
              <input
                className={styles.radioInput}
                type='radio'
                name='special-access'
                value='follower'
                onClick={(e: MouseEvent) => {
                  e.stopPropagation()
                  if (!updatePremiumContentFields || !accountUserId) return
                  updatePremiumContentFields({ follow_user_id: accountUserId })
                }}
              />
              <div>{messages.followersOnly}</div>
            </label>
            <label
              className={cn(styles.radioItem, styles.specialAccessRadioItem, {
                [styles.selected]:
                  !!metadataState.premium_conditions?.tip_user_id
              })}
            >
              <input
                className={styles.radioInput}
                type='radio'
                name='special-access'
                value='supporter'
                onClick={(e: MouseEvent) => {
                  e.stopPropagation()
                  if (!updatePremiumContentFields || !accountUserId) return
                  updatePremiumContentFields({ tip_user_id: accountUserId })
                }}
              />
              <div>
                {messages.supportersOnly}
                <Tooltip
                  text={messages.supportersInfo}
                  mouseEnterDelay={0.1}
                  mount='body'
                >
                  <IconInfo className={styles.supportersInfo} />
                </Tooltip>
              </div>
            </label>
          </div>
        )}
      </div>
    </label>
  )
}

const defaultCollectibles = { [Chain.Eth]: [], [Chain.Sol]: [] }

const CollectibleGatedAvailability = ({
  selected,
  metadataState,
  handleSelection,
  updatePremiumContentFields
}: TrackAvailabilitySelectionProps) => {
  const accountUserId = useSelector(getUserId)
  const collectibles =
    useSelector((state: CommonState) => {
      if (!accountUserId) return defaultCollectibles
      return getUserCollectibles(state, { id: accountUserId })
    }) ?? defaultCollectibles

  // Ethereum collections
  const ethCollectionMap: {
    [slug: string]: {
      name: string
      img: string
      address: string
      standard: TokenStandard
    }
  } = {}
  collectibles[Chain.Eth].forEach((collectible) => {
    const {
      collectionSlug,
      collectionName,
      collectionImageUrl,
      assetContractAddress,
      standard
    } = collectible
    if (
      !collectionName ||
      !collectionSlug ||
      !collectionImageUrl ||
      !assetContractAddress ||
      !standard ||
      ethCollectionMap[collectionSlug]
    ) {
      return
    }
    ethCollectionMap[collectionSlug] = {
      name: collectionName,
      img: collectionImageUrl,
      address: assetContractAddress,
      standard
    }
  })
  const ethCollectibleItems = Object.keys(ethCollectionMap).map((slug) => ({
    text: ethCollectionMap[slug].name,
    el: (
      <div className={styles.dropdownRow}>
        <img
          src={ethCollectionMap[slug].img}
          alt={ethCollectionMap[slug].name}
        />
        <span>{ethCollectionMap[slug].name}</span>
      </div>
    ),
    value: slug
  }))

  // Solana collections
  const solCollections = useSelector(getSolCollections)
  const validSolCollectionMints = [
    ...new Set(
      (collectibles[Chain.Sol] ?? [])
        .filter(
          (collectible: Collectible) =>
            !!collectible.solanaChainMetadata?.collection?.verified
        )
        .map((collectible: Collectible) => {
          const key = collectible.solanaChainMetadata!.collection!.key
          return typeof key === 'string' ? key : key.toBase58()
        })
    )
  ]
  const solCollectionMap: { [mint: string]: { name: string; img: string } } = {}
  validSolCollectionMints.forEach((mint) => {
    const { data, imageUrl } = solCollections[mint] ?? {}
    if (!data?.name || solCollectionMap[data.name]) return
    solCollectionMap[mint] = {
      name: data.name.replaceAll('\x00', ''),
      img: imageUrl
    }
  })
  const solCollectibleItems = Object.keys(solCollectionMap).map((mint) => ({
    text: solCollectionMap[mint].name,
    el: (
      <div className={styles.dropdownRow}>
        <img
          src={solCollectionMap[mint].img}
          alt={solCollectionMap[mint].name}
        />
        <span>{solCollectionMap[mint].name}</span>
      </div>
    ),
    value: mint
  }))

  const menuItems = [...ethCollectibleItems, ...solCollectibleItems]

  return (
    <label className={cn(styles.radioItem, { [styles.selected]: selected })}>
      <input
        className={styles.radioInput}
        type='radio'
        name='availability'
        value='collectible-gated'
        checked={selected}
      />
      <div
        className={styles.availabilityRowContent}
        onClick={() => handleSelection(AvailabilityType.COLLECTIBLE_GATED)}
      >
        <div className={styles.availabilityRowTitle}>
          <IconCollectible className={styles.availabilityRowIcon} />
          <span>{messages.collectibleGated}</span>
        </div>
        <div className={styles.availabilityRowDescription}>
          {messages.collectibleGatedSubtitle}
        </div>
        {selected && (
          <div
            className={cn(
              styles.availabilityRowSelection,
              styles.collectibleGated
            )}
          >
            <DropdownInput
              aria-label={messages.pickACollection}
              placeholder={messages.pickACollection}
              mount='parent'
              menu={{ items: menuItems }}
              defaultValue={
                metadataState.premium_conditions?.nft_collection?.name ?? ''
              }
              // isRequired={props.requiredFields.genre}
              // error={props.invalidFields.genre}
              onSelect={(value: string) => {
                if (!updatePremiumContentFields) return

                if (ethCollectionMap[value]) {
                  updatePremiumContentFields({
                    nft_collection: {
                      chain: Chain.Eth,
                      standard: ethCollectionMap[value].standard,
                      address: ethCollectionMap[value].address,
                      name: ethCollectionMap[value].name,
                      slug: value
                    }
                  })
                } else if (solCollectionMap[value]) {
                  updatePremiumContentFields({
                    nft_collection: {
                      chain: Chain.Sol,
                      address: value,
                      name: solCollectionMap[value].name
                    }
                  })
                }
              }}
              size='large'
              dropdownStyle={styles.dropdown}
              dropdownInputStyle={styles.dropdownInput}
            />
          </div>
        )}
      </div>
    </label>
  )
}

const HiddenAvailability = ({
  selected,
  metadataState,
  handleSelection,
  updateHiddenField
}: TrackAvailabilitySelectionProps) => {
  return (
    <label className={cn(styles.radioItem, { [styles.selected]: selected })}>
      <input
        className={styles.radioInput}
        type='radio'
        name='availability'
        value='hidden'
        checked={selected}
      />
      <div
        className={styles.availabilityRowContent}
        onClick={() => handleSelection(AvailabilityType.HIDDEN)}
      >
        <div className={styles.availabilityRowTitle}>
          <IconHidden className={styles.availabilityRowIcon} />
          <span>{messages.hidden}</span>
        </div>
        <div className={styles.availabilityRowDescription}>
          {messages.hiddenSubtitle}
        </div>
        {selected && (
          <div
            className={cn(
              styles.availabilityRowSelection,
              styles.hiddenSection
            )}
          >
            <div>
              {unlistedTrackMetadataOrder.slice(0, 3).map((label, i) => {
                return (
                  <TrackMetadataSection
                    key={i}
                    isDisabled={false}
                    isVisible={metadataState[label]}
                    title={hiddenTrackMetadataMap[label]}
                    didSet={updateHiddenField!(label)}
                  />
                )
              })}
            </div>
            <div>
              {unlistedTrackMetadataOrder.slice(3).map((label, i) => {
                return (
                  <TrackMetadataSection
                    key={i}
                    isDisabled={false}
                    isVisible={metadataState[label]}
                    title={hiddenTrackMetadataMap[label]}
                    didSet={updateHiddenField!(label)}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </label>
  )
}

// A modal that allows you to toggle a track to unlisted, as
// well as toggle individual metadata field visibility.
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
  const defaultSpecialAccess = useMemo(() => accountUserId ? { follow_user_id: accountUserId } : null, [accountUserId])

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
    [didUpdateState, metadataState, accountUserId]
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
