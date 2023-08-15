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
  IconCollectible,
  IconHidden,
  IconSpecialAccess,
  IconVisibilityPublic
} from '@audius/stems'
import { set, isEmpty, get } from 'lodash'

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
  SPECIAL_ACCESS_TYPE
} from 'pages/upload-page/fields/AccessAndSaleField'
import { SpecialAccessType } from 'pages/upload-page/fields/availability/SpecialAccessFields'

import styles from './AccessAndSaleModalLegacy.module.css'
import { ContextualMenu } from './ContextualMenu'

const messages = {
  title: 'Access & Sale',
  description:
    "Customize your music's availability for different audiences, and create personalized gated experiences for your fans.",
  public: 'Public (Default)',
  specialAccess: 'Special Access',
  collectibleGated: 'Collectible Gated',
  hidden: 'Hidden'
}

type AccessAndSaleModalLegacyProps = {
  isRemix: boolean
  isUpload: boolean
  initialForm: Track
  metadataState: TrackMetadataState
  didUpdateState: (newState: TrackMetadataState) => void
}

export const AccessAndSaleModalLegacy = (
  props: AccessAndSaleModalLegacyProps
) => {
  const { isRemix, metadataState, didUpdateState } = props
  // TODO: intialForm values should inform enabled fields for edit
  // Alternately, only use the new form for upload but not edit?
  const {
    premium_conditions: premiumConditions,
    unlisted: isUnlisted,
    is_premium: isPremium,
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
    // set(initialValues, PREVIEW, preview)
    set(
      initialValues,
      SPECIAL_ACCESS_TYPE,
      isTipGated ? SpecialAccessType.TIP : SpecialAccessType.FOLLOW
    )
    return initialValues as AccessAndSaleFormValues
  }, [fieldVisibility, isPremium, isUnlisted, premiumConditions])

  const onSubmit = (values: AccessAndSaleFormValues) => {
    let newState = {
      ...metadataState,
      is_premium: !isEmpty(premiumConditions),
      premium_conditions: values[PREMIUM_CONDITIONS],
      unlisted: values.is_unlisted
    }

    // TODO: usdc support
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
    if (premiumConditions && 'nft_collection' in premiumConditions) {
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
      menuFields={
        <AccessAndSaleMenuFields
          isRemix={isRemix}
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
