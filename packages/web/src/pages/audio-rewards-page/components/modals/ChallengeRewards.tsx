import { useCallback, useEffect, useContext, useMemo } from 'react'

import {
  Button,
  ButtonType,
  ProgressBar,
  IconCheck,
  IconVerified,
  IconTwitterBird
} from '@audius/stems'
import cn from 'classnames'
import { push as pushRoute } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconCopy } from 'assets/img/iconCopy.svg'
import { ReactComponent as IconValidationCheck } from 'assets/img/iconValidationCheck.svg'
import QRCode from 'assets/img/imageQR.png'
import { useModalState } from 'common/hooks/useModalState'
import { getUserHandle } from 'common/store/account/selectors'
import { getOptimisticUserChallenges } from 'common/store/challenges/selectors/optimistic-challenges'
import { getCompletionStages } from 'common/store/challenges/selectors/profile-progress'
import {
  getChallengeRewardsModalType,
  getClaimStatus,
  getCognitoFlowStatus
} from 'common/store/pages/audio-rewards/selectors'
import {
  ChallengeRewardsModalType,
  setChallengeRewardsModalType,
  ClaimStatus,
  resetAndCancelClaimReward,
  CognitoFlowStatus,
  claimChallengeReward
} from 'common/store/pages/audio-rewards/slice'
import { fillString } from 'common/utils/fillString'
import { formatNumberCommas } from 'common/utils/formatUtil'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { show as showConfetti } from 'components/music-confetti/store/slice'
import Toast from 'components/toast/Toast'
import { ToastContext } from 'components/toast/ToastContext'
import Tooltip from 'components/tooltip/Tooltip'
import { ComponentPlacement, MountPlacement } from 'components/types'
import { useWithMobileStyle } from 'hooks/useWithMobileStyle'
import { challengeRewardsConfig } from 'pages/audio-rewards-page/config'
import { isMobile } from 'utils/clientUtil'
import { copyToClipboard, getCopyableLink } from 'utils/clipboardUtil'
import { CLAIM_REWARD_TOAST_TIMEOUT_MILLIS } from 'utils/constants'
import { openTwitterLink } from 'utils/tweet'

import PurpleBox from '../PurpleBox'

import styles from './ChallengeRewards.module.css'
import ModalDrawer from './ModalDrawer'

export const useRewardsModalType = (): [
  ChallengeRewardsModalType,
  (type: ChallengeRewardsModalType) => void
] => {
  const dispatch = useDispatch()
  const modalType = useSelector(getChallengeRewardsModalType)
  const setModalType = useCallback(
    (type: ChallengeRewardsModalType) => {
      dispatch(setChallengeRewardsModalType({ modalType: type }))
    },
    [dispatch]
  )
  return [modalType, setModalType]
}
const inviteLink = getCopyableLink('/signup?ref=%0')
const messages = {
  copyLabel: 'Copy to Clipboard',
  copiedLabel: 'Copied to Clipboard',
  inviteLabel: 'Copy Invite to Clipboard',
  inviteLink,
  qrText: 'Download the App',
  qrSubtext: 'Scan This QR Code with Your Phone Camera',
  rewardClaimed: 'Reward claimed successfully!',
  rewardAlreadyClaimed: 'Reward already claimed!',
  claimError:
    'Something has gone wrong, not all your rewards were claimed. Please try again.',
  claimYourReward: 'Claim Your Reward',
  twitterShare: (modalType: 'referrals' | 'ref-v') =>
    `Share Invite With Your ${modalType === 'referrals' ? 'Friends' : 'Fans'}`,
  twitterCopy: `Come support me on @audiusproject! Use my link and we both earn $AUDIO when you sign up.\n\n #audius #audiorewards\n\n`,
  verifiedChallenge: 'VERIFIED CHALLENGE',
  claimAmountLabel: '$AUDIO available to claim',
  claimedSoFar: '$AUDIO claimed so far',

  // Profile checks
  profileCheckNameAndHandle: 'Name & Handle',
  profileCheckProfilePicture: 'Profile Picture',
  profileCheckCoverPhoto: 'Cover Photo',
  profileCheckProfileDescription: 'Profile Description',
  profileCheckFavorite: 'Favorite Track/Playlist',
  profileCheckRepost: 'Repost Track/Playlist',
  profileCheckFollow: 'Follow Five People'
}

