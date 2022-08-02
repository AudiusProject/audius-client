import {
  ChallengeRewardID,
  FailureReason,
  UserChallenge,
  StringAudio,
  IntKeys,
  StringKeys
} from '@audius/common'
import delayP from '@redux-saga/delay-p'
import { expectSaga } from 'redux-saga-test-plan'
import { call, select } from 'redux-saga-test-plan/matchers'
import { StaticProvider } from 'redux-saga-test-plan/providers'
import { all, fork } from 'redux-saga/effects'

import {
  getAccountUser,
  getUserHandle,
  getUserId
} from 'common/store/account/selectors'
import {
  getClaimStatus,
  getClaimToRetry,
  getUserChallenge,
  getUserChallenges,
  getUserChallengesOverrides,
  getUserChallengeSpecifierMap
} from 'common/store/pages/audio-rewards/selectors'
import {
  Claim,
  claimChallengeReward,
  claimChallengeRewardAlreadyClaimed,
  claimChallengeRewardFailed,
  claimChallengeRewardSucceeded,
  claimChallengeRewardWaitForRetry,
  ClaimStatus,
  CognitoFlowStatus,
  fetchUserChallenges,
  fetchUserChallengesSucceeded,
  HCaptchaStatus,
  resetUserChallengeCurrentStepCount,
  setCognitoFlowStatus,
  setHCaptchaStatus,
  setUserChallengesDisbursed,
  showRewardClaimedToast
} from 'common/store/pages/audio-rewards/slice'
import { getFeePayer } from 'common/store/solana/selectors'
import { setVisibility } from 'common/store/ui/modals/slice'
import { getBalance, increaseBalance } from 'common/store/wallet/slice'
import { stringAudioToStringWei } from 'common/utils/wallet'
import AudiusBackend from 'services/AudiusBackend'
import apiClient from 'services/audius-api-client/AudiusAPIClient'
import { getCognitoExists } from 'services/audius-backend/Cognito'
// Need the mock type to get the helper function that sets the config
// eslint-disable-next-line jest/no-mocks-import
import { MockRemoteConfigInstance } from 'services/remote-config/__mocks__/remote-config-instance'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'
import { waitForBackendSetup } from 'store/backend/sagas'

import rewardsSagas from './sagas'

// Setup mocks
jest.mock('services/remote-config/remote-config-instance')
jest.mock('utils/route/hashIds')
jest.mock('services/AudiusBackend')
jest.mock('services/audius-api-client/AudiusAPIClient')
jest.mock('utils/sagaPollingDaemons')

function* saga() {
  yield all(rewardsSagas().map(fork))
}

const testClaim: Claim = {
  challengeId: 'connect-verified',
  specifiers: ['1'],
  amount: 10
}
const testUser = {
  user_id: 1,
  handle: 'test_user',
  wallet: 'test-wallet'
}
const testUserChallenge = {
  challenge_id: 'connect-verified' as ChallengeRewardID,
  amount: 1,
  is_complete: true
}
const testFeePayer = '9AwMCALjKFp2ZQW97rnjJUzUiukzkGAH4HDz5V2uhW3D'

const claimAsyncProvisions: StaticProvider[] = [
  [select(getAccountUser), testUser],
  [
    select.like({
      selector: getUserChallenge,
      args: [{ challengeId: testUserChallenge.challenge_id }]
    }),
    testUserChallenge
  ],
  [select(getFeePayer), testFeePayer]
]

const retryClaimProvisions: StaticProvider[] = [
  [select(getClaimStatus), ClaimStatus.WAITING_FOR_RETRY],
  [select(getClaimToRetry), testClaim]
]

const MAX_CLAIM_RETRIES = 5

