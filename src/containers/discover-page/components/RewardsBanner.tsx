import React from 'react'
import cn from 'classnames'

import styles from './RewardsBanner.module.css'
import { IconArrow, IconCrown } from '@audius/stems'
import { isMobile } from 'utils/clientUtil'

const messages = {
  rewards: '$AUDIO REWARDS',
  tracksDescription: 'TOP 5 TRACKS EACH WEEK WIN $AUDIO',
  playlistsDescription: 'TOP 5 PLAYLISTS EACH WEEK WIN $AUDIO',
  learnMore: 'LEARN MORE'
}

const messageMap = {
  tracks: {
    description: messages.tracksDescription
  },
  playlists: {
    description: messages.playlistsDescription
  }
}

type RewardsBannerProps = {
  bannerType: 'tracks' | 'playlists'
  onClick?: () => void
}

const RewardsBanner = ({
  bannerType,
  onClick = () => {}
}: RewardsBannerProps) => {
  const mobile = isMobile()
  const mobileStyle = { [styles.mobile]: mobile }
  return (
    <div className={cn(cn(styles.container, mobileStyle))} onClick={onClick}>
      <div className={cn(styles.rewardsText, mobileStyle)}>
        <div className={styles.iconCrown}>
          <IconCrown />
        </div>
        {messages.rewards}
      </div>
      <span className={styles.descriptionText}>
        {messageMap[bannerType].description}
      </span>
      {!mobile && (
        <div className={styles.learnMore}>
          {messages.learnMore}
          <IconArrow />
        </div>
      )}
    </div>
  )
}

export default RewardsBanner
