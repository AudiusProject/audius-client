// @ts-nocheck
import React, { useCallback } from 'react'

import { Button, ButtonType, IconArrow, IconUpload } from '@audius/stems'
import cn from 'classnames'
import { push as pushRoute } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconCopy } from 'assets/img/iconCopy.svg'
import QRCode from 'assets/img/imageQR.png'
import Toast from 'components/toast/Toast'
import Tooltip from 'components/tooltip/Tooltip'
import { ComponentPlacement, MountPlacement } from 'components/types'
import { challengeRewardsConfig } from 'containers/audio-rewards-page/config'
import {
  ChallengeRewardsModalType,
  getChallengeRewardsModalType,
  getUserChallenges,
  setChallengeRewardsModalType
} from 'containers/audio-rewards-page/store/slice'
import { useModalState } from 'hooks/useModalState'
import { useWithMobileStyle } from 'hooks/useWithMobileStyle'
import { getUserHandle } from 'store/account/selectors'
import { isMobile } from 'utils/clientUtil'
import { copyToClipboard } from 'utils/clipboardUtil'
import fillString from 'utils/fillString'
import {
  profilePage,
  SETTINGS_PAGE,
  TRENDING_PAGE,
  UPLOAD_PAGE
} from 'utils/route'
import { Nullable } from 'utils/typeUtils'

import ProgressBar from '../ProgressBar'
import PurpleBox from '../PurpleBox'

import styles from './ChallengeRewards.module.css'
import ModalDrawer from './ModalDrawer'