const expectedRequestArgs = {
  challenges: [{ challenge_id: 'connect-verified', specifier: '1' }],
  userId: 1,
  handle: 'test_user',
  recipientEthAddress: 'test-wallet',
  oracleEthAddress: 'oracle eth address',
  amount: 10,
  quorumSize: 1,
  endpoints: ['rewards attestation endpoints'],
  AAOEndpoint: 'oracle endpoint',
  parallelization: 20,
  feePayerOverride: testFeePayer,
  isFinalAttempt: false
}
beforeAll(() => {
  // Setup remote config
  ;(remoteConfigInstance as MockRemoteConfigInstance).__setConfig({
    [IntKeys.ATTESTATION_QUORUM_SIZE]: 1,
    [StringKeys.ORACLE_ETH_ADDRESS]: 'oracle eth address',
    [StringKeys.ORACLE_ENDPOINT]: 'oracle endpoint',
    [StringKeys.REWARDS_ATTESTATION_ENDPOINTS]: 'rewards attestation endpoints',
    [IntKeys.CHALLENGE_REFRESH_INTERVAL_AUDIO_PAGE_MS]: 100000000000,
    [IntKeys.CHALLENGE_REFRESH_INTERVAL_MS]: 1000000000000,
    [IntKeys.MAX_CLAIM_RETRIES]: MAX_CLAIM_RETRIES,
    [IntKeys.CLIENT_ATTESTATION_PARALLELIZATION]: 20
  })
  remoteConfigInstance.waitForRemoteConfig = jest.fn()

  // Hijack console.error for expected errors
  const oldConsoleError = console.error
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    if (
      args &&
      (args.length <= 1 ||
        args[1].toString().indexOf('User is blocked from claiming') < 0)
    ) {
      oldConsoleError(args)
    }
  })
})

