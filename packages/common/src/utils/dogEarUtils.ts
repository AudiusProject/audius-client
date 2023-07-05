import { DogEarType } from 'models/DogEar'
import { PremiumConditions, PremiumContentType } from 'models/Track'

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
    switch (premiumConditions.type) {
      case PremiumContentType.COLLECTIBLE_GATED:
        return DogEarType.COLLECTIBLE_GATED
      case PremiumContentType.FOLLOW_GATED || PremiumContentType.TIP_GATED:
        return DogEarType.SPECIAL_ACCESS
      case PremiumContentType.USDC_PURCHASE:
        return DogEarType.USDC_PURCHASE
    }
  }

  // If no premium variant, optionally show artist pick if applicable
  if (isArtistPick) {
    return DogEarType.STAR
  }

  return undefined
}
