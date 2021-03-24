import React, { ReactNode } from 'react'
import { Tile } from './components/ExplainerTile'
import styles from './RewardsTile.module.css'
import { useWithMobileStyle } from 'hooks/useWithMobileStyle'
import { useSetVisibility } from 'store/application/ui/modals/hooks'
import ButtonWithArrow from './components/ButtonWithArrow'

// TODO: pull from optimizely

type RewardID =
  | 'trending-track'
  | 'trending-playlist'
  | 'top-api'
  | 'verified-upload'

type RewardPanelProps = {
  title: string
  icon: ReactNode
  description: string
  buttonText: string
  onClickButton: () => void
  id: RewardID
}

const RewardPanel = ({
  title,
  description,
  buttonText,
  onClickButton,
  icon
}: RewardPanelProps) => {
  const wm = useWithMobileStyle(styles.mobile)

  return (
    <div className={wm(styles.rewardPanelContainer)}>
      <span className={wm(styles.rewardTitle)}>
        {icon}
        {title}
      </span>
      <span className={wm(styles.rewardDescription)}>{description}</span>
      <ButtonWithArrow text={buttonText} onClick={onClickButton} />
    </div>
  )
}

const rewardsMap = {
  'trending-playlist': {
    title: 'Top 5 Trending Playlists',
    icon: <i className='emoji large chart-increasing' />,
    description: 'Winners are selected every Friday at Noon PT!',
    buttonText: 'See More',
    id: 'trending-playlist' as 'trending-playlist'
  },
  'trending-track': {
    title: 'Top 5 Trending Tracks',
    icon: <i className='emoji large chart-increasing' />,
    description: 'Winners are selected every Friday at Noon PT!',
    buttonText: 'See More',
    id: 'trending-track' as 'trending-track'
  },
  'top-api': {
    title: 'Top 10 API Apps',
    icon: <i className='emoji large nerd-face' />,
    description: 'The top 10 Audius API apps each month win',
    buttonText: 'More Info',
    id: 'top-api' as 'top-api'
  },
  'verified-upload': {
    title: 'Verified Upload',
    icon: <i className='emoji large white-heavy-check-mark' />,
    description: 'Verified on Twitter/Instagram? Upload & tag us',
    buttonText: 'More Info',
    id: 'verified-upload' as 'verified-upload'
  }
}

type RewardsTileProps = {
  className?: string
}

// TODO: optimizely
const rewardIds: RewardID[] = [
  'trending-track',
  'trending-playlist',
  'top-api',
  'verified-upload'
]

const messages = {
  title: '$AUDIO REWARDS',
  description1: 'Win contests and complete tasks to earn $AUDIO tokens!',
  description2:
    'Opportunities to earn $AUDIO will change, so check back often for more chances to earn!'
}

const RewardsTile = ({ className }: RewardsTileProps) => {
  const setVisibility = useSetVisibility()
  const callbacksMap = {
    'trending-track': () => {
      setVisibility('TrendingRewardsExplainer')(true)
    },
    'trending-playlist': () => {
      setVisibility('TrendingRewardsExplainer')(true)
    },
    'top-api': () => {
      setVisibility('APIRewardsExplainer')(true)
    },
    'verified-upload': () => {
      setVisibility('LinkSocialRewardsExplainer')(true)
    }
  }

  const rewardsTiles = rewardIds
    .map(id => rewardsMap[id])
    .map(props => (
      <RewardPanel
        {...props}
        onClickButton={callbacksMap[props.id]}
        key={props.id}
      />
    ))

  const wm = useWithMobileStyle(styles.mobile)

  return (
    <Tile className={wm(styles.rewardsTile, className)}>
      <span className={wm(styles.title)}>{messages.title}</span>
      <div className={wm(styles.subtitle)}>
        <span>{messages.description1}</span>
        <span>{messages.description2}</span>
      </div>
      <div className={styles.rewardsContainer}>{rewardsTiles}</div>
    </Tile>
  )
}

export default RewardsTile