describe('Rewards Page Sagas', () => {
  describe('Claim Rewards Async', () => {
    it('should open hcaptcha modal, close the challenges modal, and save the claim for retry on hcaptcha error', () => {
      return (
        expectSaga(saga)
          .dispatch(
            claimChallengeReward({
              claim: testClaim,
              retryOnFailure: true
            })
          )
          .provide([
            ...claimAsyncProvisions,
            [
              call.fn(AudiusBackend.submitAndEvaluateAttestations),
              { error: FailureReason.HCAPTCHA }
            ]
          ])
          // Assertions
          .call.like({
            fn: AudiusBackend.submitAndEvaluateAttestations,
            args: [expectedRequestArgs]
          })
          .put(claimChallengeRewardWaitForRetry(testClaim))
          .put(setVisibility({ modal: 'HCaptcha', visible: true }))
          .put(
            setVisibility({
              modal: 'ChallengeRewardsExplainer',
              visible: false
            })
          )
          .silentRun()
      )
    })

    it('should open cognito modal and save the claim for retry on cognito error', () => {
      return (
        expectSaga(saga)
          .dispatch(
            claimChallengeReward({
              claim: testClaim,
              retryOnFailure: true
            })
          )
          .provide([
            ...claimAsyncProvisions,
            [
              call.fn(AudiusBackend.submitAndEvaluateAttestations),
              { error: FailureReason.COGNITO_FLOW }
            ]
          ])
          // Assertions
          .call.like({
            fn: AudiusBackend.submitAndEvaluateAttestations,
            args: [expectedRequestArgs]
          })
          .put(claimChallengeRewardWaitForRetry(testClaim))
          .put(setVisibility({ modal: 'Cognito', visible: true }))
          .not.put(
            setVisibility({
              modal: 'ChallengeRewardsExplainer',
              visible: false
            })
          )
          .silentRun()
      )
    })

    it('should fail and not retry nor open modals on user blocked', () => {
      return (
        expectSaga(saga)
          .dispatch(
            claimChallengeReward({
              claim: testClaim,
              retryOnFailure: true
            })
          )
          .provide([
            ...claimAsyncProvisions,
            [
              call.fn(AudiusBackend.submitAndEvaluateAttestations),
              { error: FailureReason.BLOCKED }
            ]
          ])
          // Assertions
          .call.like({
            fn: AudiusBackend.submitAndEvaluateAttestations,
            args: [expectedRequestArgs]
          })
          .not.put(claimChallengeRewardWaitForRetry(testClaim))
          .not.put(setVisibility({ modal: 'Cognito', visible: true }))
          .not.put(
            setVisibility({
              modal: 'ChallengeRewardsExplainer',
              visible: false
            })
          )
          .put(claimChallengeRewardFailed())
          .silentRun()
      )
    })

    it('should fail and inform the user when already disbursed', () => {
      return (
        expectSaga(saga)
          .dispatch(
            claimChallengeReward({
              claim: testClaim,
              retryOnFailure: true
            })
          )
          .provide([
            ...claimAsyncProvisions,
            [
              call.fn(AudiusBackend.submitAndEvaluateAttestations),
              { error: FailureReason.ALREADY_DISBURSED }
            ]
          ])
          // Assertions
          .call.like({
            fn: AudiusBackend.submitAndEvaluateAttestations,
            args: [expectedRequestArgs]
          })
          .put(claimChallengeRewardAlreadyClaimed())
          .silentRun()
      )
    })

    it('should fail and retry when already sent', () => {
      return (
        expectSaga(saga)
          .dispatch(
            claimChallengeReward({
              claim: testClaim,
              retryOnFailure: true
            })
          )
          .provide([
            ...claimAsyncProvisions,
            [
              call.fn(AudiusBackend.submitAndEvaluateAttestations),
              { error: FailureReason.ALREADY_SENT }
            ]
          ])
          // Assertions
          .call.like({
            fn: AudiusBackend.submitAndEvaluateAttestations,
            args: [expectedRequestArgs]
          })
          .put(claimChallengeRewardAlreadyClaimed())
          .silentRun()
      )
    })

    it('should attempt retry if below max retries', () => {
      return (
        expectSaga(saga)
          .dispatch(
            claimChallengeReward({
              claim: testClaim,
              retryOnFailure: true
            })
          )
          .provide([
            ...claimAsyncProvisions,
            [call.fn(delayP), null],
            [
              call.fn(AudiusBackend.submitAndEvaluateAttestations),
              { error: FailureReason.UNKNOWN_ERROR }
            ]
          ])
          // Assertions
          .call.like({
            fn: AudiusBackend.submitAndEvaluateAttestations,
            args: [expectedRequestArgs]
          })
          .put(
            claimChallengeReward({
              claim: testClaim,
              retryOnFailure: true,
              retryCount: 1
            })
          )
          .silentRun()
      )
    })

    it('should not attempt retry if at max retries', () => {
      return (
        expectSaga(saga)
          .dispatch(
            claimChallengeReward({
              claim: testClaim,
              retryOnFailure: true,
              retryCount: MAX_CLAIM_RETRIES
            })
          )
          .provide([
            ...claimAsyncProvisions,
            [
              call.fn(AudiusBackend.submitAndEvaluateAttestations),
              { error: FailureReason.UNKNOWN_ERROR }
            ]
          ])
          // Assertions
          .call.like({
            fn: AudiusBackend.submitAndEvaluateAttestations,
            args: [expectedRequestArgs]
          })
          .put(claimChallengeRewardFailed())
          .silentRun()
      )
    })

    it('should update the audio balance and disbursement status on success', () => {
      return (
        expectSaga(saga)
          .dispatch(
            claimChallengeReward({
              claim: testClaim,
              retryOnFailure: true
            })
          )
          .provide([
            ...claimAsyncProvisions,
            [call.fn(AudiusBackend.submitAndEvaluateAttestations), {}]
          ])
          // Assertions
          .put(
            increaseBalance({
              amount: stringAudioToStringWei('10' as StringAudio)
            })
          )
          .put(
            setUserChallengesDisbursed({
              challengeId: testClaim.challengeId,
              specifiers: testClaim.specifiers
            })
          )
          .put(claimChallengeRewardSucceeded())
          .silentRun()
      )
    })

    it('should NOT submit attestation if DN has not marked the challenge as complete', () => {
      return (
        expectSaga(saga)
          .dispatch(
            claimChallengeReward({
              claim: testClaim,
              retryOnFailure: true
            })
          )
          .provide([
            [
              select.like({
                selector: getUserChallenge,
                args: [{ challengeId: testUserChallenge.challenge_id }]
              }),
              { is_completed: false }
            ],
            [select(getUserChallenges), {}],
            [select(getUserChallengesOverrides), {}],
            [call.fn(waitForBackendSetup), {}],
            [select(getUserId), testUser.user_id]
          ])
          // Assertions
          .not.call(AudiusBackend.submitAndEvaluateAttestations)
          .not.put(
            setUserChallengesDisbursed({
              challengeId: testClaim.challengeId,
              specifiers: testClaim.specifiers
            })
          )
          .not.put(claimChallengeRewardSucceeded())
          .silentRun()
      )
    })
  })

  describe('Claim Rewards Retries', () => {
    it('should reopen the challenge rewards modal on successful hcaptcha', () => {
      return expectSaga(saga)
        .dispatch(setHCaptchaStatus({ status: HCaptchaStatus.SUCCESS }))
        .provide([
          ...retryClaimProvisions,
          ...claimAsyncProvisions,
          [call.fn(AudiusBackend.submitAndEvaluateAttestations), {}]
        ])
        .put(
          setVisibility({ modal: 'ChallengeRewardsExplainer', visible: true })
        )
        .silentRun()
    })

    it('should retry the claim on successful hcaptcha', () => {
      return expectSaga(saga)
        .dispatch(setHCaptchaStatus({ status: HCaptchaStatus.SUCCESS }))
        .provide([
          ...retryClaimProvisions,
          ...claimAsyncProvisions,
          [call.fn(AudiusBackend.submitAndEvaluateAttestations), {}]
        ])
        .put(claimChallengeReward({ claim: testClaim, retryOnFailure: true }))
        .put(claimChallengeRewardSucceeded())
        .silentRun()
    })

    it('should not retry the claim on failed/closed hcaptcha', () => {
      return Promise.all([
        // Failed
        expectSaga(saga)
          .dispatch(setHCaptchaStatus({ status: HCaptchaStatus.ERROR }))
          .provide([...retryClaimProvisions, ...claimAsyncProvisions])
          .not.put(
            claimChallengeReward({ claim: testClaim, retryOnFailure: false })
          )
          .put(claimChallengeRewardFailed())
          .silentRun(10),
        // Closed
        expectSaga(saga)
          .dispatch(setHCaptchaStatus({ status: HCaptchaStatus.USER_CLOSED }))
          .provide([...retryClaimProvisions, ...claimAsyncProvisions])
          .not.put(
            claimChallengeReward({ claim: testClaim, retryOnFailure: false })
          )
          .put(claimChallengeRewardFailed())
          .silentRun()
      ])
    })

    it('should retry the claim on cognito close', () => {
      return expectSaga(saga)
        .dispatch(setCognitoFlowStatus({ status: CognitoFlowStatus.CLOSED }))
        .provide([
          ...retryClaimProvisions,
          ...claimAsyncProvisions,
          [select(getUserHandle), testUser.handle],
          [call.fn(getCognitoExists), { exists: true }],
          [call.fn(AudiusBackend.submitAndEvaluateAttestations), {}]
        ])
        .put(claimChallengeReward({ claim: testClaim, retryOnFailure: false }))
        .put(claimChallengeRewardSucceeded())
        .silentRun()
    })

    it('should not retry twice', () => {
      return expectSaga(saga)
        .dispatch(setCognitoFlowStatus({ status: CognitoFlowStatus.CLOSED }))
        .provide([
          ...retryClaimProvisions,
          ...claimAsyncProvisions,
          [select(getUserHandle), testUser.handle],
          [call.fn(getCognitoExists), { exists: true }],
          [
            call.fn(AudiusBackend.submitAndEvaluateAttestations),
            { error: FailureReason.BLOCKED }
          ]
        ])
        .put(claimChallengeReward({ claim: testClaim, retryOnFailure: false }))
        .call(AudiusBackend.submitAndEvaluateAttestations, {
          ...expectedRequestArgs,
          isFinalAttempt: true
        })
        .not.put(claimChallengeRewardWaitForRetry(testClaim))
        .put(claimChallengeRewardFailed())
        .silentRun()
    })
  })
  describe('Fetch User Challenges', () => {
    const expectedUserChallengesResponse: UserChallenge[] = [
      {
        challenge_id: 'profile-completion',
        is_complete: true,
        is_disbursed: true,
        is_active: true,
        amount: 1,
        current_step_count: 7,
        max_steps: 7,
        challenge_type: 'numeric',
        specifier: '1',
        user_id: '1'
      },
      {
        challenge_id: 'referrals',
        is_complete: true,
        is_disbursed: false,
        is_active: true,
        amount: 1,
        current_step_count: 5,
        max_steps: 5,
        challenge_type: 'numeric',
        specifier: '1',
        user_id: '1'
      },
      {
        challenge_id: 'track-upload',
        is_complete: true,
        is_disbursed: true,
        is_active: true,
        amount: 1,
        current_step_count: 3,
        max_steps: 3,
        challenge_type: 'numeric',
        specifier: '1',
        user_id: '1'
      }
    ]
    const fetchUserChallengesProvisions: StaticProvider[] = [
      [call.fn(waitForBackendSetup), {}],
      [select(getUserId), testUser.user_id],
      [call.fn(apiClient.getUserChallenges), expectedUserChallengesResponse]
    ]
    it('should show a toast to the user that they received a reward if the reward was not disbursed yet', () => {
      return expectSaga(saga)
        .dispatch(fetchUserChallenges())
        .provide([
          ...fetchUserChallengesProvisions,
          [
            select(getUserChallengeSpecifierMap),
            {
              'profile-completion': {
                [testUser.user_id]: {
                  is_complete: true,
                  is_disbursed: false
                }
              }
            }
          ],
          [select(getUserChallengesOverrides), {}]
        ])
        .put(getBalance())
        .put(showRewardClaimedToast())
        .put(
          fetchUserChallengesSucceeded({
            userChallenges: expectedUserChallengesResponse
          })
        )
        .silentRun()
    })

    it('should NOT show a toast to the user that they received a reward if the reward was already automatically claimed', () => {
      return expectSaga(saga)
        .dispatch(fetchUserChallenges())
        .provide([
          ...fetchUserChallengesProvisions,
          [
            select(getUserChallengeSpecifierMap),
            {
              'profile-completion': {
                [testUser.user_id]: {
                  is_complete: true,
                  is_disbursed: true
                }
              }
            }
          ],
          [select(getUserChallengesOverrides), {}]
        ])
        .not.put(showRewardClaimedToast())
        .put(
          fetchUserChallengesSucceeded({
            userChallenges: expectedUserChallengesResponse
          })
        )
        .silentRun()
    })

    it('should NOT show a toast to the user that they received a reward if the reward was already manually claimed', () => {
      return expectSaga(saga)
        .dispatch(fetchUserChallenges())
        .provide([
          ...fetchUserChallengesProvisions,
          [
            select(getUserChallengeSpecifierMap),
            {
              [testUser.user_id]: {
                referrals: {
                  is_complete: true,
                  is_disbursed: false
                }
              }
            }
          ],
          [
            select(getUserChallengesOverrides),
            {
              referrals: {
                is_disbursed: true
              }
            }
          ]
        ])
        .not.put(showRewardClaimedToast())
        .put(
          fetchUserChallengesSucceeded({
            userChallenges: expectedUserChallengesResponse
          })
        )
        .silentRun()
    })

    const listenStreakUserChallenge: UserChallenge[] = [
      {
        challenge_id: 'listen-streak',
        is_complete: true,
        is_disbursed: true,
        is_active: true,
        amount: 1,
        current_step_count: 0,
        max_steps: 7,
        challenge_type: 'numeric',
        specifier: '1',
        user_id: '1'
      }
    ]

    it('should not reset the listen streak override', () => {
      return expectSaga(saga)
        .dispatch(
          fetchUserChallengesSucceeded({
            userChallenges: listenStreakUserChallenge
          })
        )
        .provide([
          [
            select(getUserChallengeSpecifierMap),
            {
              'listen-streak': {
                [testUser.user_id]: {
                  current_step_count: 0,
                  is_complete: false,
                  is_disbursed: false
                }
              }
            }
          ],
          [
            select(getUserChallengesOverrides),
            {
              'listen-streak': {
                current_step_count: 1
              }
            }
          ]
        ])
        .not.put(
          resetUserChallengeCurrentStepCount({
            challengeId: 'listen-streak'
          })
        )
        .silentRun()
    })

    const listenStreakUserChallengeStepCountUp: UserChallenge[] = [
      {
        challenge_id: 'listen-streak',
        is_complete: true,
        is_disbursed: true,
        is_active: true,
        amount: 1,
        current_step_count: 2,
        max_steps: 7,
        challenge_type: 'numeric',
        specifier: '1',
        user_id: '1'
      }
    ]

    it('should reset the listen streak override to zero', () => {
      return expectSaga(saga)
        .dispatch(
          fetchUserChallengesSucceeded({
            userChallenges: listenStreakUserChallengeStepCountUp
          })
        )
        .provide([
          [
            select(getUserChallengeSpecifierMap),
            {
              'listen-streak': {
                [testUser.user_id]: {
                  current_step_count: 0,
                  is_complete: false,
                  is_disbursed: false
                }
              }
            }
          ],
          [
            select(getUserChallengesOverrides),
            {
              'listen-streak': {
                current_step_count: 1
              }
            }
          ]
        ])
        .put(
          resetUserChallengeCurrentStepCount({
            challengeId: 'listen-streak'
          })
        )
        .silentRun()
    })
  })
})
