import React, { useMemo } from 'react'

import {
  Button,
  Modal,
  ButtonType,
  IconTikTokInverted,
  IconTikTok
} from '@audius/stems'
import { useDispatch, useSelector } from 'react-redux'

import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { useTikTokAuth } from 'hooks/useTikTokAuth'

import styles from './ShareSoundToTikTokModal.module.css'
import { getStatus, getIsOpen, getTrack } from './store/selectors'
import { authenticated, close, setStatus, share } from './store/slice'
import { Status } from './store/types'

enum FileRequirementError {
  MIN_LENGTH,
  MAX_LENGTH
}

const messages = {
  completeButton: 'Done',
  confirmation: 'Are you sure you want to share "[Track Name]" to TikTok?',
  error: 'Something went wrong, please try again',
  errorMaxLength: 'Maximum Length for TikTok Sounds is 5 Minutes',
  errorMinLength: 'Minimum Length for TikTok Sounds is 10 Seconds',
  inProgress: 'Sharing "[Track Name]" to TikTok',
  shareButton: 'Share Sound to TikTok',
  success: '"[Track Name]" has been shared to TikTok!',
  title: 'Share to TikTok'
}

const fileRequirementErrorMessages = {
  [FileRequirementError.MAX_LENGTH]: messages.errorMaxLength,
  [FileRequirementError.MIN_LENGTH]: messages.errorMinLength
}

const ShareSoundToTikTikModal = () => {
  const dispatch = useDispatch()

  const isOpen = useSelector(getIsOpen)
  const track = useSelector(getTrack)
  const status = useSelector(getStatus)

  const withTikTokAuth = useTikTokAuth({
    onError: () => dispatch(setStatus({ status: Status.SHARE_ERROR }))
  })

  const fileRequirementError: FileRequirementError | null = useMemo(() => {
    if (track) {
      if (track.duration > 300) {
        return FileRequirementError.MAX_LENGTH
      }
      if (track.duration < 10) {
        return FileRequirementError.MIN_LENGTH
      }
    }
    return null
  }, [track])

  const handleShareButtonClick = () => {
    if (track) {
      // Trigger the share process, which initially downloads the track to the client
      dispatch(share({ cid: track.cid }))

      // Trigger the authentication process
      withTikTokAuth(() => dispatch(authenticated()))
    }
  }

  const renderMessage = () => {
    const hasError =
      fileRequirementError !== null || status === Status.SHARE_ERROR

    const rawMessage =
      {
        [Status.SHARE_STARTED]: messages.inProgress,
        [Status.SHARE_SUCCESS]: messages.success,
        [Status.SHARE_ERROR]: messages.error
      }[status as Status] ?? messages.confirmation

    if (hasError) {
      const errorMessage =
        status === Status.SHARE_ERROR
          ? messages.error
          : fileRequirementErrorMessages[fileRequirementError!]

      return <div className={styles.errorMessage}>{errorMessage}</div>
    } else {
      return <div>{rawMessage.replace('[Track Name]', track?.title ?? '')}</div>
    }
  }

  const renderButton = () => {
    if (status === Status.SHARE_SUCCESS) {
      return (
        <Button
          className={styles.button}
          onClick={() => dispatch(close())}
          text={messages.completeButton}
        />
      )
    } else {
      const isButtonDisabled = fileRequirementError !== null
      return (
        <Button
          className={styles.button}
          type={isButtonDisabled ? ButtonType.DISABLED : ButtonType.PRIMARY}
          isDisabled={isButtonDisabled}
          onClick={handleShareButtonClick}
          text={
            <div className={styles.button}>
              <span>{messages.shareButton}</span>
              <IconTikTokInverted />
            </div>
          }
        />
      )
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      showTitleHeader
      showDismissButton
      title={
        <div className={styles.titleContainer}>
          <IconTikTok />
          <div>{messages.title}</div>
        </div>
      }
      onClose={() => dispatch(close())}
      allowScroll={false}
      bodyClassName={styles.modalBody}
      headerContainerClassName={styles.modalHeader}
    >
      <div className={styles.modalContent}>
        {renderMessage()}
        {status === Status.SHARE_STARTED ? <LoadingSpinner /> : renderButton()}
      </div>
    </Modal>
  )
}

export default ShareSoundToTikTikModal
