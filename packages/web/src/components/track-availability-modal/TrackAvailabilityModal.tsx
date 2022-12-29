import { FeatureFlags, Nullable, PremiumConditions } from '@audius/common'
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
  Button
} from '@audius/stems'
import cn from 'classnames'

import { useFlag } from 'hooks/useRemoteConfig'

import Switch from '../switch/Switch'

import styles from './TrackAvailabilityModal.module.css'

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
  done: "Done"
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
    <div
      className={styles.section}
    >
      <span className={styles.sectionTitleClassname}>{title}</span>
      <div className={styles.switchContainer}>
        <Switch
          isOn={isVisible}
          handleToggle={() => {
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
  updateHiddenField?: (field: string) => (visible: boolean) => void
  updatePremiumContentFields?: (
    isPremium: boolean,
    premiumConditions: PremiumConditions
  ) => void
}

const PublicAvailability = ({ selected }: TrackAvailabilitySelectionProps) => {
  return (
    <div className={styles.availabilityRowContent}>
      <div className={cn(styles.availabilityRowTitle, { [styles.selected]: selected })}>
        <IconVisibilityPublic className={styles.availabilityRowIcon} />
        <span>{messages.public}</span>
      </div>
      <div className={styles.availabilityRowDescription}>
        {messages.publicSubtitle}
      </div>
    </div>
  )
}

const SpecialAccessAvailability = ({
  selected,
  updatePremiumContentFields
}: TrackAvailabilitySelectionProps) => {
  return (
    <div className={styles.availabilityRowContent}>
      <div className={cn(styles.availabilityRowTitle, { [styles.selected]: selected })}>
        <IconSpecialAccess className={styles.availabilityRowIcon} />
        <span>{messages.specialAccess}</span>
      </div>
      <div className={styles.availabilityRowDescription}>
        {messages.specialAccessSubtitle}
      </div>
      {selected && (
        <div className={styles.availabilityRowSelection}>
          <div>{messages.followersOnly}</div>
          <div>{messages.supportersOnly}</div>
        </div>
      )}
    </div>
  )
}

const CollectibleGatedAvailability = ({
  selected,
  updatePremiumContentFields
}: TrackAvailabilitySelectionProps) => {
  return (
    <div className={styles.availabilityRowContent}>
      <div className={cn(styles.availabilityRowTitle, { [styles.selected]: selected })}>
        <IconCollectible className={styles.availabilityRowIcon} />
        <span>{messages.collectibleGated}</span>
      </div>
      <div className={styles.availabilityRowDescription}>
        {messages.collectibleGatedSubtitle}
      </div>
      {selected && <div className={styles.availabilityRowSelection}>yolo</div>}
    </div>
  )
}

const HiddenAvailability = ({
  selected,
  metadataState,
  updateHiddenField
}: TrackAvailabilitySelectionProps) => {
  return (
    <div className={styles.availabilityRowContent}>
      <div className={cn(styles.availabilityRowTitle, { [styles.selected]: selected })}>
        <IconHidden className={styles.availabilityRowIcon} />
        <span>{messages.hidden}</span>
      </div>
      <div className={styles.availabilityRowDescription}>
        {messages.hiddenSubtitle}
      </div>
      {selected && (
        <div
          className={cn(styles.availabilityRowSelection, styles.hiddenSection)}
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

  console.log({ metadataState })

  const updateHiddenField = (field: string) => (visible: boolean) => {
    didUpdateState({ ...metadataState, [field]: visible })
  }

  const updatePremiumContentFields = (
    isPremium: boolean,
    premiumConditions: PremiumConditions
  ) => {
    if (isPremium) {
      didUpdateState({
        ...metadataState,
        is_premium: true,
        premium_conditions: premiumConditions
      })
    } else {
      didUpdateState({
        ...metadataState,
        is_premium: false,
        premium_conditions: null
      })
    }
  }

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
        <PublicAvailability selected={true} metadataState={metadataState} />
        {isSpecialAccessGateEnabled && (
          <SpecialAccessAvailability
            selected={true}
            metadataState={metadataState}
            updatePremiumContentFields={updatePremiumContentFields}
          />
        )}
        {isNFTGateEnabled && (
          <CollectibleGatedAvailability
            selected={true}
            metadataState={metadataState}
            updatePremiumContentFields={updatePremiumContentFields}
          />
        )}
        <HiddenAvailability
          selected={true}
          metadataState={metadataState}
          updateHiddenField={updateHiddenField}
        />
        <div className={styles.doneButtonContainer}>
          <Button
            type={ButtonType.PRIMARY_ALT}
            textClassName={cn(styles.doneButton)}
            text={messages.done}
          />
        </div>
      </ModalContent>
    </Modal>
  )
}

export default TrackAvailabilityModal
