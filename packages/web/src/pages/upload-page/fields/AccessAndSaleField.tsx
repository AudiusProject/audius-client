import { ChangeEvent, useCallback, useMemo } from 'react'

import {
  accountSelectors,
  collectiblesSelectors,
  FeatureFlags,
  FieldVisibility,
  isPremiumContentCollectibleGated,
  isPremiumContentFollowGated,
  isPremiumContentTipGated,
  isPremiumContentUSDCPurchaseGated,
  Nullable,
  PremiumConditions,
  TrackAvailabilityType
} from '@audius/common'
import {
  IconCart,
  IconCollectible,
  IconHidden,
  IconNote,
  IconSpecialAccess,
  IconVisibilityPublic,
  RadioButtonGroup
} from '@audius/stems'
import cn from 'classnames'
import { useField } from 'formik'
import { get, isEmpty, set } from 'lodash'
import { useSelector } from 'react-redux'

import {
  ContextualMenu,
  SelectedValue
} from 'components/data-entry/ContextualMenu'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { HelpCallout } from 'components/help-callout/HelpCallout'
import layoutStyles from 'components/layout/layout.module.css'
import { ModalRadioItem } from 'components/modal-radio/ModalRadioItem'
import { Text } from 'components/typography'
import { useFlag } from 'hooks/useRemoteConfig'
import { defaultFieldVisibility } from 'pages/track-page/utils'

import {
  defaultHiddenFields,
  HiddenAvailabilityFields
} from '../fields/availability/HiddenAvailabilityFields'
import {
  SpecialAccessFields,
  SpecialAccessType
} from '../fields/availability/SpecialAccessFields'
import { UsdcPurchaseFields } from '../fields/availability/UsdcPurchaseFields'
import { CollectibleGatedDescription } from '../fields/availability/collectible-gated/CollectibleGatedDescription'
import { CollectibleGatedFields } from '../fields/availability/collectible-gated/CollectibleGatedFields'
import { useTrackField } from '../hooks'
import { SingleTrackEditValues } from '../types'

import styles from './AccessAndSaleField.module.css'
import { REMIX_OF } from './RemixSettingsField'
const { getSupportedUserCollections } = collectiblesSelectors
const { getUserId } = accountSelectors

const messages = {
  title: 'Access & Sale',
  description:
    "Customize your music's availability for different audiences, and create personalized gated experiences for your fans.",
  modalDescription:
    'Control who has access to listen. Create gated experiences or require users pay to unlock your music.',
  isRemix:
    'This track is marked as a remix. To enable additional availability options, unmark within Remix Settings.',
  done: 'Done',
  public: 'Public (Default)',
  publicSubtitle:
    'Public tracks are visible to all users and appear throughout Audius.',
  usdcPurchase: 'Premium (Pay-to-Unlock)',
  usdcPurchaseSubtitle:
    'Unlockable by purchase, these tracks are visible to everyone but only playable by users who have paid for access.',
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
  learnMore: 'Learn More',
  fieldVisibility: {
    genre: 'Show Genre',
    mood: 'Show Mood',
    tags: 'Show Tags',
    share: 'Show Share Button',
    play_count: 'Show Play Count',
    remixes: 'Show Remixes'
  },

  followersOnly: 'Followers Only',
  supportersOnly: 'Supporters Only',
  ownersOf: 'Owners Of',
  price: (price: number) =>
    price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
  preview: (seconds: number) => {
    return `${seconds.toString()} seconds`
  }
}

export const IS_UNLISTED = 'is_unlisted'
export const IS_PREMIUM = 'is_premium'
export const PREMIUM_CONDITIONS = 'premium_conditions'

export const AVAILABILITY_TYPE = 'availability_type'
export const SPECIAL_ACCESS_TYPE = 'special_access_type'
export const FIELD_VISIBILITY = 'field_visibility'
export const PRICE = 'premium_conditions.usdc_purchase.price'
export const PREVIEW = 'preview_start_seconds'

export type AccessAndSaleFormValues = {
  [IS_UNLISTED]: boolean
  [AVAILABILITY_TYPE]: TrackAvailabilityType
  [PREMIUM_CONDITIONS]: Nullable<PremiumConditions>
  [SPECIAL_ACCESS_TYPE]: Nullable<SpecialAccessType>
  [FIELD_VISIBILITY]: FieldVisibility
  [PREVIEW]?: number
}

type AccessAndSaleFieldProps = {
  isUpload?: boolean
}

