import React, { ReactNode } from 'react'
import { Tile } from './components/ExplainerTile'
import styles from './RewardsTile.module.css'
import { Button, ButtonType, IconArrow } from '@audius/stems'
import { useWithMobileStyle } from 'hooks/useWithMobileStyle'

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
      <Button
        className={styles.rewardButton}
        text={buttonText}
        onClick={onClickButton}
        type={ButtonType.PRIMARY_ALT}
        rightIcon={<IconArrow />}
        iconClassName={styles.buttonIcon}
      />
    </div>
  )
}

const rewardsMap: { [id in RewardID]: RewardPanelProps } = {
  'trending-playlist': {
    title: 'Top 5 Trending Playlists',
    icon: <i className='emoji large chart-increasing' />,
    description: 'Winners are selected every Friday at Noon PT!',
    buttonText: 'See More',
    onClickButton: () => {},
    id: 'trending-playlist'
  },
  'trending-track': {
    title: 'Top 5 Trending Tracks',
    icon: <i className='emoji large chart-increasing' />,
    description: 'Winners are selected every Friday at Noon PT!',
    buttonText: 'See More',
    onClickButton: () => {},
    id: 'trending-track'
  },
  'top-api': {
    title: 'Top 10 API Apps',
    icon: <i className='emoji large nerd-face' />,
    description: 'The top 10 Audius API apps each month win',
    buttonText: 'More Info',
    onClickButton: () => {},
    id: 'top-api'
  },
  'verified-upload': {
    title: 'Verified Upload',
    icon: <i className='emoji large white-heavy-check-mark' />,
    description: 'Verified on Twitter/Instagram? Upload & tag us',
    buttonText: 'More Info',
    onClickButton: () => {},
    id: 'verified-upload'
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
  const rewardsTiles = rewardIds
    .map(id => rewardsMap[id])
    .map(props => <RewardPanel {...props} key={props.id} />)

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
