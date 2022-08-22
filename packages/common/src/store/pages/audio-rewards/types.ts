import {
  UserChallenge,
  ChallengeRewardID,
  Specifier
} from '../../../models/index'

export type TrendingRewardsModalType = 'tracks' | 'playlists' | 'underground'
export type ChallengeRewardsModalType = ChallengeRewardID

export type ClaimState =
  | { status: ClaimStatus.NONE }
  | { status: ClaimStatus.CLAIMING }
  | { status: ClaimStatus.WAITING_FOR_RETRY }
  | { status: ClaimStatus.ALREADY_CLAIMED }
  | { status: ClaimStatus.SUCCESS }
  | { status: ClaimStatus.ERROR; aaoErrorCode: number | undefined }

export type AudioRewardsClaim = {
  challengeId: ChallengeRewardID
  specifiers: Specifier[]
  amount: number
}

export type UndisbursedUserChallenge = Pick<
  UserChallenge,
  'challenge_id' | 'amount' | 'specifier' | 'user_id'
> & {
  completed_blocknumber: number
  handle: string
  wallet: string
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

export enum ClaimStatus {
  NONE = 'none',
  CLAIMING = 'claiming',
  WAITING_FOR_RETRY = 'waiting for retry',
  ALREADY_CLAIMED = 'already claimed',
  SUCCESS = 'success',
  ERROR = 'error'
}
