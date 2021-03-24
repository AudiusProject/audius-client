import React from 'react'
import TopAPIModal from './TopAPI'
import TrendingRewardsModal from './TrendingRewards'
import VerifiedUpload from './VerifiedUpload'

const RewardsModals = () => {
  return (
    <>
      <TrendingRewardsModal />
      <VerifiedUpload />
      <TopAPIModal />
    </>
  )
}

export default RewardsModals
