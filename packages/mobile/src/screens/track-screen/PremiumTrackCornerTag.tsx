import type { PremiumConditions } from '@audius/common'

import IconCollectibleCornerTag from 'app/assets/images/iconCollectibleCornerTag.svg'
import IconLockedCornerTag from 'app/assets/images/iconLockedCornerTag.svg'
import IconSpecialAccessCornerTag from 'app/assets/images/iconSpecialAccessCornerTag.svg'
import { useIsPremiumContentEnabled } from 'app/hooks/useIsPremiumContentEnabled'
import { makeStyles } from 'app/styles'

const useStyles = makeStyles(() => ({
  icon: {
    position: 'absolute'
  }
}))

type PremiumTrackCornerTagProps = {
  doesUserHaveAccess: boolean
  isOwner: boolean
  premiumConditions: PremiumConditions
}

export const PremiumTrackCornerTag = ({
  doesUserHaveAccess,
  isOwner,
  premiumConditions
}: PremiumTrackCornerTagProps) => {
  const isPremiumContentEnabled = useIsPremiumContentEnabled()
  const styles = useStyles()

  if (!isPremiumContentEnabled) {
    return null
  }

  if (isOwner) {
    if (premiumConditions.nft_collection) {
      return <IconCollectibleCornerTag style={styles.icon} />
    }
    return <IconSpecialAccessCornerTag style={styles.icon} />
  }

  if (doesUserHaveAccess) {
    return null
  }

  return <IconLockedCornerTag style={styles.icon} />
}
