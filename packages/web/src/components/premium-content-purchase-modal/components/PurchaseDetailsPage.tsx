import { useCallback } from 'react'

import {
  ContentType,
  formatPrice,
  isPremiumContentUSDCPurchaseGated,
  purchaseContentActions,
  Track,
  UserTrackMetadata
} from '@audius/common'
import { HarmonyButton } from '@audius/stems'
import { useDispatch } from 'react-redux'

import { LockedTrackDetailsTile } from 'components/track/LockedTrackDetailsTile'

import { PayToUnlockInfo } from './PayToUnlockInfo'
import styles from './PurchaseDetailsPage.module.css'
import { PurchaseSummaryTable } from './PurchaseSummaryTable'

const { startPurchaseContentFlow } = purchaseContentActions

const messages = {
  buy: (price: string) => `Buy $${price}`
}

export const PurchaseDetailsPage = ({
  track
}: {
  track: UserTrackMetadata
}) => {
  const dispatch = useDispatch()

  const onClickBuy = useCallback(() => {
    dispatch(
      startPurchaseContentFlow({
        contentId: track.track_id,
        contentType: ContentType.TRACK
      })
    )
  }, [dispatch, track.track_id])

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
      <PayToUnlockInfo />
      <HarmonyButton
        color='specialLightGreen'
        onClick={onClickBuy}
        text={messages.buy(formatPrice(price))}
        fullWidth
      />
    </div>
  )
}
