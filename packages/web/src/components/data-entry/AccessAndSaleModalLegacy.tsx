import { useMemo } from 'react'

import {
  Track,
  TrackAvailabilityType,
  isPremiumContentCollectibleGated,
  isPremiumContentFollowGated,
  isPremiumContentTipGated,
  isPremiumContentUSDCPurchaseGated
} from '@audius/common'
import {
  Button,
  ButtonSize,
  ButtonType,
  IconCart,
  IconCollectible,
  IconHidden,
  IconSpecialAccess,
  IconVisibilityPublic
} from '@audius/stems'
import { set, isEmpty, get } from 'lodash'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import { TrackMetadataState } from 'components/track-availability-modal/types'
import { defaultFieldVisibility } from 'pages/track-page/utils'
import {
  AVAILABILITY_TYPE,
  AccessAndSaleFormValues,
  AccessAndSaleMenuFields,
  FIELD_VISIBILITY,
  IS_PREMIUM,
  IS_UNLISTED,
  PREMIUM_CONDITIONS,
  PREVIEW,
  PRICE,
  PRICE_HUMANIZED,
  SPECIAL_ACCESS_TYPE
} from 'pages/upload-page/fields/AccessAndSaleField'
import { SpecialAccessType } from 'pages/upload-page/fields/availability/SpecialAccessFields'

import styles from './AccessAndSaleModalLegacy.module.css'
import { ContextualMenu } from './ContextualMenu'
import {
  PremiumConditionsFollowUserId,
  PremiumConditionsNFTCollection,
  PremiumConditionsTipUserId
} from '@audius/sdk'

const messages = {
  title: 'Access & Sale',
  description:
    "Customize your music's availability for different audiences, and create personalized gated experiences for your fans.",
  public: 'Public (Default)',
  premium: 'Premium',
  specialAccess: 'Special Access',
  collectibleGated: 'Collectible Gated',
  hidden: 'Hidden',
  errors: {
    price: {
      tooLow: 'Price must be at least $0.99',
      tooHigh: 'Price must be less than $9.99'
    },
    preview: {
      tooEarly: 'Preview must start during the track',
      tooLate:
        'Preview must start at lest 15 seconds before the end of the track'
    }
  }
}

const AccessAndSaleFormSchema = (trackLength: number) =>
  z
    .object({
      [PREMIUM_CONDITIONS]: z.nullable(
        z.object({
          // TODO: there are other types
          usdc_purchase: z.optional(
            z.object({
              price: z
                .number()
                .lte(999, messages.errors.price.tooHigh)
                .gte(99, messages.errors.price.tooLow)
            })
          )
        })
      ),
      [PREVIEW]: z.optional(z.number())
    })
    .refine(
      (values) => {
        const formValues = values as AccessAndSaleFormValues
        if (isPremiumContentUSDCPurchaseGated(formValues[PREMIUM_CONDITIONS])) {
          return formValues[PREVIEW] !== undefined && formValues[PREVIEW] >= 0
        }
        return true
      },
      { message: messages.errors.preview.tooEarly, path: [PREVIEW] }
    )
    .refine(
      (values) => {
        const formValues = values as AccessAndSaleFormValues
        if (isPremiumContentUSDCPurchaseGated(formValues[PREMIUM_CONDITIONS])) {
          return (
            formValues[PREVIEW] === undefined ||
            (formValues[PREVIEW] >= 0 && formValues[PREVIEW] < trackLength - 15)
          )
        }
        return true
      },
      { message: messages.errors.preview.tooLate, path: [PREVIEW] }
    )

type AccessAndSaleModalLegacyProps = {
  isRemix: boolean
  isUpload: boolean
  initialForm: Track
  metadataState: TrackMetadataState
  trackLength: number
  didUpdateState: (newState: TrackMetadataState) => void
}

export const AccessAndSaleModalLegacy = (
  props: AccessAndSaleModalLegacyProps
) => {
  const {
    isUpload,
    isRemix,
    initialForm,
    metadataState,
    trackLength,
    didUpdateState
  } = props
  const {
    premium_conditions: premiumConditions,
    unlisted: isUnlisted,
    is_premium: isPremium,
    preview_start_seconds: preview,
    ...fieldVisibility
  } = metadataState

  const initialValues: AccessAndSaleFormValues = useMemo(() => {
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
      set(
        initialValues,
        PRICE_HUMANIZED,
        (Number(premiumConditions.usdc_purchase.price || 0) / 100).toFixed(2)
      )
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

  const onSubmit = (values: AccessAndSaleFormValues) => {
    let newState = {
      ...metadataState,
      is_premium: !isEmpty(values[PREMIUM_CONDITIONS]),
      premium_conditions: values[PREMIUM_CONDITIONS],
      unlisted: values.is_unlisted
    }

    if (
      get(values, AVAILABILITY_TYPE) === TrackAvailabilityType.USDC_PURCHASE
    ) {
      newState.is_premium = true
      const price = Math.round(get(values, PRICE))
      newState.premium_conditions = {
        // @ts-ignore splits get added in saga
        usdc_purchase: {
          price
        }
      }
      newState.preview_start_seconds = values[PREVIEW] ?? 0
    }

    if (get(values, AVAILABILITY_TYPE) === TrackAvailabilityType.HIDDEN) {
      newState = {
        ...newState,
        ...(get(values, FIELD_VISIBILITY) ?? undefined),
        unlisted: true
      }
    } else {
      newState = {
        ...newState,
        ...defaultFieldVisibility,
        unlisted: false
      }
    }

    didUpdateState(newState)
  }

  let availabilityButtonTitle = messages.public
  let AvailabilityIcon = IconVisibilityPublic
  if (isUnlisted) {
    availabilityButtonTitle = messages.hidden
    AvailabilityIcon = IconHidden
  } else if (isPremium) {
    if (isPremiumContentUSDCPurchaseGated(premiumConditions)) {
      availabilityButtonTitle = messages.premium
      AvailabilityIcon = IconCart
    } else if (isPremiumContentCollectibleGated(premiumConditions)) {
      availabilityButtonTitle = messages.collectibleGated
      AvailabilityIcon = IconCollectible
    } else {
      availabilityButtonTitle = messages.specialAccess
      AvailabilityIcon = IconSpecialAccess
    }
  }

  return (
    <ContextualMenu
      label={messages.title}
      description={messages.description}
      icon={<IconHidden />}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={toFormikValidationSchema(
        // @ts-ignore
        AccessAndSaleFormSchema(trackLength)
      )}
      menuFields={
        <AccessAndSaleMenuFields
          isRemix={isRemix}
          isUpload={isUpload}
          isInitiallyUnlisted={initialForm[IS_UNLISTED]}
          initialPremiumConditions={
            initialForm[PREMIUM_CONDITIONS] ?? undefined
          }
          premiumConditions={metadataState.premium_conditions}
        />
      }
      renderValue={() => null}
      previewOverride={(toggleMenu) => (
        <Button
          className={styles.availabilityButton}
          type={ButtonType.COMMON_ALT}
          name='availabilityModal'
          text={availabilityButtonTitle}
          size={ButtonSize.SMALL}
          onClick={toggleMenu}
          leftIcon={<AvailabilityIcon />}
        />
      )}
    />
  )
}
