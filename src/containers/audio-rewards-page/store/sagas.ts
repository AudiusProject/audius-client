import { User } from '@sentry/browser'
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects'

import {
  ChallengeRewardID,
  FailureReason,
  UserChallenge
} from 'common/models/AudioRewards'
import { StringAudio } from 'common/models/Wallet'
import { IntKeys, StringKeys } from 'common/services/remote-config'
import { getAccountUser, getUserId } from 'common/store/account/selectors'
import {
  getClaimStatus,
  getClaimToRetry
} from 'common/store/pages/audio-rewards/selectors'
import {
  HCaptchaStatus,
  setHCaptchaStatus,
  updateHCaptchaScore,
  fetchUserChallenges,
  fetchUserChallengesFailed,
  fetchUserChallengesSucceeded,
  ClaimStatus,
  CognitoFlowStatus,
  fetchClaimAttestation,
  fetchClaimAttestationFailed,
  fetchClaimAttestationRetryPending,
  fetchClaimAttestationSucceeded,
  setCognitoFlowStatus,
  setUserChallengeDisbursed
} from 'common/store/pages/audio-rewards/slice'
import { setVisibility } from 'common/store/ui/modals/slice'
import { increaseBalance } from 'common/store/wallet/slice'
import { stringAudioToStringWei } from 'common/utils/wallet'
import mobileSagas from 'containers/audio-rewards-page/store/mobileSagas'
import AudiusBackend from 'services/AudiusBackend'
import apiClient from 'services/audius-api-client/AudiusAPIClient'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'
import { waitForBackendSetup } from 'store/backend/sagas'
import { encodeHashId } from 'utils/route/hashIds'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE
const HCAPTCHA_MODAL_NAME = 'HCaptcha'
const COGNITO_MODAL_NAME = 'Cognito'
const CHALLENGE_REWARDS_MODAL_NAME = 'ChallengeRewardsExplainer'

function* retryClaimRewards(errorResolved: boolean) {
  const claimStatus: ClaimStatus = yield select(getClaimStatus)
  const claim: {
    challengeId: ChallengeRewardID
    amount: number
    specifier: string
  } = yield select(getClaimToRetry)
  if (claimStatus === ClaimStatus.RETRY_PENDING) {
    yield put(
      setVisibility({ modal: CHALLENGE_REWARDS_MODAL_NAME, visible: true })
    )
    if (errorResolved) {
      yield put(fetchClaimAttestation({ claim, retryOnFailure: false }))
    } else {
      yield put(fetchClaimAttestationFailed())
    }
  }
}
function* claimRewards(action: ReturnType<typeof fetchClaimAttestation>) {
  const { claim, retryOnFailure } = action.payload
  const { specifier, challengeId, amount } = claim
  const quorumSize = remoteConfigInstance.getRemoteVar(
    IntKeys.ATTESTATION_QUORUM_SIZE
  )
  const oracleEthAddress = remoteConfigInstance.getRemoteVar(
    StringKeys.ORACLE_ETH_ADDRESS
  )
  const AAOEndpoint = remoteConfigInstance.getRemoteVar(
    StringKeys.ORACLE_ENDPOINT
  )
  const currentUser: User = yield select(getAccountUser)

  const hasConfig =
    oracleEthAddress && AAOEndpoint && quorumSize && quorumSize > 0
  if (!hasConfig) {
    console.error('Error claiming rewards: Config is missing')
    return
  }
  try {
    const response: { error?: string } = yield call(
      AudiusBackend.submitAndEvaluateAttestations,
      {
        challengeId,
        encodedUserId: encodeHashId(currentUser.user_id),
        handle: currentUser.handle,
        recipientEthAddress: currentUser.wallet,
        specifier,
        oracleEthAddress,
        amount,
        quorumSize,
        AAOEndpoint
      }
    )
    if (response.error) {
      if (retryOnFailure) {
        yield put(fetchClaimAttestationRetryPending(claim))
        switch (response.error) {
          case FailureReason.HCAPTCHA:
            yield put(
              setVisibility({
                modal: CHALLENGE_REWARDS_MODAL_NAME,
                visible: false
              })
            )
            yield put(
              setVisibility({ modal: HCAPTCHA_MODAL_NAME, visible: true })
            )
            break
          case FailureReason.COGNITO_FLOW:
            yield put(
              setVisibility({ modal: COGNITO_MODAL_NAME, visible: true })
            )
            break
          case FailureReason.BLOCKED:
            throw new Error('User is blocked from claiming')
          case FailureReason.UNKNOWN_ERROR:
          default:
            throw new Error(`Unknown Error: ${response.error}`)
        }
      } else {
        yield put(fetchClaimAttestationFailed())
      }
    } else {
      yield put(
        increaseBalance({
          amount: stringAudioToStringWei(amount.toString() as StringAudio)
        })
      )
      yield put(setUserChallengeDisbursed({ challengeId }))
      yield put(fetchClaimAttestationSucceeded())
    }
  } catch (e) {
    console.error('Error claiming rewards:', e)
    yield put(fetchClaimAttestationFailed())
  }
}

function* watchSetAHCaptchaStatus() {
  yield takeLatest(setHCaptchaStatus.type, function* (
    action: ReturnType<typeof setHCaptchaStatus>
  ) {
    const { status } = action.payload
    yield call(retryClaimRewards, status === HCaptchaStatus.SUCCESS)
  })
}

function* watchSetCognitoFlowStatus() {
  yield takeLatest(setCognitoFlowStatus.type, function* (
    action: ReturnType<typeof setCognitoFlowStatus>
  ) {
    const { status } = action.payload
    // Only attempt retry on closed, so that we don't error on open
    if (status === CognitoFlowStatus.CLOSED) {
      yield call(retryClaimRewards, true)
    }
  })
}

function* watchFetchClaimAttestation() {
  yield takeLatest(fetchClaimAttestation.type, claimRewards)
}

export function* watchFetchUserChallenges() {
  yield takeEvery(fetchUserChallenges.type, function* () {
    yield call(waitForBackendSetup)
    const currentUserId: number = yield select(getUserId)

    try {
      const userChallenges: UserChallenge[] = yield apiClient.getUserChallenges(
        {
          userID: currentUserId
        }
      )
      yield put(fetchUserChallengesSucceeded({ userChallenges }))
    } catch (e) {
      console.error(e)
      yield put(fetchUserChallengesFailed())
    }
  })
}

function* watchUpdateHCaptchaScore() {
  yield takeEvery(updateHCaptchaScore.type, function* (
    action: ReturnType<typeof updateHCaptchaScore>
  ): any {
    const { token } = action.payload
    const result = yield call(AudiusBackend.updateHCaptchaScore, token)
    if (result.error) {
      yield put(setHCaptchaStatus({ status: HCaptchaStatus.ERROR }))
    } else {
      yield put(setHCaptchaStatus({ status: HCaptchaStatus.SUCCESS }))
    }
  })
}

const sagas = () => {
  const sagas = [
    watchFetchUserChallenges,
    watchUpdateHCaptchaScore,
    watchSetAHCaptchaStatus,
    watchSetCognitoFlowStatus,
    watchFetchClaimAttestation
  ]
  return NATIVE_MOBILE ? sagas.concat(mobileSagas()) : sagas
}

export default sagas
