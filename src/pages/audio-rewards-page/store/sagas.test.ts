import { expectSaga } from 'redux-saga-test-plan'
import { call, select } from 'redux-saga-test-plan/matchers'
import { StaticProvider } from 'redux-saga-test-plan/providers'
import { all, fork } from 'redux-saga/effects'

import { FailureReason } from 'common/models/AudioRewards'
import { StringAudio } from 'common/models/Wallet'
import { IntKeys, StringKeys } from 'common/services/remote-config'
import { getAccountUser } from 'common/store/account/selectors'
import {
  getClaimStatus,
  getClaimToRetry,
  getUserChallenge
} from 'common/store/pages/audio-rewards/selectors'
import {
  Claim,
  claimChallengeReward,
  claimChallengeRewardFailed,
  claimChallengeRewardSucceeded,
  claimChallengeRewardWaitForRetry,
  ClaimStatus,
  CognitoFlowStatus,
  HCaptchaStatus,
  setCognitoFlowStatus,
  setHCaptchaStatus,
  setUserChallengeDisbursed
} from 'common/store/pages/audio-rewards/slice'
import { setVisibility } from 'common/store/ui/modals/slice'
import { increaseBalance } from 'common/store/wallet/slice'
import { stringAudioToStringWei } from 'common/utils/wallet'
import AudiusBackend from 'services/AudiusBackend'
// Need the mock type to get the helper function that sets the config
// eslint-disable-next-line jest/no-mocks-import
import { MockRemoteConfigInstance } from 'services/remote-config/__mocks__/remote-config-instance'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'

import rewardsSagas from './sagas'

jest.mock('services/remote-config/remote-config-instance')
jest.mock('utils/route/hashIds')
jest.mock('services/AudiusBackend')
function* saga() {
  yield all(rewardsSagas().map(fork))
}

const testClaim: Claim = {
  challengeId: 'connect-verified',
  specifier: '1',
  amount: 10
}
const testUser = {
  user_id: 1,
  handle: 'test_user',
  wallet: 'test-wallet'
}
const testUserChallenge = {
  challenge_id: 'connect-verified',
  amount: 1,
  is_complete: true
}
const claimAsyncProvisions: StaticProvider[] = [
  [select(getAccountUser), testUser],
  [
    select.like({
      selector: getUserChallenge,
      args: [{ challengeId: testUserChallenge.challenge_id }]
    }),
    testUserChallenge
  ]
]

const retryClaimProvisions: StaticProvider[] = [
  [select(getClaimStatus), ClaimStatus.WAITING_FOR_RETRY],
  [select(getClaimToRetry), testClaim]
]

const expectedRequestArgs = {
  ...testClaim,
  encodedUserId: undefined,
  handle: 'test_user',
  recipientEthAddress: 'test-wallet',
  oracleEthAddress: 'oracle eth address',
  quorumSize: 1,
  endpoints: ['rewards attestation endpoints'],
  AAOEndpoint: 'oracle endpoint'
}
beforeAll(() => {
  ;(remoteConfigInstance as MockRemoteConfigInstance).__setConfig({
    [IntKeys.ATTESTATION_QUORUM_SIZE]: 1,
    [StringKeys.ORACLE_ETH_ADDRESS]: 'oracle eth address',
    [StringKeys.ORACLE_ENDPOINT]: 'oracle endpoint',
    [StringKeys.REWARDS_ATTESTATION_ENDPOINTS]: 'rewards attestation endpoints'
  })
  const oldConsoleError = console.error
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    if (
      args &&
      args.length > 1 &&
      args[1].toString().indexOf('User is blocked from claiming') < 0
    ) {
      oldConsoleError(args)
    }
  })
})

describe('Claim Rewards Async saga', () => {
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
          setVisibility({ modal: 'ChallengeRewardsExplainer', visible: false })
        )
        .silentRun(5)
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
          setVisibility({ modal: 'ChallengeRewardsExplainer', visible: false })
        )
        .silentRun(500)
    )
  })

  it('should fail and not retry nor open models on user blocked', () => {
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
          setVisibility({ modal: 'ChallengeRewardsExplainer', visible: false })
        )
        .put(claimChallengeRewardFailed())
        .silentRun(5)
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
        .put(setUserChallengeDisbursed({ challengeId: 'connect-verified' }))
        .put(claimChallengeRewardSucceeded())
        .silentRun(5)
    )
  })

  it('should wait until discovery marked the challenge as completed before submitting', () => {
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
          ]
        ])
        // Assertions
        .not.call(AudiusBackend.submitAndEvaluateAttestations)
        .not.put(setUserChallengeDisbursed({ challengeId: 'connect-verified' }))
        .not.put(claimChallengeRewardSucceeded())
        .silentRun(5)
    )
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
        .silentRun(5)
    })

    it('should retry the claim on successful hcaptcha', () => {
      return expectSaga(saga)
        .dispatch(setHCaptchaStatus({ status: HCaptchaStatus.SUCCESS }))
        .provide([
          ...retryClaimProvisions,
          ...claimAsyncProvisions,
          [call.fn(AudiusBackend.submitAndEvaluateAttestations), {}]
        ])
        .put(claimChallengeReward({ claim: testClaim, retryOnFailure: false }))
        .put(claimChallengeRewardSucceeded())
        .silentRun(10)
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
          .silentRun(5)
      ])
    })

    it('should retry the claim on cognito close', () => {
      return expectSaga(saga)
        .dispatch(setCognitoFlowStatus({ status: CognitoFlowStatus.CLOSED }))
        .provide([
          ...retryClaimProvisions,
          ...claimAsyncProvisions,
          [call.fn(AudiusBackend.submitAndEvaluateAttestations), {}]
        ])
        .put(claimChallengeReward({ claim: testClaim, retryOnFailure: false }))
        .put(claimChallengeRewardSucceeded())
        .silentRun(10)
    })

    it('should not retry twice', () => {
      return expectSaga(saga)
        .dispatch(setHCaptchaStatus({ status: HCaptchaStatus.SUCCESS }))
        .provide([
          ...retryClaimProvisions,
          ...claimAsyncProvisions,
          [
            call.fn(AudiusBackend.submitAndEvaluateAttestations),
            { error: FailureReason.BLOCKED }
          ]
        ])
        .put(claimChallengeReward({ claim: testClaim, retryOnFailure: false }))
        .call(AudiusBackend.submitAndEvaluateAttestations, expectedRequestArgs)
        .not.put(claimChallengeRewardWaitForRetry(testClaim))
        .put(claimChallengeRewardFailed())
        .silentRun(5)
    })
  })
})
