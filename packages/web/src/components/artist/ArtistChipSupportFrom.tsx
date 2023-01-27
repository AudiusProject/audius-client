import { useEffect, useState } from 'react'

import {
  ID,
  StringWei,
  Nullable,
  formatWei,
  stringWeiToBN,
  tippingSelectors
} from '@audius/common'
import cn from 'classnames'

import { ReactComponent as IconTip } from 'assets/img/iconTip.svg'
import { useSelector } from 'common/hooks/useSelector'

import styles from './ArtistChip.module.css'
const { getOptimisticSupporting } = tippingSelectors

const messages = {
  audio: '$AUDIO'
}

type ArtistChipTipsProps = {
  artistId: ID
  userId: ID
}

export const ArtistChipSupportFrom = ({
  artistId,
  userId
}: ArtistChipTipsProps) => {
  const supportingMap = useSelector(getOptimisticSupporting)
  const [amount, setAmount] = useState<Nullable<StringWei>>(null)

  useEffect(() => {
    if (artistId && userId) {
      const userSupportingMap = supportingMap[userId] ?? {}
      const artistSupporting = userSupportingMap[artistId] ?? {}
      setAmount(artistSupporting.amount ?? null)
    }
  }, [artistId, supportingMap, userId])

  return (
    <div className={styles.tipContainer}>
      {amount && (
        <div className={cn(styles.amount)}>
          <IconTip className={styles.icon} />
          <span className={styles.value}>
            {formatWei(stringWeiToBN(amount), true)}
          </span>
          <span className={styles.label}>{messages.audio}</span>
        </div>
      )}
    </div>
  )
}
