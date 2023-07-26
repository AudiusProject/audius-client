import { premiumContentSelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import { LockedTrackDetailsTile } from 'components/track/LockedTrackDetailsTile'

const { getPurchaseContentId } = premiumContentSelectors

export const PurchaseDetailsPage = () => {
  const trackId = useSelector(getPurchaseContentId)

  return trackId ? (
    <div>
      <LockedTrackDetailsTile trackId={trackId} />
    </div>
  ) : null
}