type InviteLinkProps = {
  className?: string
  inviteLink: string
}

const InviteLink = ({ className, inviteLink }: InviteLinkProps) => {
  const wm = useWithMobileStyle(styles.mobile)

  const onButtonClick = useCallback(() => {
    copyToClipboard(inviteLink)
  }, [inviteLink])

  return (
    <Tooltip text={messages.copyLabel} placement={'top'} mount={'parent'}>
      <div className={wm(styles.toastContainer, { [className!]: !!className })}>
        <Toast
          text={messages.copiedLabel}
          delay={2000}
          placement={ComponentPlacement.TOP}
          mount={MountPlacement.PARENT}
        >
          <PurpleBox
            className={wm(styles.inviteButtonContainer)}
            onClick={onButtonClick}
            text={
              <div className={styles.inviteLinkContainer}>
                <IconCopy className={wm(styles.inviteIcon)} />
                <div className={styles.inviteLink}>{messages.inviteLabel}</div>
              </div>
            }
          />
        </Toast>
      </div>
    </Tooltip>
  )
}

type TwitterShareButtonProps = {
  modalType: 'referrals' | 'ref-v'
  inviteLink: string
}

const TwitterShareButton = ({
  modalType,
  inviteLink
}: TwitterShareButtonProps) => {
  const wm = useWithMobileStyle(styles.mobile)
  return (
    <Button
      type={ButtonType.PRIMARY_ALT}
      text={messages.twitterShare(modalType)}
      leftIcon={<IconTwitterBird />}
      onClick={() => openTwitterLink(inviteLink, messages.twitterCopy)}
      className={wm(styles.twitterButton)}
      textClassName={styles.twitterText}
      iconClassName={styles.twitterIcon}
    />
  )
}

const ProfileChecks = () => {
  const completionStages = useSelector(getCompletionStages)
  const wm = useWithMobileStyle(styles.mobile)

  const config: Record<string, boolean> = {
    [messages.profileCheckNameAndHandle]: completionStages.hasNameAndHandle,
    [messages.profileCheckProfilePicture]: completionStages.hasProfilePicture,
    [messages.profileCheckCoverPhoto]: completionStages.hasCoverPhoto,
    [messages.profileCheckProfileDescription]:
      completionStages.hasProfileDescription,
    [messages.profileCheckFavorite]: completionStages.hasFavoritedItem,
    [messages.profileCheckRepost]: !!completionStages.hasReposted,
    [messages.profileCheckFollow]: completionStages.hasFollowedAccounts
  }

  return (
    <div className={wm(styles.profileTaskContainer)}>
      {Object.keys(config).map((key) => (
        <div className={wm(styles.profileTask)} key={key}>
          {config[key] ? (
            <IconValidationCheck />
          ) : (
            <div className={styles.profileTaskCircle} />
          )}
          <p className={cn({ [styles.completeText]: config[key] })}>{key}</p>
        </div>
      ))}
    </div>
  )
}

type BodyProps = {
  dismissModal: () => void
}

