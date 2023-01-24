import { useCallback, useContext, useEffect } from 'react'

import type { Maybe, CommonState } from '@audius/common'
import {
  IntKeys,
  StringKeys,
  challengesSelectors,
  audioRewardsPageActions,
  ClaimStatus,
  audioRewardsPageSelectors
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import { useNavigation } from 'app/hooks/useNavigation'
import { useRemoteVar } from 'app/hooks/useRemoteConfig'
import type { ChallengesParamList } from 'app/utils/challenges'
import { getChallengeConfig } from 'app/utils/challenges'

import Button, { ButtonType } from '../button'
import { useDrawerState } from '../drawer/AppDrawer'
import { ToastContext } from '../toast/ToastContext'

import { ChallengeRewardsDrawer } from './ChallengeRewardsDrawer'
import { ProfileCompletionChecks } from './ProfileCompletionChecks'
import { ReferralRewardContents } from './ReferralRewardContents'
const { getChallengeRewardsModalType, getClaimStatus, getAAOErrorCode } =
  audioRewardsPageSelectors
const { claimChallengeReward, resetAndCancelClaimReward } =
  audioRewardsPageActions
const { getOptimisticUserChallenges } = challengesSelectors

const messages = {
  // Claim success toast
  claimSuccessMessage: 'Reward successfully claimed!'
}

const MODAL_NAME = 'ChallengeRewardsExplainer'

const styles = {
  button: {
    width: '100%'
  }
}

export const ChallengeRewardsDrawerProvider = () => {
  const dispatch = useDispatch()
  const { onClose } = useDrawerState(MODAL_NAME)
  const modalType = useSelector(getChallengeRewardsModalType)
  const userChallenges = useSelector((state: CommonState) =>
    getOptimisticUserChallenges(state, true)
  )

  const handleClose = useCallback(() => {
    dispatch(resetAndCancelClaimReward())
    onClose()
  }, [dispatch, onClose])

  const claimStatus = useSelector(getClaimStatus)
  const aaoErrorCode = useSelector(getAAOErrorCode)

  const { toast } = useContext(ToastContext)

  const challenge = userChallenges ? userChallenges[modalType] : null
  const config = getChallengeConfig(modalType)
  const hasChallengeCompleted =
    challenge?.state === 'completed' || challenge?.state === 'disbursed'

  // We could just depend on undisbursedAmount here
  // But DN may have not indexed the challenge so check for client-side completion too
  // Note that we can't handle aggregate challenges optimistically
  let audioToClaim = 0
  let audioClaimedSoFar = 0
  if (challenge?.challenge_type === 'aggregate') {
    audioToClaim = challenge.claimableAmount
    audioClaimedSoFar =
      challenge.amount * challenge.current_step_count - audioToClaim
  } else if (challenge?.state === 'completed') {
    audioToClaim = challenge.totalAmount
    audioClaimedSoFar = 0
  } else if (challenge?.state === 'disbursed') {
    audioToClaim = 0
    audioClaimedSoFar = challenge.totalAmount
  }

  const { navigate } = useNavigation<ChallengesParamList>()

  const handleNavigation = useCallback(() => {
    if (config.buttonInfo?.navigation) {
      const { screen, params } = config.buttonInfo.navigation
      // @ts-expect-error not smart enough
      navigate(screen, params)
      handleClose()
    }
  }, [navigate, config, handleClose])

  const openUploadModal = useCallback(() => {
    handleClose()
    navigate('Upload')
  }, [handleClose, navigate])

  // Claim rewards button config
  const quorumSize = useRemoteVar(IntKeys.ATTESTATION_QUORUM_SIZE)
  const oracleEthAddress = useRemoteVar(StringKeys.ORACLE_ETH_ADDRESS)
  const AAOEndpoint = useRemoteVar(StringKeys.ORACLE_ENDPOINT)
  const hasConfig = (oracleEthAddress && AAOEndpoint && quorumSize > 0) || true
  const onClaim = useCallback(() => {
    dispatch(
      claimChallengeReward({
        claim: {
          challengeId: modalType,
          specifiers: [challenge?.specifier ?? ''],
          amount: challenge?.amount ?? 0
        },
        retryOnFailure: true
      })
    )
  }, [dispatch, modalType, challenge])

  useEffect(() => {
    if (claimStatus === ClaimStatus.SUCCESS) {
      toast({ content: messages.claimSuccessMessage, type: 'info' })
    }
  }, [toast, claimStatus])

  // Challenge drawer contents
  let contents: Maybe<React.ReactElement>
  if (challenge?.state && challenge?.state !== 'completed') {
    switch (modalType) {
      case 'referrals':
      case 'ref-v':
        contents = (
          <ReferralRewardContents isVerified={!!config.isVerifiedChallenge} />
        )
        break
      case 'track-upload':
        contents = config?.buttonInfo && (
          <Button
            containerStyle={styles.button}
            title={config.panelButtonText}
            renderIcon={config.buttonInfo.renderIcon}
            iconPosition='right'
            type={
              challenge?.state === 'disbursed'
                ? ButtonType.COMMON
                : ButtonType.PRIMARY
            }
            onPress={openUploadModal}
          />
        )
        break
      case 'profile-completion':
        contents = (
          <ProfileCompletionChecks
            isComplete={hasChallengeCompleted}
            onClose={handleClose}
          />
        )
        break
      default:
        contents = config?.buttonInfo && (
          <Button
            containerStyle={styles.button}
            title={config.panelButtonText}
            renderIcon={config.buttonInfo.renderIcon}
            iconPosition={config.buttonInfo.iconPosition}
            type={
              hasChallengeCompleted ? ButtonType.COMMON : ButtonType.PRIMARY
            }
            onPress={handleNavigation}
          />
        )
    }
  }

  // Bail if not on challenges page/challenges aren't loaded
  if (!config || !challenge) {
    return null
  }

  return (
    <ChallengeRewardsDrawer
      onClose={handleClose}
      title={config.title}
      titleIcon={config.icon}
      description={config.description(challenge)}
      progressLabel={config.progressLabel ?? 'Completed'}
      amount={challenge.totalAmount}
      challengeState={challenge.state}
      currentStep={challenge.current_step_count}
      stepCount={challenge.max_steps}
      claimableAmount={audioToClaim}
      claimedAmount={audioClaimedSoFar}
      claimStatus={claimStatus}
      aaoErrorCode={aaoErrorCode}
      onClaim={hasConfig ? onClaim : undefined}
      isVerifiedChallenge={!!config.isVerifiedChallenge}
      showProgressBar={
        challenge.challenge_type !== 'aggregate' && challenge.max_steps > 1
      }
    >
      {contents}
    </ChallengeRewardsDrawer>
  )
}
