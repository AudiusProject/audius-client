import { delay } from 'redux-saga'
import { takeEvery, put, call, takeLatest, select } from 'redux-saga/effects'

import { ChallengeRewardID, FailureReason } from 'common/models/AudioRewards'
import { User } from 'common/models/User'
import { StringAudio } from 'common/models/Wallet'
import { IntKeys, StringKeys } from 'common/services/remote-config'
import { getAccountUser } from 'common/store/account/selectors'
import {
  getClaimStatus,
  getClaimToRetry
} from 'common/store/pages/audio-rewards/selectors'
import {
  ClaimStatus,
  CognitoFlowStatus,
  fetchClaimAttestation,
  fetchClaimAttestationFailed,
  fetchClaimAttestationRetryPending,
  fetchClaimAttestationSucceeded,
  fetchCognitoFlowUrl,
  fetchCognitoFlowUrlFailed,
  fetchCognitoFlowUrlSucceeded,
  HCaptchaStatus,
  setCognitoFlowStatus,
  setHCaptchaStatus,
  setUserChallengeDisbursed,
  updateHCaptchaScore
} from 'common/store/pages/audio-rewards/slice'
import { setVisibility } from 'common/store/ui/modals/slice'
import { increaseBalance } from 'common/store/wallet/slice'
import { stringAudioToStringWei } from 'common/utils/wallet'
import { getCognitoFlow } from 'services/audius-backend/Cognito'
import { MessageType } from 'services/native-mobile-interface/types'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'

const HCAPTCHA_MODAL_NAME = 'HCaptcha'
const COGNITO_MODAL_NAME = 'Cognito'

const COGNITO_TEMPLATE_ID = process.env.REACT_APP_COGNITO_TEMPLATE_ID

function* watchUpdateHCaptchaScore() {
  yield takeEvery(MessageType.UPDATE_HCAPTCHA_SCORE, function* (action: {
    type: string
    token: string
  }) {
    yield put(updateHCaptchaScore({ token: action.token }))
  })
}

function* doFetchCognitoFlowUrl() {
  const { shareable_url } = yield call(getCognitoFlow, COGNITO_TEMPLATE_ID!)
  console.info(shareable_url)
  if (shareable_url) {
    yield put(fetchCognitoFlowUrlSucceeded(shareable_url))
  } else {
    yield put(fetchCognitoFlowUrlFailed())
    const claimStatus: ClaimStatus = yield select(getClaimStatus)
    if (claimStatus === ClaimStatus.RETRY_PENDING) {
      yield put(fetchClaimAttestationFailed())
    }
  }
}

function* retryClaimRewards(
  action:
    | ReturnType<typeof setHCaptchaStatus>
    | ReturnType<typeof setCognitoFlowStatus>
) {
  const { status } = action.payload
  const claimStatus: ClaimStatus = yield select(getClaimStatus)
  const claim: {
    challengeId: ChallengeRewardID
    amount: number
    specifier: string
  } = yield select(getClaimToRetry)
  if (claimStatus === ClaimStatus.RETRY_PENDING) {
    if (status === HCaptchaStatus.SUCCESS) {
      yield put(fetchClaimAttestation({ claim, retryOnFailure: false }))
    } else if (status !== CognitoFlowStatus.OPENED) {
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
  try {
    // const response: { error?: string } = yield call(
    //   AudiusBackend.submitAndEvaluateAttestations,
    //   {
    //     challengeId,
    //     encodedUserId: encodeHashId(currentUser.user_id),
    //     handle: currentUser.handle,
    //     recipientEthAddress: currentUser.wallet,
    //     specifier,
    //     oracleEthAddress,
    //     amount,
    //     quorumSize,
    //     AAOEndpoint
    //   }
    // )
    yield delay(3000)
    const response = { error: FailureReason.COGNITO_FLOW }
    if (response.error) {
      if (retryOnFailure) {
        switch (response.error) {
          case FailureReason.HCAPTCHA:
            yield put(fetchClaimAttestationRetryPending(claim))
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
      yield put(fetchClaimAttestationSucceeded)
    }
  } catch (e) {
    console.error('Error claiming rewards:', e)
    yield put(fetchClaimAttestationFailed())
  }
}

function* watchSetAHCaptchaStatus() {
  yield takeLatest(setHCaptchaStatus.type, retryClaimRewards)
}

function* watchFetchClaimAttestation() {
  yield takeLatest(fetchClaimAttestation.type, claimRewards)
}

function* watchFetchCognitoFlowUrl() {
  yield takeLatest(fetchCognitoFlowUrl.type, doFetchCognitoFlowUrl)
}

const sagas = () => {
  return [
    watchUpdateHCaptchaScore,
    watchSetAHCaptchaStatus,
    watchFetchClaimAttestation,
    watchFetchCognitoFlowUrl
  ]
}

export default sagas
