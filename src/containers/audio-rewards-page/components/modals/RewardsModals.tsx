import React from 'react'
import TopAPIModal from './TopAPI'
import TransferAudioMobileDrawer from './TransferAudioMobileDrawer'
import TrendingRewardsModal from './TrendingRewards'
import VerifiedUpload from './VerifiedUpload'

const RewardsModals = () => {
  return (
    <>
      <TrendingRewardsModal />
      <VerifiedUpload />
      <TopAPIModal />
      <TransferAudioMobileDrawer />
    </>
  )
}

export default RewardsModals
