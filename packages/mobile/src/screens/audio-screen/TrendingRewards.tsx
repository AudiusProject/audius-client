import {
  StringKeys,
  audioRewardsPageActions,
  modalsActions
} from '@audius/common'
import type {
  TrendingRewardID,
  TrendingRewardsModalType,
  Modals
} from '@audius/common'
import { View } from 'react-native'
import { useDispatch } from 'react-redux'

import { useRemoteVar } from 'app/hooks/useRemoteConfig'
import { trendingRewardsConfig } from 'app/utils/challenges'

import { Panel } from './Panel'
const { setVisibility } = modalsActions
const { setTrendingRewardsModalType } = audioRewardsPageActions

const validRewardIds: Set<TrendingRewardID> = new Set([
  'trending-track',
  'trending-playlist',
  'top-api',
  'verified-upload',
  'trending-underground'
])

/** Pulls rewards from remoteconfig */
const useRewardIds = () => {
  const rewardsString = useRemoteVar(StringKeys.TRENDING_REWARD_IDS)
  console.log('getting rewards?', rewardsString)
  if (!rewardsString) return []
  const rewards = rewardsString.split(',') as TrendingRewardID[]
  const filteredRewards: TrendingRewardID[] = rewards.filter((reward) =>
    validRewardIds.has(reward)
  )
  return filteredRewards
}

export const TrendingRewards = () => {
  const dispatch = useDispatch()

  const rewardIds = useRewardIds()
  console.log('rewardsIds?', rewardIds)

  const openModal = (trendingRewardId: TrendingRewardID) => {
    let modal: Modals
    let modalType: TrendingRewardsModalType | null = null
    switch (trendingRewardId) {
      case 'top-api':
        modal = 'APIRewardsExplainer'
        break
      case 'trending-playlist':
        modal = 'TrendingRewardsExplainer'
        modalType = 'playlists'
        break
      case 'trending-track':
        modal = 'TrendingRewardsExplainer'
        modalType = 'tracks'
        break
      case 'trending-underground':
        modal = 'TrendingRewardsExplainer'
        modalType = 'underground'
        break
      case 'verified-upload':
        // Deprecated trending challenge
        return
    }
    if (modalType) {
      dispatch(setTrendingRewardsModalType({ modalType }))
    }
    dispatch(setVisibility({ modal, visible: true }))
  }

  const rewardsPanels = rewardIds.map((id) => {
    const props = trendingRewardsConfig[id]
    return <Panel {...props} onPress={() => openModal(id)} key={props.title} />
  })
  return <View>{rewardsPanels}</View>
}