const ChallengeRewardsBody = ({ dismissModal }: BodyProps) => {
  const [modalType] = useRewardsModalType()
  const userHandle = useSelector(getUserHandle)
  const dispatch = useDispatch()
  const wm = useWithMobileStyle(styles.mobile)
  const displayMobileContent = isMobile()

  const userChallenges = useSelector(getOptimisticUserChallenges)
  const challenge = userChallenges[modalType]

  const { fullDescription, progressLabel, modalButtonInfo, verifiedChallenge } =
    challengeRewardsConfig[modalType]

  const currentStepCount = challenge?.current_step_count || 0

  let linkType: 'complete' | 'inProgress' | 'incomplete'
  if (challenge?.state === 'completed') {
    linkType = 'complete'
  } else if (challenge?.state === 'in_progress') {
    linkType = 'inProgress'
  } else {
    linkType = 'incomplete'
  }
  const buttonInfo = modalButtonInfo[linkType]
  const buttonLink = buttonInfo?.link(userHandle)

  const goToRoute = useCallback(() => {
    if (!buttonLink) return
    dispatch(pushRoute(buttonLink))
    dismissModal()
  }, [buttonLink, dispatch, dismissModal])

  const progressDescription = (
    <div className={wm(styles.progressDescription)}>
      <h3>
        {verifiedChallenge ? (
          <div className={styles.verifiedChallenge}>
            <IconVerified />
            {messages.verifiedChallenge}
          </div>
        ) : (
          'Task'
        )}
      </h3>
      <p>{fullDescription(challenge)}</p>
    </div>
  )

  const progressReward = (
    <div className={wm(styles.progressReward)}>
      <h3>Reward</h3>
      <h2>{formatNumberCommas(challenge?.totalAmount ?? '')}</h2>
      <h4>$AUDIO</h4>
    </div>
  )

  const progressStatusLabel = (
    <div
      className={cn(styles.progressStatus, {
        [styles.incomplete]: challenge?.state === 'incomplete',
        [styles.inProgress]: challenge?.state === 'in_progress',
        [styles.complete]:
          challenge?.state === 'completed' || challenge?.state === 'disbursed'
      })}
    >
      {challenge?.state === 'incomplete' && (
        <h3 className={styles.incomplete}>Incomplete</h3>
      )}
      {(challenge?.state === 'completed' ||
        challenge?.state === 'disbursed') && (
        <h3 className={styles.complete}>Complete</h3>
      )}
      {challenge?.state === 'in_progress' && (
        <h3 className={styles.inProgress}>
          {fillString(
            progressLabel,
            formatNumberCommas(currentStepCount.toString()),
            formatNumberCommas(challenge?.max_steps?.toString() ?? '')
          )}
        </h3>
      )}
    </div>
  )

  const { toast } = useContext(ToastContext)
  const claimStatus = useSelector(getClaimStatus)
  const claimInProgress =
    claimStatus === ClaimStatus.CLAIMING ||
    claimStatus === ClaimStatus.WAITING_FOR_RETRY

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

  const showProgressBar =
    challenge &&
    challenge.max_steps > 1 &&
    challenge.challenge_type !== 'aggregate'

  const onClaimRewardClicked = useCallback(() => {
    if (challenge) {
      dispatch(
        claimChallengeReward({
          claim: {
            challengeId: challenge.challenge_id,
            specifiers:
              challenge.challenge_type === 'aggregate'
                ? challenge.undisbursedSpecifiers
                : [challenge.specifier],
            amount: challenge.amount
          },
          retryOnFailure: true
        })
      )
    }
  }, [dispatch, challenge])

  useEffect(() => {
    if (claimStatus === ClaimStatus.SUCCESS) {
      toast(messages.rewardClaimed, CLAIM_REWARD_TOAST_TIMEOUT_MILLIS)
      dispatch(showConfetti())
    }
    if (claimStatus === ClaimStatus.ALREADY_CLAIMED) {
      toast(messages.rewardAlreadyClaimed, CLAIM_REWARD_TOAST_TIMEOUT_MILLIS)
    }
  }, [claimStatus, toast, dispatch])

  const inviteLink = useMemo(
    () => (userHandle ? fillString(messages.inviteLink, userHandle) : ''),
    [userHandle]
  )

  return (
    <div className={wm(styles.container)}>
      {displayMobileContent ? (
        <>
          {progressDescription}
          <div className={wm(styles.progressCard)}>
            <div className={wm(styles.progressInfo)}>
              {progressReward}
              {showProgressBar ? (
                <div className={wm(styles.progressBarSection)}>
                  <h3>Progress</h3>
                  <ProgressBar
                    className={wm(styles.progressBar)}
                    value={currentStepCount}
                    max={challenge?.max_steps}
                  />
                </div>
              ) : null}
            </div>
            {progressStatusLabel}
          </div>
          {modalType === 'profile-completion' && <ProfileChecks />}
        </>
      ) : (
        <div className={styles.progressCard}>
          <div className={styles.progressInfo}>
            {progressDescription}
            {progressReward}
          </div>
          {showProgressBar && (
            <div className={wm(styles.progressBarSection)}>
              {modalType === 'profile-completion' && <ProfileChecks />}
              <ProgressBar
                className={wm(styles.progressBar)}
                value={currentStepCount}
                max={challenge?.max_steps}
              />
            </div>
          )}
          {progressStatusLabel}
        </div>
      )}

      {userHandle && (modalType === 'referrals' || modalType === 'ref-v') && (
        <div className={wm(styles.buttonContainer)}>
          <TwitterShareButton modalType={modalType} inviteLink={inviteLink} />
          <div className={styles.buttonSpacer} />
          <InviteLink inviteLink={inviteLink} />
        </div>
      )}
      {modalType === 'mobile-install' && (
        <div className={wm(styles.qrContainer)}>
          <img className={styles.qr} src={QRCode} alt='QR Code' />
          <div className={styles.qrTextContainer}>
            <h2 className={styles.qrText}>{messages.qrText}</h2>
            <h3 className={styles.qrSubtext}>{messages.qrSubtext}</h3>
          </div>
        </div>
      )}
      {buttonLink && (
        <Button
          className={wm(cn(styles.button, styles.buttonLink))}
          type={
            challenge?.state === 'completed'
              ? ButtonType.COMMON
              : ButtonType.PRIMARY_ALT
          }
          text={buttonInfo?.label}
          onClick={goToRoute}
          leftIcon={buttonInfo?.leftIcon}
          rightIcon={buttonInfo?.rightIcon}
        />
      )}
      <div className={wm(styles.claimRewardWrapper)}>
        {audioToClaim > 0 ? (
          <>
            <div className={styles.claimRewardAmountLabel}>
              {`${audioToClaim} ${messages.claimAmountLabel}`}
            </div>
            <Button
              text={messages.claimYourReward}
              className={wm(styles.button)}
              type={
                claimInProgress ? ButtonType.DISABLED : ButtonType.PRIMARY_ALT
              }
              isDisabled={claimInProgress}
              rightIcon={
                claimInProgress ? (
                  <LoadingSpinner className={styles.spinner} />
                ) : (
                  <IconCheck />
                )
              }
              onClick={onClaimRewardClicked}
            />
          </>
        ) : null}
        {audioClaimedSoFar > 0 && challenge?.state !== 'disbursed' ? (
          <div className={styles.claimRewardClaimedAmountLabel}>
            {`(${formatNumberCommas(audioClaimedSoFar)} ${
              messages.claimedSoFar
            })`}
          </div>
        ) : null}
      </div>
      {claimStatus === ClaimStatus.ERROR && (
        <div className={styles.claimError}>{messages.claimError}</div>
      )}
    </div>
  )
}

