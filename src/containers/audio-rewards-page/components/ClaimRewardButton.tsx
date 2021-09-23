import React, { useEffect, useCallback } from 'react'

import { Button, ButtonType } from '@audius/stems'
import { useDispatch, useSelector } from 'react-redux'

import { useModalState } from 'hooks/useModalState'
import { useScript } from 'hooks/useScript'
import AudiusBackend from 'services/AudiusBackend'
import { getAccountUser, getUserHandle } from 'store/account/selectors'
import { COGNITO_SCRIPT_URL } from 'utils/constants'
import { encodeHashId } from 'utils/route/hashIds'

import {
  ClaimStatus,
  CognitoFlowStatus,
  getHCaptchaStatus,
  HCaptchaStatus,
  setClaimStatus,
  setCognitoFlowStatus
} from '../store/slice'
import {
  ChallengeRewardID,
  FailureReason,
  FlowErrorEvent,
  FlowSessionEvent,
  FlowUICloseEvent,
  FlowUIOpenEvent
} from '../types'

import styles from './modals/ChallengeRewards.module.css'

const messages = {
  claimYourReward: 'Claim Your Reward'
}

type ClaimRewardButtonProps = {
  challengeId: ChallengeRewardID
  specifier: string
  amount: number
  isDisabled: boolean
  icon: JSX.Element
  className?: string
}

// TODO: Closing modal (meaning this button no longer on screen) should reset both claim and hcaptcha statuses
// =============
// this button will handle triggering the cognito flow
// or showing the HCaptchaModal
// or both
// logic for which flow exactly to trigger is TBD
// pending AAO changes and DP undisbursed challenges integration
const ClaimRewardButton = ({
  challengeId,
  specifier,
  amount,
  isDisabled,
  icon,
  className
}: ClaimRewardButtonProps) => {
  const handle = useSelector(getUserHandle)
  const currentUser = useSelector(getAccountUser)
  const hCaptchaStatus = useSelector(getHCaptchaStatus)
  const dispatch = useDispatch()
  const scriptLoaded = useScript(COGNITO_SCRIPT_URL)
  const [, setHCaptchaOpen] = useModalState('HCaptcha')
  const [, setRewardModalOpen] = useModalState('ChallengeRewardsExplainer')

  const claimReward = useCallback(async () => {
    dispatch(setClaimStatus({ status: ClaimStatus.CLAIMING }))

    const currentUserId = currentUser?.user_id ?? 0
    const recipientEthAddress = currentUser?.wallet ?? null
    if (!currentUserId || !recipientEthAddress) {
      throw new Error('user id or wallet not available')
    }

    const encodedUserId = encodeHashId(currentUserId)
    // TODO: should these be in env var or remote config?
    const quorumSize = 2
    const oracleEthAddress = '0xEc3a6aad822630a37210531411A4CD625EC59b33'
    const AAOEndpoint = 'http://34.83.140.15:8000'

    const response = await AudiusBackend.submitAndEvaluateAttestations({
      challengeId,
      encodedUserId,
      handle,
      recipientEthAddress,
      specifier,
      oracleEthAddress,
      amount,
      quorumSize,
      AAOEndpoint
    })

    return response
  }, [dispatch, currentUser, handle, challengeId, specifier, amount])

  const retryClaimReward = useCallback(async () => {
    try {
      const { error } = await claimReward()
      if (error) {
        dispatch(setClaimStatus({ status: ClaimStatus.ERROR }))
      } else {
        dispatch(setClaimStatus({ status: ClaimStatus.SUCCESS }))
      }
    } catch (e) {
      console.log(`Error claiming reward after retry: ${e}`)
      dispatch(setClaimStatus({ status: ClaimStatus.ERROR }))
    }
  }, [claimReward, dispatch])

  useEffect(() => {
    console.log({ hCaptchaStatus })
    switch (hCaptchaStatus) {
      case HCaptchaStatus.SUCCESS:
        console.log(
          'User submitted their hcaptcha verification, trying reward claim again...'
        )
        retryClaimReward()
        break
      case HCaptchaStatus.ERROR:
        console.log('Error claiming reward: hCaptcha verification failed')
        dispatch(setClaimStatus({ status: ClaimStatus.ERROR }))
        break
      case HCaptchaStatus.USER_CLOSED:
        console.log('Error claiming reward: user closed hCaptcha modal')
        dispatch(setClaimStatus({ status: ClaimStatus.ERROR }))
        break
      case HCaptchaStatus.NONE:
      default:
        // nothing
        break
    }
  }, [hCaptchaStatus, retryClaimReward, dispatch])

  const triggerHCaptcha = async () => {
    setRewardModalOpen(false)
    setHCaptchaOpen(true)
  }

  const triggerCognitoFlow = async () => {
    const { signature } = await AudiusBackend.getCognitoSignature()

    // @ts-ignore
    const flow = new Flow({
      publishableKey: process.env.REACT_APP_COGNITO_KEY,
      templateId: process.env.REACT_APP_COGNITO_TEMPLATE_ID,
      user: {
        customerReference: handle,
        signature
      }
    })

    flow.on('ui', (event: FlowUIOpenEvent | FlowUICloseEvent) => {
      switch (event.action) {
        case 'opened':
          dispatch(setCognitoFlowStatus({ status: CognitoFlowStatus.OPENED }))
          break
        case 'closed':
          console.log(
            'Error claiming reward: user closed the cognito flow modal'
          )
          dispatch(setCognitoFlowStatus({ status: CognitoFlowStatus.CLOSED }))
          dispatch(setClaimStatus({ status: ClaimStatus.ERROR }))
          break
        default:
          // nothing
          break
      }
    })

    flow.on('session', (event: FlowSessionEvent) => {
      switch (event.action) {
        case 'passed':
          console.log(
            'User successfully completed their flow session, trying reward claim again...'
          )
          flow.close()
          retryClaimReward()
          break
        case 'created':
          console.log('User started a new flow session')
          break
        case 'resumed':
          console.log('User resumed an existing flow session')
          break
        case 'failed':
          console.log('Error claiming reward: User failed their flow session')
          flow.close()
          dispatch(setClaimStatus({ status: ClaimStatus.ERROR }))
          break
        default:
          // nothing
          break
      }
    })

    flow.on('error', (event: FlowErrorEvent) => {
      console.log(`Error claiming reward: Flow error! ${event.message}`)
      dispatch(setClaimStatus({ status: ClaimStatus.ERROR }))
    })

    flow.open()
  }

  const handleClick = async () => {
    try {
      const { error } = await claimReward()

      if (error) {
        switch (error) {
          case FailureReason.HCAPTCHA:
            triggerHCaptcha()
            break
          case FailureReason.COGNITO_FLOW:
            triggerCognitoFlow()
            break
          case FailureReason.BLOCKED:
            throw new Error('user is blocked from claiming')
          case FailureReason.UNKNOWN_ERROR:
          default:
            throw new Error()
        }
      } else {
        dispatch(setClaimStatus({ status: ClaimStatus.SUCCESS }))
      }
    } catch (e) {
      console.log(`Error claiming reward: ${e}`)
      dispatch(setClaimStatus({ status: ClaimStatus.ERROR }))
    }
  }

  return handle && scriptLoaded ? (
    <Button
      className={className}
      text={messages.claimYourReward}
      onClick={handleClick}
      rightIcon={icon}
      type={ButtonType.PRIMARY_ALT}
      isDisabled={isDisabled}
    />
  ) : null
}

export default ClaimRewardButton
