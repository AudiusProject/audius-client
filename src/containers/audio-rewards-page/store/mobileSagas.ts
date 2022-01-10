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
  fetchClaimAttestation,
  fetchClaimAttestationFailed,
  fetchClaimAttestationRetryPending,
  fetchClaimAttestationSucceeded,
  HCaptchaStatus,
  setHCaptchaStatus,
  setUserChallengeDisbursed,
  updateHCaptchaScore
} from 'common/store/pages/audio-rewards/slice'
import { setVisibility } from 'common/store/ui/modals/slice'
import { increaseBalance } from 'common/store/wallet/slice'
import { stringAudioToStringWei } from 'common/utils/wallet'
import AudiusBackend from 'services/AudiusBackend'
import { MessageType } from 'services/native-mobile-interface/types'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'
import { encodeHashId } from 'utils/route/hashIds'

const HCAPTCHA_MODAL_NAME = 'HCaptcha'

function* watchUpdateHCaptchaScore() {
  yield takeEvery(MessageType.UPDATE_HCAPTCHA_SCORE, function* (action: {
    type: string
    token: string
  }) {
    yield put(updateHCaptchaScore({ token: action.token }))
  })
}

function* retryClaimRewards(action: ReturnType<typeof setHCaptchaStatus>) {
  const { status } = action.payload
  const claimStatus: ClaimStatus = yield select(getClaimStatus)
  const claim: {
    challengeId: ChallengeRewardID
    amount: number
    specifier: string
  } = yield select(getClaimToRetry)
  if (
    status === HCaptchaStatus.SUCCESS &&
    claimStatus === ClaimStatus.RETRY_PENDING
  ) {
    yield put(fetchClaimAttestation({ claim, retryOnFailure: false }))
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
        switch (response.error) {
          case FailureReason.HCAPTCHA:
            yield put(fetchClaimAttestationRetryPending(claim))
            yield put(
              setVisibility({ modal: HCAPTCHA_MODAL_NAME, visible: true })
            )
            break
          case FailureReason.COGNITO_FLOW:
            console.error('cognito')
            break
          case FailureReason.BLOCKED:
            throw new Error('user is blocked from claiming')
          case FailureReason.UNKNOWN_ERROR:
          default:
            throw new Error(`Unknown Error: ${response.error}`)
        }
      } else {
        yield put(fetchClaimAttestationFailed)
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
    console.error('Error claiming reward:', e)
    yield put(fetchClaimAttestationFailed)
  }
}

function* watchSetAHCaptchaStatus() {
  yield takeLatest(setHCaptchaStatus.type, retryClaimRewards)
}

function* watchFetchClaimAttestation() {
  yield takeLatest(fetchClaimAttestation.type, claimRewards)
}

const sagas = () => {
  return [
    watchUpdateHCaptchaScore,
    watchSetAHCaptchaStatus,
    watchFetchClaimAttestation
  ]
}

export default sagas