export const ChallengeRewardsModal = () => {
  const [modalType] = useRewardsModalType()
  const [isOpen, setOpen] = useModalState('ChallengeRewardsExplainer')
  const dispatch = useDispatch()
  const wm = useWithMobileStyle(styles.mobile)
  const onClose = useCallback(() => {
    setOpen(false)
    // Cancel any claims on close so that the state is fresh for other rewards
    dispatch(resetAndCancelClaimReward())
  }, [dispatch, setOpen])
  const [isHCaptchaModalOpen] = useModalState('HCaptcha')
  const cognitoFlowStatus = useSelector(getCognitoFlowStatus)

  const { icon, title } = challengeRewardsConfig[modalType]

  return (
    <ModalDrawer
      title={
        <>
          {icon}
          {title}
        </>
      }
      showTitleHeader
      isOpen={isOpen}
      onClose={onClose}
      isFullscreen={true}
      useGradientTitle={false}
      titleClassName={wm(styles.title)}
      headerContainerClassName={styles.header}
      showDismissButton={
        !isHCaptchaModalOpen && cognitoFlowStatus === CognitoFlowStatus.CLOSED
      }
      dismissOnClickOutside={
        !isHCaptchaModalOpen && cognitoFlowStatus === CognitoFlowStatus.CLOSED
      }
    >
      <ChallengeRewardsBody dismissModal={onClose} />
    </ModalDrawer>
  )
}

export default ChallengeRewardsModal
