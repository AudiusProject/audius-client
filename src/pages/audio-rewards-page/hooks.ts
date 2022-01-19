import { useEffect, useState } from 'react'

import { useSelector } from 'react-redux'

import { ChallengeRewardID, UserChallenge } from 'common/models/AudioRewards'
import { getCompletionStages } from 'components/profile-progress/store/selectors'

type OptimisticChallengeCompletionResponse = Partial<
  Record<ChallengeRewardID, number>
>

export const useOptimisticChallengeCompletionStepCounts = () => {
  const profileCompletionStages = useSelector(getCompletionStages)
  const profileCompletion = Object.values(profileCompletionStages).filter(
    Boolean
  ).length

  const completion: OptimisticChallengeCompletionResponse = {
    'profile-completion': profileCompletion
  }

  return completion
}

// This holds the logic for when a challenge is considered claimable.
// A challenge is considered claimable when:
// - it is complete and not disbursed, or
// - it is undefined (happens during challenge polling) and was previously complete but not disbursed
export const useCheckClaimable = (
  challenge: UserChallenge | undefined,
  isComplete: boolean
) => {
  const isDisbursed = challenge?.is_disbursed ?? false

  const [wasPreviouslyComplete, setWasPreviouslyComplete] = useState(false)
  const [wasPreviouslyDisbursed, setWasPreviouslyDisbursed] = useState(false)

  useEffect(() => {
    if (isComplete && !wasPreviouslyComplete) {
      setWasPreviouslyComplete(true)
    }
    if (isDisbursed && !wasPreviouslyDisbursed) {
      setWasPreviouslyDisbursed(true)
    }
  }, [isComplete, wasPreviouslyComplete, isDisbursed, wasPreviouslyDisbursed])

  return {
    isClaimable:
      (!challenge && wasPreviouslyComplete && !wasPreviouslyDisbursed) ||
      (challenge && isComplete && !isDisbursed)
  }
}