export const AccessAndSaleField = (props: AccessAndSaleFieldProps) => {
  const { isUpload } = props

  // Fields from the outer form
  const [{ value: isUnlisted }, , { setValue: setIsUnlistedValue }] =
    useTrackField<SingleTrackEditValues[typeof IS_UNLISTED]>(IS_UNLISTED)
  const [{ value: isPremium }, , { setValue: setIsPremiumValue }] =
    useTrackField<SingleTrackEditValues[typeof IS_PREMIUM]>(IS_PREMIUM)
  const [
    { value: premiumConditions },
    ,
    { setValue: setPremiumConditionsValue }
  ] =
    useTrackField<SingleTrackEditValues[typeof PREMIUM_CONDITIONS]>(
      PREMIUM_CONDITIONS
    )
  const [{ value: fieldVisibility }, , { setValue: setFieldVisibilityValue }] =
    useTrackField<SingleTrackEditValues[typeof FIELD_VISIBILITY]>(
      FIELD_VISIBILITY
    )
  const [{ value: remixOfValue }] =
    useTrackField<SingleTrackEditValues[typeof REMIX_OF]>(REMIX_OF)

  const [{ value: preview }, , { setValue: setPreviewValue }] =
    useTrackField<SingleTrackEditValues[typeof PREVIEW]>(PREVIEW)

  const isRemix = !isEmpty(remixOfValue?.tracks)

  const initialValues = useMemo(() => {
    const isUsdcGated = isPremiumContentUSDCPurchaseGated(premiumConditions)
    const isTipGated = isPremiumContentTipGated(premiumConditions)
    const isFollowGated = isPremiumContentFollowGated(premiumConditions)
    const isCollectibleGated =
      isPremiumContentCollectibleGated(premiumConditions)
    const initialValues = {}
    set(initialValues, IS_UNLISTED, isUnlisted)
    set(initialValues, IS_PREMIUM, isPremium)
    set(initialValues, PREMIUM_CONDITIONS, premiumConditions)

    let availabilityType = TrackAvailabilityType.PUBLIC
    if (isUsdcGated) {
      availabilityType = TrackAvailabilityType.USDC_PURCHASE
    }
    if (isFollowGated || isTipGated) {
      availabilityType = TrackAvailabilityType.SPECIAL_ACCESS
    }
    if (isCollectibleGated) {
      availabilityType = TrackAvailabilityType.COLLECTIBLE_GATED
    }
    if (isUnlisted) {
      availabilityType = TrackAvailabilityType.HIDDEN
    }
    set(initialValues, AVAILABILITY_TYPE, availabilityType)
    set(initialValues, FIELD_VISIBILITY, fieldVisibility)
    set(initialValues, PREVIEW, preview)
    set(
      initialValues,
      SPECIAL_ACCESS_TYPE,
      isTipGated ? SpecialAccessType.TIP : SpecialAccessType.FOLLOW
    )
    return initialValues as AccessAndSaleFormValues
  }, [fieldVisibility, isPremium, isUnlisted, premiumConditions, preview])

  const onSubmit = useCallback(
    (values: AccessAndSaleFormValues) => {
      setPremiumConditionsValue(get(values, PREMIUM_CONDITIONS))
      if (get(values, PREMIUM_CONDITIONS)) {
        setIsPremiumValue(true)
      }
      if (
        get(values, AVAILABILITY_TYPE) === TrackAvailabilityType.USDC_PURCHASE
      ) {
        setPreviewValue(get(values, PREVIEW))
        const priceStr = get(values, PRICE)
        const price = priceStr ? parseFloat(priceStr) : 0 // TODO: better default?
        setPremiumConditionsValue({
          // @ts-ignore splits get added in saga
          usdc_purchase: {
            price
          }
        })
      }
      if (get(values, AVAILABILITY_TYPE) === TrackAvailabilityType.HIDDEN) {
        setFieldVisibilityValue({
          ...(get(values, FIELD_VISIBILITY) ?? undefined),
          remixes: fieldVisibility?.remixes ?? defaultFieldVisibility.remixes
        })
        setIsUnlistedValue(true)
      } else {
        setFieldVisibilityValue({
          ...defaultFieldVisibility,
          remixes: fieldVisibility?.remixes ?? defaultFieldVisibility.remixes
        })
        setIsUnlistedValue(false)
      }
    },
    [
      fieldVisibility?.remixes,
      setFieldVisibilityValue,
      setIsPremiumValue,
      setIsUnlistedValue,
      setPremiumConditionsValue,
      setPreviewValue
    ]
  )

  const renderValue = useCallback(() => {
    if (premiumConditions && 'nft_collection' in premiumConditions) {
      const { nft_collection } = premiumConditions
      if (!nft_collection) return null
      const { imageUrl, name } = nft_collection

      return (
        <>
          <SelectedValue
            label={messages.specialAccess}
            icon={IconSpecialAccess}
          />
          <div className={styles.nftOwner}>
            <Text variant='label' size='small'>
              {messages.ownersOf}:
            </Text>
            <SelectedValue>
              {imageUrl ? (
                <DynamicImage
                  wrapperClassName={styles.nftArtwork}
                  image={imageUrl}
                />
              ) : null}
              <Text variant='body' strength='strong'>
                {name}
              </Text>
            </SelectedValue>
          </div>
        </>
      )
    }

    let selectedValues = []

    const specialAccessValue = {
      label: messages.specialAccess,
      icon: IconSpecialAccess
    }

    if (isPremiumContentUSDCPurchaseGated(premiumConditions)) {
      selectedValues = [
        {
          label: messages.price(premiumConditions.usdc_purchase.price),
          icon: IconCart
        }
      ]
      if (preview) {
        selectedValues.push({
          label: messages.preview(preview),
          icon: IconNote
        })
      }
    } else if (isPremiumContentFollowGated(premiumConditions)) {
      selectedValues = [specialAccessValue, messages.followersOnly]
    } else if (isPremiumContentTipGated(premiumConditions)) {
      selectedValues = [specialAccessValue, messages.supportersOnly]
    } else if (isUnlisted && fieldVisibility) {
      const fieldVisibilityKeys = Object.keys(
        messages.fieldVisibility
      ) as Array<keyof FieldVisibility>

      const fieldVisibilityLabels = fieldVisibilityKeys
        .filter((visibilityKey) => fieldVisibility[visibilityKey])
        .map((visibilityKey) => messages.fieldVisibility[visibilityKey])
      selectedValues = [
        { label: messages.hidden, icon: IconHidden },
        ...fieldVisibilityLabels
      ]
    } else {
      selectedValues = [{ label: messages.public, icon: IconVisibilityPublic }]
    }

    return (
      <div className={styles.value}>
        {selectedValues.map((value) => {
          const valueProps =
            typeof value === 'string' ? { label: value } : value
          return <SelectedValue key={valueProps.label} {...valueProps} />
        })}
      </div>
    )
  }, [fieldVisibility, isUnlisted, premiumConditions, preview])

  return (
    <ContextualMenu
      label={messages.title}
      description={messages.description}
      icon={<IconHidden />}
      initialValues={initialValues}
      onSubmit={onSubmit}
      renderValue={renderValue}
      menuFields={
        <AccessAndSaleMenuFields
          isRemix={isRemix}
          isUpload={isUpload}
          premiumConditions={premiumConditions}
        />
      }
    />
  )
}

