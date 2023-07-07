import { ChangeEvent, useCallback, useMemo } from 'react'

import {
  accountSelectors,
  collectiblesSelectors,
  FeatureFlags,
  Nullable,
  PremiumConditions,
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
import { CollectibleGatedFields } from 'components/track-availability-modal/CollectibleGatedFields'
import { useFlag } from 'hooks/useRemoteConfig'

import { ModalField } from '../fields/ModalField'
import { REMIX_OF } from '../fields/RemixModalForm'

import { CollectibleGatedDescription } from './CollectibleGatedDescription'
import { EditFormValues } from './EditPageNew'
import { SpecialAccessFields, SpecialAccessType } from './SpecialAccessFields'
import styles from './TrackAvailabilityModalForm.module.css'
const { getSupportedUserCollections } = collectiblesSelectors
const { getUserId } = accountSelectors

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

const IS_UNLISTED = 'is_unlisted'
const IS_PREMIUM = 'is_premium'
export const PREMIUM_CONDITIONS = 'premium_conditions'

export const AVAILABILITY_TYPE = 'availability_type'
const SPECIAL_ACCESS_TYPE = 'special_access_type'

export type TrackAvailabilityFormValues = {
  [AVAILABILITY_TYPE]: TrackAvailabilityType
  [PREMIUM_CONDITIONS]: Nullable<PremiumConditions>
  [SPECIAL_ACCESS_TYPE]: Nullable<SpecialAccessType>
}

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

    let availabilityType = TrackAvailabilityType.PUBLIC
    if (
      premiumConditionsValue?.follow_user_id ||
      premiumConditionsValue?.tip_user_id
    ) {
      availabilityType = TrackAvailabilityType.SPECIAL_ACCESS
    }
    if (premiumConditionsValue?.nft_collection) {
      availabilityType = TrackAvailabilityType.COLLECTIBLE_GATED
    }
    // TODO: USDC gated type
    set(initialValues, AVAILABILITY_TYPE, availabilityType)

    set(
      initialValues,
      SPECIAL_ACCESS_TYPE,
      premiumConditionsValue?.tip_user_id
        ? SpecialAccessType.TIP
        : SpecialAccessType.FOLLOW
    )
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
        <TrackAvailabilityFields
          isRemix={isRemix}
          premiumConditions={premiumConditionsValue}
        />
      </ModalField>
    </Formik>
  )
}

type TrackAvailabilityFieldsProps = {
  premiumConditions: EditFormValues[typeof PREMIUM_CONDITIONS]
  isRemix: boolean
}

const TrackAvailabilityFields = (props: TrackAvailabilityFieldsProps) => {
  const { isRemix } = props
  const accountUserId = useSelector(getUserId)
  const { isEnabled: isCollectibleGatedEnabled } = useFlag(
    FeatureFlags.COLLECTIBLE_GATED_ENABLED
  )
  const { isEnabled: isSpecialAccessEnabled } = useFlag(
    FeatureFlags.SPECIAL_ACCESS_ENABLED
  )
  const [
    { value: premiumConditionsValue },
    ,
    { setValue: setPremiumConditionsValue }
  ] =
    useField<TrackAvailabilityFormValues[typeof PREMIUM_CONDITIONS]>(
      PREMIUM_CONDITIONS
    )

  const [availabilityField, , { setValue: setAvailabilityValue }] = useField({
    name: AVAILABILITY_TYPE
  })
  const { ethCollectionMap, solCollectionMap } = useSelector(
    getSupportedUserCollections
  )
  const numEthCollectibles = Object.keys(ethCollectionMap).length
  const numSolCollectibles = Object.keys(solCollectionMap).length
  const hasCollectibles = numEthCollectibles + numSolCollectibles > 0

  const noCollectibleGate = !hasCollectibles
  const noSpecialAccess = isRemix

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const type = e.target.value as TrackAvailabilityType
      switch (type) {
        case TrackAvailabilityType.PUBLIC: {
          setPremiumConditionsValue(null)
          break
        }
        case TrackAvailabilityType.SPECIAL_ACCESS: {
          if (!accountUserId || premiumConditionsValue?.tip_user_id) break
          setPremiumConditionsValue({ follow_user_id: accountUserId })
          break
        }
        case TrackAvailabilityType.COLLECTIBLE_GATED:
          if (!accountUserId || premiumConditionsValue?.nft_collection) break
          setPremiumConditionsValue(null)
          break
        case TrackAvailabilityType.HIDDEN:
          // TODO: set default availability fieilds
          // setFieldValue(AVAILABILITY_FIELD, defaultAvailabilityFields)
          break
      }
      setAvailabilityValue(type)
    },
    [
      accountUserId,
      premiumConditionsValue?.nft_collection,
      premiumConditionsValue?.tip_user_id,
      setAvailabilityValue,
      setPremiumConditionsValue
    ]
  )

  return (
    <>
      {isRemix ? (
        <HelpCallout className={styles.isRemix} content={messages.isRemix} />
      ) : null}
      <RadioButtonGroup
        defaultValue={TrackAvailabilityType.PUBLIC}
        {...availabilityField}
        onChange={handleChange}
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
            checkedContent={<SpecialAccessFields disabled={noSpecialAccess} />}
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
                isUpload={true}
              />
            }
            checkedContent={
              <CollectibleGatedFields disabled={noCollectibleGate} />
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
