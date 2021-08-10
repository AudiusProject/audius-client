// @ts-nocheck
import React, { ReactNode, useEffect } from 'react'

import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { useRemoteVar } from 'containers/remote-config/hooks'
import { useSetVisibility } from 'hooks/useModalState'
import { useWithMobileStyle } from 'hooks/useWithMobileStyle'
import { StringKeys } from 'services/remote-config'
import fillString from 'utils/fillString'

import styles from './RewardsTile.module.css'
import ButtonWithArrow from './components/ButtonWithArrow'
import { Tile } from './components/ExplainerTile'
import ProgressBar from './components/ProgressBar'
import { challengeRewardsConfig } from './config'
import {
  fetchUserChallenges,
  ChallengeRewardsModalType,
  setChallengeRewardsModalType,
  getUserChallenges,
  getUserChallengesLoading
} from './store/slice'
import { ChallengeRewardID } from './types'

const TILE_TITLE = '$AUDIO REWARDS'
const TILE_DESC1 = 'Complete tasks to earn $AUDIO tokens!'
const TILE_DESC2 =
  'Opportunities to earn $AUDIO will change, so check back often for more chances to earn!'
const COMPLETE_LABEL = 'COMPLETE'

type RewardPanelProps = {
  title: string
  icon: ReactNode
  description: string
  buttonText: string
  progressLabel: string
  stepCount: number
  openModal: (modalType: ChallengeRewardsModalType) => void
  id: ChallengeRewardID
}

const RewardPanel = ({
  id,
  title,
  description,
  buttonText,
  openModal,
  progressLabel,
  icon,
  stepCount
}: RewardPanelProps) => {
  const wm = useWithMobileStyle(styles.mobile)
  const userChallenges = useSelector(getUserChallenges)

  const openRewardModal = () => openModal(id)

  const challenge = userChallenges.find(
    userChallenge => userChallenge.challenge_id === id
  )
  const currentStepCount = challenge?.current_step_count || 0
  const isComplete = currentStepCount === stepCount

  return (
    <div className={wm(styles.rewardPanelContainer)} onClick={openRewardModal}>
      <span className={wm(styles.rewardTitle)}>
        {icon}
        {title}
      </span>
      <span className={wm(styles.rewardDescription)}>{description}</span>
      <div className={wm(styles.rewardProgress)}>
        <p
          className={cn(styles.rewardProgressLabel, {
            [styles.complete]: isComplete
          })}
        >
          {isComplete
            ? COMPLETE_LABEL
            : fillString(
                progressLabel,
                currentStepCount.toString(),
                stepCount.toString()
              )}
        </p>
        {stepCount > 1 && (
          <ProgressBar
            className={styles.rewardProgressBar}
            value={currentStepCount}
            max={stepCount}
          />
        )}
      </div>
      <ButtonWithArrow
        className={wm(styles.panelButton)}
        text={buttonText}
        onClick={openRewardModal}
        textClassName={styles.buttonText}
      />
    </div>
  )
}

type RewardsTileProps = {
  className?: string
}

const validRewardIds: Record<ChallengeRewardID, 1> = {
  'invite-friends': 1,
  'connect-verified': 1,
  'listen-streak': 1,
  'mobile-app': 1,
  'profile-completion': 1,
  'track-upload': 1
}

const isValidRewardId = (s: string): s is ChallengeRewardID =>
  s in validRewardIds

/** Pulls rewards from remoteconfig */
const useRewardIds = () => {
  const rewardsString = useRemoteVar(StringKeys.CHALLENGE_REWARD_IDS)
  if (!rewardsString) return []
  const rewards = rewardsString.split(',')
  const filteredRewards: ChallengeRewardID[] = rewards.filter(isValidRewardId)
  return filteredRewards
}

const RewardsTile = ({ className }: RewardsTileProps) => {
  const setVisibility = useSetVisibility()
  const dispatch = useDispatch()
  const rewardIds = useRewardIds()
  const userChallengesLoading = useSelector(getUserChallengesLoading)

  useEffect(() => {
    dispatch(fetchUserChallenges())
  }, [dispatch])

  const openModal = (modalType: ChallengeRewardsModalType) => {
    dispatch(setChallengeRewardsModalType({ modalType }))
    setVisibility('ChallengeRewardsExplainer')(true)
  }

  const rewardsTiles = rewardIds
    .map(id => challengeRewardsConfig[id])
    .map(props => (
      <RewardPanel {...props} openModal={openModal} key={props.id} />
    ))

  const wm = useWithMobileStyle(styles.mobile)

  return (
    <Tile className={wm(styles.rewardsTile, className)}>
      <span className={wm(styles.title)}>{TILE_TITLE}</span>
      <div className={wm(styles.subtitle)}>
        <span>{TILE_DESC1}</span>
        <span>{TILE_DESC2}</span>
      </div>
      <div className={styles.rewardsContainer}>
        {userChallengesLoading ? <LoadingSpinner /> : rewardsTiles}
      </div>
    </Tile>
  )
}

export default RewardsTile