const useModalType = (): [
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

const modalTypeNavigationMap: Record<
  ChallengeRewardsModalType,
  (handle: Nullable<string>) => Nullable<string>
> = {
  'invite-friends': () => null,
  'connect-verified': () => SETTINGS_PAGE,
  'listen-streak': () => TRENDING_PAGE,
  'mobile-app': () => null,
  'profile-completion': (handle: Nullable<string>) =>
    handle ? profilePage(handle) : null,
  'track-upload': () => UPLOAD_PAGE
} as const

const COPY_LABEL = 'Copy to Clipboard'
const COPIED_LABEL = 'Copied to Clipboard'
const INVITE_LABEL = 'Copy Invite Link'
const INVITE_LINK = 'audius.co/signup?ref=%0'

type InviteLinkProps = {
  className?: string
  handle: string
}

const InviteLink = ({ className, handle }: InviteLinkProps) => {
  const inviteLink = fillString(INVITE_LINK, handle)

  const onButtonClick = useCallback(() => {
    copyToClipboard(inviteLink)
  }, [inviteLink])

  return (
    <Tooltip text={COPY_LABEL} placement={'top'} mount={'parent'}>
      <div className={cn(styles.toastContainer, { [className!]: !!className })}>
        <Toast
          text={COPIED_LABEL}
          delay={2000}
          overlayClassName={styles.toast}
          placement={ComponentPlacement.TOP}
          mount={MountPlacement.PARENT}
        >
          <PurpleBox
            label={INVITE_LABEL}
            className={styles.inviteButtonContainer}
            onClick={onButtonClick}
            text={
              <div className={styles.inviteLinkContainer}>
                <div className={styles.inviteLink}>{inviteLink}</div>
                <IconCopy className={styles.inviteIcon} />
              </div>
            }
          />
        </Toast>
      </div>
    </Tooltip>
  )
}

const QR_TEXT = 'Download the App'
const QR_SUBTEXT = 'Scan This QR Code with Your Phone Camera'

type BodyProps = {
  dismissModal: () => void
}

const ChallengeRewardsBody = ({ dismissModal }: BodyProps) => {
  const [modalType, _] = useModalType()
  const userChallenges = useSelector(getUserChallenges)
  const userHandle = useSelector(getUserHandle)
  const dispatch = useDispatch()
  const wm = useWithMobileStyle(styles.mobile)
  const dispalyMobileContent = isMobile()

  const buttonLink = modalTypeNavigationMap[modalType](userHandle)
  const goToRoute = () => {
    if (buttonLink === null) return
    dispatch(pushRoute(buttonLink))
    dismissModal()
  }

  const challenge = userChallenges.find(
    userChallenge => userChallenge.challenge_id === modalType
  )

  const {
    amount,
    fullDescription,
    buttonText,
    progressLabel,
    stepCount
  } = challengeRewardsConfig[modalType]

  const currentStepCount = challenge?.current_step_count || 0
  const isIncomplete = currentStepCount === 0
  const isInProgress = currentStepCount > 0 && currentStepCount !== stepCount
  const isComplete = currentStepCount === stepCount
  // Use for rendering the 'Claim Reward' button
  // const isDisbursed = challenge?.is_disbursed

  const progressDescription = (
    <div className={wm(styles.progressDescription)}>
      <h3>Task</h3>
      <p>{fullDescription}</p>
    </div>
  )

  const progressReward = (
    <div className={wm(styles.progressReward)}>
      <h3>Reward</h3>
      <h2>{amount}</h2>
      <h4>$AUDIO</h4>
    </div>
  )

  const progressStatusLabel = (
    <div
      className={cn(styles.progressStatus, {
        [styles.incomplete]: isIncomplete,
        [styles.inProgress]: isInProgress,
        [styles.complete]: isComplete
      })}
    >
      {isIncomplete && <h3 className={styles.incomplete}>Incomplete</h3>}
      {isComplete && <h3 className={styles.complete}>Complete</h3>}
      {isInProgress && (
        <h3 className={styles.inProgress}>
          {fillString(
            progressLabel,
            currentStepCount.toString(),
            stepCount.toString()
          )}
        </h3>
      )}
    </div>
  )

  return (
    <div className={wm(styles.container)}>
      {dispalyMobileContent ? (
        <>
          {progressDescription}
          <div className={wm(styles.progressCard)}>
            <div className={wm(styles.progressInfo)}>
              {progressReward}
              <div className={wm(styles.progressBarSection)}>
                <h3>Progress</h3>
                <ProgressBar
                  className={wm(styles.progressBar)}
                  value={currentStepCount}
                  max={stepCount}
                />
              </div>
            </div>
            {progressStatusLabel}
          </div>
        </>
      ) : (
        <div className={styles.progressCard}>
          <div className={styles.progressInfo}>
            {progressDescription}
            {progressReward}
          </div>
          {stepCount > 1 && (
            <div className={wm(styles.progressBarSection)}>
              <ProgressBar
                className={wm(styles.progressBar)}
                value={currentStepCount}
                max={stepCount}
              />
            </div>
          )}
          {progressStatusLabel}
        </div>
      )}

      {userHandle && modalType === 'invite-friends' && (
        <InviteLink handle={userHandle} />
      )}
      {modalType === 'mobile-app' && (
        <div className={wm(styles.qrContainer)}>
          <img className={styles.qr} src={QRCode} alt='QR Code' />
          <div className={styles.qrTextContainer}>
            <h2 className={styles.qrText}>{QR_TEXT}</h2>
            <h3 className={styles.qrSubtext}>{QR_SUBTEXT}</h3>
          </div>
        </div>
      )}
      {buttonLink && (
        <Button
          className={wm(styles.button)}
          type={ButtonType.PRIMARY_ALT}
          text={buttonText}
          onClick={goToRoute}
          rightIcon={
            modalType === 'track-upload' ? <IconUpload /> : <IconArrow />
          }
        />
      )}
    </div>
  )
}

export const ChallengeRewardsModal = () => {
  const [modalType, _] = useModalType()
  const [isOpen, setOpen] = useModalState('ChallengeRewardsExplainer')
  const wm = useWithMobileStyle(styles.mobile)
  const onClose = () => setOpen(false)

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
      showDismissButton
      isOpen={isOpen}
      onClose={onClose}
      allowScroll
      useGradientTitle={false}
      titleClassName={wm(styles.title)}
      headerContainerClassName={styles.header}
    >
      <ChallengeRewardsBody dismissModal={onClose} />
    </ModalDrawer>
  )
}

export default ChallengeRewardsModal