type AccesAndSaleMenuFieldsProps = {
  premiumConditions: SingleTrackEditValues[typeof PREMIUM_CONDITIONS]
  isRemix: boolean
  isUpload?: boolean
  isInitiallyUnlisted?: boolean
  initialPremiumConditions?: PremiumConditions
}

export const AccessAndSaleMenuFields = (props: AccesAndSaleMenuFieldsProps) => {
  const { isRemix, isUpload, isInitiallyUnlisted, initialPremiumConditions } =
    props

  const accountUserId = useSelector(getUserId)
  const { isEnabled: isUsdcEnabled } = useFlag(FeatureFlags.USDC_PURCHASES)
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
    useField<AccessAndSaleFormValues[typeof PREMIUM_CONDITIONS]>(
      PREMIUM_CONDITIONS
    )
  const [
    { value: fieldVisibilityValue },
    ,
    { setValue: setfieldVisibilityValue }
  ] =
    useField<AccessAndSaleFormValues[typeof FIELD_VISIBILITY]>(FIELD_VISIBILITY)
  const [{ value: previewValue }, , { setValue: setPreviewValue }] =
    useField<AccessAndSaleFormValues[typeof PREVIEW]>(PREVIEW)

  const [availabilityField, , { setValue: setAvailabilityValue }] = useField({
    name: AVAILABILITY_TYPE
  })

  const { ethCollectionMap, solCollectionMap } = useSelector(
    getSupportedUserCollections
  )
  const numEthCollectibles = Object.keys(ethCollectionMap).length
  const numSolCollectibles = Object.keys(solCollectionMap).length
  const hasCollectibles = numEthCollectibles + numSolCollectibles > 0

  const noUsdcPurchase =
    !isUpload &&
    !isPremiumContentUSDCPurchaseGated(initialPremiumConditions) &&
    !isInitiallyUnlisted

  const noCollectibleGate =
    isRemix ||
    !hasCollectibles ||
    (!isUpload &&
      !isPremiumContentCollectibleGated(initialPremiumConditions) &&
      !isInitiallyUnlisted)
  const noCollectibleDropdown =
    noCollectibleGate || (!isUpload && !isInitiallyUnlisted)

  const noSpecialAccess =
    !isUpload &&
    !isPremiumContentFollowGated(initialPremiumConditions) &&
    !isPremiumContentTipGated(initialPremiumConditions) &&
    !isInitiallyUnlisted
  const noSpecialAccessOptions =
    noSpecialAccess || (!isUpload && !isInitiallyUnlisted)

  const noHidden = !isUpload && !isInitiallyUnlisted

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const type = e.target.value as TrackAvailabilityType
      switch (type) {
        case TrackAvailabilityType.PUBLIC: {
          setPremiumConditionsValue(null)
          break
        }
        case TrackAvailabilityType.USDC_PURCHASE: {
          if (!isPremiumContentUSDCPurchaseGated(premiumConditionsValue)) {
            setPremiumConditionsValue(null)
          }
          if (!previewValue) {
            setPreviewValue(0)
          }
          break
        }
        case TrackAvailabilityType.SPECIAL_ACCESS: {
          if (
            !accountUserId ||
            isPremiumContentTipGated(premiumConditionsValue)
          )
            break
          setPremiumConditionsValue({ follow_user_id: accountUserId })
          break
        }
        case TrackAvailabilityType.COLLECTIBLE_GATED:
          if (
            !accountUserId ||
            isPremiumContentCollectibleGated(premiumConditionsValue)
          )
            break
          setPremiumConditionsValue(null)
          break
        case TrackAvailabilityType.HIDDEN:
          if (!fieldVisibilityValue) break
          setfieldVisibilityValue({
            ...fieldVisibilityValue,
            ...defaultHiddenFields
          })
          break
      }
      setAvailabilityValue(type)
    },
    [
      accountUserId,
      fieldVisibilityValue,
      premiumConditionsValue,
      previewValue,
      setAvailabilityValue,
      setPremiumConditionsValue,
      setPreviewValue,
      setfieldVisibilityValue
    ]
  )

  return (
    <div className={cn(layoutStyles.col, layoutStyles.gap4)}>
      {isRemix ? (
        <HelpCallout className={styles.isRemix} content={messages.isRemix} />
      ) : null}
      <Text>{messages.modalDescription}</Text>
      <RadioButtonGroup {...availabilityField} onChange={handleChange}>
        <ModalRadioItem
          icon={<IconVisibilityPublic className={styles.icon} />}
          label={messages.public}
          description={messages.publicSubtitle}
          value={TrackAvailabilityType.PUBLIC}
        />
        {isUsdcEnabled ? (
          <ModalRadioItem
            icon={<IconCart />}
            label={messages.usdcPurchase}
            description={messages.usdcPurchaseSubtitle}
            value={TrackAvailabilityType.USDC_PURCHASE}
            disabled={noUsdcPurchase}
            checkedContent={<UsdcPurchaseFields disabled={noSpecialAccess} />}
          />
        ) : null}

        {isSpecialAccessEnabled ? (
          <ModalRadioItem
            icon={<IconSpecialAccess />}
            label={messages.specialAccess}
            description={messages.specialAccessSubtitle}
            value={TrackAvailabilityType.SPECIAL_ACCESS}
            disabled={noSpecialAccess}
            checkedContent={
              <SpecialAccessFields disabled={noSpecialAccessOptions} />
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
                isUpload={true}
              />
            }
            checkedContent={
              <CollectibleGatedFields disabled={noCollectibleDropdown} />
            }
          />
        ) : null}
        <ModalRadioItem
          icon={<IconHidden />}
          label={messages.hidden}
          value={TrackAvailabilityType.HIDDEN}
          description={messages.hiddenSubtitle}
          disabled={noHidden}
          checkedContent={<HiddenAvailabilityFields />}
        />
      </RadioButtonGroup>
    </div>
  )
}
