import {
  isPremiumContentUSDCPurchaseGated,
  Track,
  UserTrackMetadata
} from '@audius/common'

import { LockedTrackDetailsTile } from 'components/track/LockedTrackDetailsTile'

import styles from './PurchaseDetailsPage.module.css'
import { PurchaseSummaryTable } from './PurchaseSummaryTable'

export const PurchaseDetailsPage = ({
  track
}: {
  track: UserTrackMetadata
}) => {
  if (!isPremiumContentUSDCPurchaseGated(track.premium_conditions)) {
    console.error(
      `Loaded Purchase modal with a non-USDC-gated track: ${track.track_id}`
    )
    return null
  }
  const { price } = track.premium_conditions.usdc_purchase
  return (
    <div className={styles.container}>
      <LockedTrackDetailsTile
        // TODO: Remove this cast once typing is correct
        // https://linear.app/audius/issue/C-2899/fix-typing-for-computed-properties
        track={track as unknown as Track}
        owner={track.user}
      />
      <PurchaseSummaryTable
        artistCut={price}
        amountDue={price}
        basePrice={price}
      />
    </div>
  )
}
