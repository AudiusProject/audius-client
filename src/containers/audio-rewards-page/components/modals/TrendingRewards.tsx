import { TabSlider } from '@audius/stems'
import React, { useCallback } from 'react'
import styles from './TrendingRewards.module.css'
import { TwitterTweetEmbed } from 'react-twitter-embed'
import {} from 'store/application/ui/modals/slice'
import { useModalState } from 'store/application/ui/modals/hooks'
import ModalDrawer from './ModalDrawer'
import ButtonWithArrow from '../ButtonWithArrow'
import { TRENDING_PAGE, TRENDING_PLAYLISTS_PAGE } from 'utils/route'
import { useWithMobileStyle } from 'hooks/useWithMobileStyle'
import { useNavigateToPage } from 'hooks/useNavigateToPage'
import { useSelector } from 'utils/reducer'
import {
  getTrendingRewardsModalType,
  TrendingRewardsModalType,
  setTrendingRewardsModalType
} from 'containers/audio-rewards-page/store/slice'
import { useDispatch } from 'react-redux'

const messages = {
  tracksTitle: 'Top 5 Tracks Each Week Receive 100 $AUDIO',
  playlistTitle: 'Top 5 Playlists Each Week Receive 100 $AUDIO',
  winners: 'Winners are selected every Friday at Noon PT!',
  lastWeek: "LAST WEEK'S WINNERS",
  topTracks: 'TOP TRACKS',
  topPlaylists: 'TOP PLAYLISTS',
  terms: 'Terms and Conditions Apply',
  modalTitle: '$AUDIO REWARDS',
  buttonTextTracks: 'Trending Tracks',
  buttonTextPlaylists: 'Trending Playlists'
}

const textMap = {
  playlists: {
    title: messages.playlistTitle,
    button: messages.buttonTextPlaylists
  },
  tracks: {
    title: messages.tracksTitle,
    button: messages.buttonTextTracks
  }
}

const useRewardsType = (): [
  TrendingRewardsModalType,
  (type: TrendingRewardsModalType) => void
] => {
  const dispatch = useDispatch()
  const rewardsType = useSelector(getTrendingRewardsModalType)
  const setTrendingRewardsType = useCallback(
    (type: TrendingRewardsModalType) => {
      dispatch(setTrendingRewardsModalType({ modalType: type }))
    },
    [dispatch]
  )
  return [rewardsType, setTrendingRewardsType]
}

const TWEET_ID = '1369707723726544896'

const TrendingRewardsBody = ({
  dismissModal
}: {
  dismissModal: () => void
}) => {
  const [modalType, setModalType] = useRewardsType()

  const tabOptions = [
    {
      key: 'tracks',
      text: messages.topTracks
    },
    {
      key: 'playlists',
      text: messages.topPlaylists
    }
  ]

  const navigate = useNavigateToPage()

  const onButtonClick = useCallback(() => {
    const page =
      modalType === 'tracks' ? TRENDING_PAGE : TRENDING_PLAYLISTS_PAGE
    navigate(page)
    dismissModal()
  }, [navigate, modalType, dismissModal])

  const wm = useWithMobileStyle(styles.mobile)

  return (
    <div className={wm(styles.container)}>
      <div className={styles.sliderContainer}>
        <TabSlider
          options={tabOptions}
          selected={modalType}
          onSelectOption={option =>
            setModalType(option as TrendingRewardsModalType)
          }
          textClassName={styles.slider}
          activeTextClassName={styles.activeSlider}
        />
      </div>
      <div className={styles.titles}>
        <span className={styles.title}>{textMap[modalType].title}</span>
        <span className={styles.subtitle}>{messages.winners}</span>
      </div>
      <div className={styles.insetRegion}>
        <span className={styles.lastWeek}>{messages.lastWeek}</span>
        <div className={styles.embedWrapper}>
          <TwitterTweetEmbed tweetId={TWEET_ID} />
        </div>
      </div>
      <ButtonWithArrow
        text={textMap[modalType].button}
        onClick={onButtonClick}
        className={styles.button}
      />
      <a href='' className={styles.terms}>
        {messages.terms}
      </a>
    </div>
  )
}

export const TrendingRewardsModal = () => {
  const [isOpen, setOpen] = useModalState('TrendingRewardsExplainer')

  return (
    <ModalDrawer
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      title={messages.modalTitle}
    >
      <TrendingRewardsBody dismissModal={() => setOpen(false)} />
    </ModalDrawer>
  )
}

export default TrendingRewardsModal
