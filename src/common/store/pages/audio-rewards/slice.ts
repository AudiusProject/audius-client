import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { UserChallenge, ChallengeRewardID } from '../../../models/AudioRewards'

export type TrendingRewardsModalType = 'tracks' | 'playlists' | 'underground'
export type ChallengeRewardsModalType = ChallengeRewardID

export enum ClaimStatus {
  NONE = 'none',
  CLAIMING = 'claiming',
  RETRY_PENDING = 'retry_pending',
  SUCCESS = 'success',
  ERROR = 'error'
}

export type Claim = {
  challengeId: ChallengeRewardID
  specifier: string
  amount: number
}

export enum HCaptchaStatus {
  NONE = 'none',
  SUCCESS = 'success',
  ERROR = 'error',
  USER_CLOSED = 'user_closed'
}

export enum CognitoFlowStatus {
  CLOSED = 'closed',
  OPENED = 'opened'
}

type UserChallengesPayload = {
  userChallenges: UserChallenge[] | null
}

type RewardsUIState = {
  loading: boolean
  trendingRewardsModalType: TrendingRewardsModalType
  challengeRewardsModalType: ChallengeRewardsModalType
  userChallenges: Partial<Record<ChallengeRewardID, UserChallenge>>
  claimStatus: ClaimStatus
  claimToRetry?: Claim
  hCaptchaStatus: HCaptchaStatus
  cognitoFlowStatus: CognitoFlowStatus
}

const initialState: RewardsUIState = {
  trendingRewardsModalType: 'tracks',
  challengeRewardsModalType: 'track-upload',
  userChallenges: {},
  loading: true,
  claimStatus: ClaimStatus.NONE,
  hCaptchaStatus: HCaptchaStatus.NONE,
  cognitoFlowStatus: CognitoFlowStatus.CLOSED
}

const slice = createSlice({
  name: 'rewards-page',
  initialState,
  reducers: {
    fetchUserChallenges: state => {
      state.userChallenges = {}
      state.loading = true
    },
    fetchUserChallengesSucceeded: (
      state,
      action: PayloadAction<UserChallengesPayload>
    ) => {
      const { userChallenges } = action.payload
      if (userChallenges === null) {
        state.userChallenges = {}
      } else {
        state.userChallenges = userChallenges.reduce((acc, challenge) => {
          acc[challenge.challenge_id] = challenge
          return acc
        }, {} as Partial<Record<ChallengeRewardID, UserChallenge>>)
      }
      state.loading = false
    },
    fetchUserChallengesFailed: state => {
      state.loading = false
    },
    setUserChallengeDisbursed: (
      state,
      action: PayloadAction<{ challengeId: ChallengeRewardID }>
    ) => {
      const { challengeId } = action.payload
      const challenge = state.userChallenges[challengeId]
      if (challenge !== undefined) {
        challenge.is_disbursed = true
      }
    },
    setTrendingRewardsModalType: (
      state,
      action: PayloadAction<{ modalType: TrendingRewardsModalType }>
    ) => {
      const { modalType } = action.payload
      state.trendingRewardsModalType = modalType
    },
    setChallengeRewardsModalType: (
      state,
      action: PayloadAction<{ modalType: ChallengeRewardsModalType }>
    ) => {
      const { modalType } = action.payload
      state.challengeRewardsModalType = modalType
    },
    setClaimStatus: (state, action: PayloadAction<{ status: ClaimStatus }>) => {
      const { status } = action.payload
      state.claimStatus = status
    },
    resetClaimStatus: state => {
      state.claimStatus = ClaimStatus.NONE
    },
    setHCaptchaStatus: (
      state,
      action: PayloadAction<{ status: HCaptchaStatus }>
    ) => {
      const { status } = action.payload
      state.hCaptchaStatus = status
    },
    resetHCaptchaStatus: state => {
      state.hCaptchaStatus = HCaptchaStatus.NONE
    },
    updateHCaptchaScore: (
      state,
      action: PayloadAction<{ token: string }>
    ) => {},
    setCognitoFlowStatus: (
      state,
      action: PayloadAction<{ status: CognitoFlowStatus }>
    ) => {
      const { status } = action.payload
      state.cognitoFlowStatus = status
    },
    fetchClaimAttestation: (
      state,
      action: PayloadAction<{
        claim: Claim
        retryOnFailure: boolean
      }>
    ) => {
      state.claimStatus = ClaimStatus.CLAIMING
    },
    fetchClaimAttestationRetryPending: (
      state,
      action: PayloadAction<Claim>
    ) => {
      state.claimStatus = ClaimStatus.RETRY_PENDING
      state.claimToRetry = action.payload
    },
    fetchClaimAttestationFailed: state => {
      state.claimStatus = ClaimStatus.ERROR
    },
    fetchClaimAttestationSucceeded: state => {
      state.claimStatus = ClaimStatus.SUCCESS
    }
  }
})

export const {
  fetchUserChallenges,
  fetchUserChallengesSucceeded,
  fetchUserChallengesFailed,
  setTrendingRewardsModalType,
  setChallengeRewardsModalType,
  setClaimStatus,
  setUserChallengeDisbursed,
  resetClaimStatus,
  setHCaptchaStatus,
  resetHCaptchaStatus,
  updateHCaptchaScore,
  setCognitoFlowStatus,
  fetchClaimAttestation,
  fetchClaimAttestationFailed,
  fetchClaimAttestationSucceeded,
  fetchClaimAttestationRetryPending
} = slice.actions

export default slice
