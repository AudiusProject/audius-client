import { useCallback } from 'react'

import {
  BN_USDC_CENT_WEI,
  BNUSDC,
  ceilingBNUSDCToNearestCent,
  ContentType,
  isContentPurchaseInProgress,
  isPremiumContentUSDCPurchaseGated,
  purchaseContentActions,
  purchaseContentSelectors,
  PurchaseContentStage,
  Track,
  UserTrackMetadata
} from '@audius/common'
import {
  HarmonyButton,
  HarmonyButtonType,
  IconCaretRight,
  IconCheck,
  IconError
} from '@audius/stems'
import BN from 'bn.js'
import { useDispatch, useSelector } from 'react-redux'

import { Icon } from 'components/Icon'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { LockedTrackDetailsTile } from 'components/track/LockedTrackDetailsTile'
import { TwitterShareButton } from 'components/twitter-share-button/TwitterShareButton'
import { Text } from 'components/typography'

import { FormatPrice } from './FormatPrice'
import { PayToUnlockInfo } from './PayToUnlockInfo'
import styles from './PurchaseDetailsPage.module.css'
import {
  PurchaseSummaryTable,
  PurchaseSummaryTableProps
} from './PurchaseSummaryTable'

const { startPurchaseContentFlow } = purchaseContentActions
const { getPurchaseContentFlowStage, getPurchaseContentError } =
  purchaseContentSelectors

const messages = {
  buy: 'Buy',
  purchasing: 'Purchasing',
  purchaseSuccessful: 'Your Purchase Was Successful!',
  error: 'Your purchase was unsuccessful.',
  shareButtonContent: 'I just purchased a track on Audius!',
  viewTrack: 'View Track'
}

const zeroBalance = () => new BN(0) as BNUSDC

const getPurchaseSummaryValues = (
  price: number,
  currentBalance: BNUSDC
): PurchaseSummaryTableProps => {
  let amountDue = price
  let existingBalance
  const priceBN = new BN(price).mul(BN_USDC_CENT_WEI)

  if (currentBalance.gte(priceBN)) {
    amountDue = 0
    existingBalance = price
  }
  // Only count the balance if it's greater than 1 cent
  else if (currentBalance.gt(BN_USDC_CENT_WEI)) {
    // Note: Rounding amount due *up* to nearest cent for cases where the balance
    // is between cents so that we aren't advertising *lower* than what the user
    // will have to pay.
    const diff = priceBN.sub(currentBalance)
    amountDue = ceilingBNUSDCToNearestCent(diff as BNUSDC)
      .div(BN_USDC_CENT_WEI)
      .toNumber()
    existingBalance = price - amountDue
  }

  return { amountDue, existingBalance, basePrice: price, artistCut: price }
}

const ContentPurchaseError = () => {
  return (
    <Text className={styles.errorContainer} color='--accent-red'>
      <Icon icon={IconError} size='medium' />
      {messages.error}
    </Text>
  )
}

export type PurchaseDetailsPageProps = {
  currentBalance?: BNUSDC
  track: UserTrackMetadata
  onViewTrackClicked: () => void
}

export const PurchaseDetailsPage = ({
  currentBalance = zeroBalance(),
  track,
  onViewTrackClicked
}: PurchaseDetailsPageProps) => {
  const dispatch = useDispatch()
  const stage = useSelector(getPurchaseContentFlowStage)
  const error = useSelector(getPurchaseContentError)
  const isUnlocking = !error && isContentPurchaseInProgress(stage)
  const isPurchased = stage !== PurchaseContentStage.FINISH

  const onClickBuy = useCallback(() => {
    if (isUnlocking) return

    dispatch(
      startPurchaseContentFlow({
        contentId: track.track_id,
        contentType: ContentType.TRACK
      })
    )
  }, [isUnlocking, dispatch, track.track_id])

  if (!isPremiumContentUSDCPurchaseGated(track.premium_conditions)) {
    console.error(
      `Loaded Purchase modal with a non-USDC-gated track: ${track.track_id}`
    )
    return null
  }

  const { price } = track.premium_conditions.usdc_purchase

  const purchaseSummaryValues = getPurchaseSummaryValues(price, currentBalance)
  const { basePrice, amountDue } = purchaseSummaryValues

  const textContent = isUnlocking ? (
    <div className={styles.purchaseButtonText}>
      <LoadingSpinner className={styles.purchaseButtonSpinner} />
      <span>{messages.purchasing}</span>
    </div>
  ) : amountDue > 0 ? (
    <div className={styles.purchaseButtonText}>
      {messages.buy}
      <FormatPrice basePrice={basePrice} amountDue={amountDue} />
    </div>
  ) : (
    messages.buy
  )

  return (
    <div className={styles.container}>
      <LockedTrackDetailsTile
        // TODO: Remove this cast once typing is correct
        // https://linear.app/audius/issue/C-2899/fix-typing-for-computed-properties
        track={track as unknown as Track}
        owner={track.user}
      />
      <PurchaseSummaryTable
        {...purchaseSummaryValues}
        isPurchased={isPurchased}
      />
      {isPurchased ? (
        <>
          <div className={styles.purchaseSuccessfulContainer}>
            <div className={styles.completionCheck}>
              <Icon icon={IconCheck} size='xxSmall' color='white' />
            </div>
            <Text variant='heading' size='small'>
              {messages.purchaseSuccessful}
            </Text>
          </div>
          {/* TODO: Add View Track plain button and add TODO for moving notifications to use common button */}
          <TwitterShareButton
            fullWidth
            type='static'
            shareText={messages.shareButtonContent}
          />
          <HarmonyButton
            onClick={onViewTrackClicked}
            iconRight={IconCaretRight}
            variant={HarmonyButtonType.PLAIN}
            text={messages.viewTrack}
          />
        </>
      ) : (
        <>
          <PayToUnlockInfo />
          <HarmonyButton
            disabled={isUnlocking}
            color='specialLightGreen'
            onClick={onClickBuy}
            text={textContent}
            fullWidth
          />
        </>
      )}
      {error ? <ContentPurchaseError /> : null}
    </div>
  )
}
