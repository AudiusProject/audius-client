type ChallengeType = 'boolean' | 'numeric' | 'aggregate' | 'trending'

export type UserChallenge = {
  challenge_id: ChallengeRewardID
  challenge_type: ChallengeType
  current_step_count: number
  is_active: boolean
  is_complete: boolean
  is_disbursed: boolean
  max_steps: number
  specifier: Specifier
  user_id: string
  amount: number
}

export type Specifier = string

export type ChallengeRewardID =
  | 'track-upload'
  | 'referrals'
  | 'ref-v'
  | 'referred'
  | 'mobile-install'
  | 'connect-verified'
  | 'listen-streak'
  | 'profile-completion'
  | 'send-first-tip'
  | 'first-playlist'

export type TrendingRewardID =
  | 'trending-track'
  | 'trending-playlist'
  | 'top-api'
  | 'verified-upload'
  | 'trending-underground'

export enum FailureReason {
  // The attestation requires the user to fill out a captcha
  HCAPTCHA = 'HCAPTCHA',
  // The attestation requires the user to fill out cognito
  COGNITO_FLOW = 'COGNITO_FLOW',
  // The attestation is blocked
  BLOCKED = 'BLOCKED',
  // This reward has already been disbursed
  ALREADY_DISBURSED = 'ALREADY_DISBURSED',
  // The funds have already been sent, but we have not
  // indexed the challenge.
  ALREADY_SENT = 'ALREADY_SENT',
  // UserChallenge doesn't exist on DN
  MISSING_CHALLENGES = 'MISSING_CHALLENGES',
  // UserChallenge is not in complete state
  CHALLENGE_INCOMPLETE = 'CHALLENGE_INCOMPLETE',
  // An unknown error has occurred
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  // Unknown AAO error
  AAO_ATTESTATION_UNKNOWN_RESPONSE = 'AAO_ATTESTATION_UNKNOWN_RESPONSE'
}

export type FlowUIOpenEvent = {
  topic: 'ui'
  action: 'opened'
}
export type FlowUICloseEvent = {
  topic: 'ui'
  action: 'closed'
}

export type FlowErrorEvent = {
  topic: 'error'
  message: string
}

export type FlowSessionID = any
export type FlowSessionCreateEvent = {
  topic: 'session'
  action: 'created'

  data: {
    id: FlowSessionID
  }
}
export type FlowSessionResumeEvent = {
  topic: 'session'
  action: 'resumed'

  data: {
    id: FlowSessionID
  }
}
export type FlowSessionPassEvent = {
  topic: 'session'
  action: 'passed'
}
export type FlowSessionFailEvent = {
  topic: 'session'
  action: 'failed'
}
export type FlowSessionEvent =
  | FlowSessionCreateEvent
  | FlowSessionResumeEvent
  | FlowSessionPassEvent
  | FlowSessionFailEvent

/**
 * Needed for notifications for now as UserChallenges might not be loaded yet
 * @deprecated amounts should be pulled in directly from user challenges instead
 */
export const amounts: Record<ChallengeRewardID, number> = {
  referrals: 1,
  referred: 1,
  'ref-v': 1,
  'connect-verified': 5,
  'listen-streak': 1,
  'mobile-install': 1,
  'profile-completion': 1,
  'track-upload': 1,
  'send-first-tip': 2,
  'first-playlist': 2
}

/**
 * Represents the mutually exclusive state of a challenge
 */
export type UserChallengeState =
  | 'inactive'
  | 'incomplete'
  | 'in_progress'
  | 'completed'
  | 'disbursed'

/**
 * A User Challenge that has been updated by the client to optimistically include any updates
 */
export type OptimisticUserChallenge = Omit<
  UserChallenge,
  'is_complete' | 'is_active' | 'is_disbursed'
> & {
  __isOptimistic: true
  state: UserChallengeState
  totalAmount: number
  claimableAmount: number
  undisbursedSpecifiers: Specifier[]
}
