import { DogEarType } from 'models/DogEar'
import { PremiumConditions } from 'models/Track'

import { Nullable } from './typeUtils'

type GetDogEarTypeArgs = {
  doesUserHaveAccess?: boolean
  isArtistPick?: boolean
  isOwner?: boolean
  isUnlisted?: boolean
  premiumConditions?: Nullable<PremiumConditions>
}

export const getDogEarType = ({
  doesUserHaveAccess,
  isArtistPick,
  isOwner,
  isUnlisted,
  premiumConditions
}: GetDogEarTypeArgs) => {
  // Unlisted is mutually exclusive from other dog ear types
  if (isUnlisted) {
    return DogEarType.HIDDEN
  }

  // Show premium variants for track owners or if user does not yet have access
  if ((isOwner || !doesUserHaveAccess) && premiumConditions != null) {
    if (premiumConditions.usdc_purchase) {
      return DogEarType.USDC_PURCHASE
    }
    if (premiumConditions.nft_collection) {
      return DogEarType.COLLECTIBLE_GATED
    }
    if (premiumConditions.follow_user_id || premiumConditions.tip_user_id) {
      return DogEarType.SPECIAL_ACCESS
    }
  }

  // If no premium variant, optionally show artist pick if applicable
  if (isArtistPick) {
    return DogEarType.STAR
  }

  return undefined
}
