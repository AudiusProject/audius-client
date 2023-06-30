import { useCallback, useMemo } from 'react'

import {
  collectiblesSelectors,
  FeatureFlags,
  TrackAvailabilityType
} from '@audius/common'
import {
  IconCollectible,
  IconHidden,
  IconSpecialAccess,
  IconVisibilityPublic,
  RadioButtonGroup
} from '@audius/stems'
import { Formik, useField } from 'formik'
import { get, isEmpty, set } from 'lodash'
import { useSelector } from 'react-redux'

import { HelpCallout } from 'components/help-callout/HelpCallout'
import { ModalRadioItem } from 'components/modal-radio/ModalRadioItem'
import { useFlag } from 'hooks/useRemoteConfig'

import { ModalField } from '../fields/ModalField'
import { REMIX_OF } from '../fields/RemixModalForm'

import { EditFormValues } from './EditPageNew'
import styles from './TrackAvailabilityModalForm.module.css'
const { getSupportedUserCollections } = collectiblesSelectors

const messages = {
  title: 'AVAILABILITY',
  description:
    "Customize your music's availability for different audiences, and create personalized gated experiences for your fans.",
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

type TrackAvailabilityFormValues = {}

const IS_UNLISTED = 'is_unlisted'
const IS_PREMIUM = 'is_premium'
const PREMIUM_CONDITIONS = 'premium_conditions'

const AVAILABILITY_TYPE = 'availability_type'

// A modal that allows you to set a track as collectible-gated, special access, or unlisted,
// as well as toggle individual unlisted metadata field visibility.
export const TrackAvailabilityModalForm = () => {
  // Field from the outer form
  const [{ value: isUnlistedValue }, , { setValue: setIsUnlistedValue }] =
    useField<EditFormValues[typeof IS_UNLISTED]>(IS_UNLISTED)
  const [{ value: isPremiumValue }, , { setValue: setIsPremiumValue }] =
    useField<EditFormValues[typeof IS_PREMIUM]>(IS_PREMIUM)
  const [
    { value: premiumConditionsValue },
    ,
    { setValue: setPremiumConditionsValue }
  ] = useField<EditFormValues[typeof PREMIUM_CONDITIONS]>(PREMIUM_CONDITIONS)
  const [{ value: remixOfValue }] =
    useField<EditFormValues[typeof REMIX_OF]>(REMIX_OF)
  const isRemix = !isEmpty(remixOfValue?.tracks)

  const initialValues = useMemo(() => {
    const initialValues = {}
    set(initialValues, IS_UNLISTED, isUnlistedValue)
    set(initialValues, IS_PREMIUM, isPremiumValue)
    set(initialValues, PREMIUM_CONDITIONS, premiumConditionsValue)
    return initialValues as TrackAvailabilityFormValues
  }, [isPremiumValue, isUnlistedValue, premiumConditionsValue])

  const onSubmit = useCallback(
    (values: TrackAvailabilityFormValues) => {
      setIsUnlistedValue(get(values, IS_UNLISTED))
      setIsPremiumValue(get(values, IS_PREMIUM))
      setPremiumConditionsValue(get(values, PREMIUM_CONDITIONS))
    },
    [setIsPremiumValue, setIsUnlistedValue, setPremiumConditionsValue]
  )

  const preview = (
    <div className={styles.preview}>
      <div className={styles.header}>
        <label className={styles.title}>{messages.title}</label>
      </div>
      <div className={styles.description}>{messages.description}</div>
    </div>
  )

  return (
    <Formik<TrackAvailabilityFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
      enableReinitialize
    >
      <ModalField
        title={messages.title}
        icon={<IconHidden className={styles.titleIcon} />}
        preview={preview}
      >
        <TrackAvailabilityFields isRemix={isRemix} />
      </ModalField>
    </Formik>
  )
}

type TrackAvailabilityFieldsProps = {
  isRemix: boolean
}

const TrackAvailabilityFields = (props: TrackAvailabilityFieldsProps) => {
  const { isRemix } = props
  const { isEnabled: isCollectibleGatedEnabled } = useFlag(
    FeatureFlags.COLLECTIBLE_GATED_ENABLED
  )
  const { isEnabled: isSpecialAccessEnabled } = useFlag(
    FeatureFlags.SPECIAL_ACCESS_ENABLED
  )

  const [availabilityField] = useField({
    name: AVAILABILITY_TYPE,
    type: 'radio'
  })
  const { ethCollectionMap, solCollectionMap } = useSelector(
    getSupportedUserCollections
  )
  const numEthCollectibles = Object.keys(ethCollectionMap).length
  const numSolCollectibles = Object.keys(solCollectionMap).length
  const hasCollectibles = numEthCollectibles + numSolCollectibles > 0

  const noCollectibleGate = !hasCollectibles
  const noSpecialAccess = isRemix

  return (
    <>
      {isRemix ? (
        <HelpCallout className={styles.isRemix} content={messages.isRemix} />
      ) : null}
      <RadioButtonGroup {...availabilityField}>
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
              <>Special Access Options</>
              // <SpecialAccessAvailability
              //   state={metadataState}
              //   onStateUpdate={updatePremiumContentFields}
              //   disabled={noSpecialAccessOptions}
              // />
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
              <>Collectible Gated Description</>
              // <CollectibleGatedDescription
              //   hasCollectibles={hasCollectibles}
              //   true={true}
              // />
            }
            checkedContent={
              <>Collectible Gated Options</>
              // <CollectibleGatedAvailability
              //   state={metadataState}
              //   onStateUpdate={updatePremiumContentFields}
              //   disabled={noCollectibleDropdown}
              // />
            }
          />
        ) : null}
        <ModalRadioItem
          icon={<IconHidden />}
          label={messages.hidden}
          value={TrackAvailabilityType.HIDDEN}
          description={messages.hiddenSubtitle}
          checkedContent={
            <>Hidden Options</>
            // <HiddenAvailability
            //   state={metadataState}
            //   toggleField={toggleHiddenField}
            // />
          }
        />
      </RadioButtonGroup>
    </>
  )
}
