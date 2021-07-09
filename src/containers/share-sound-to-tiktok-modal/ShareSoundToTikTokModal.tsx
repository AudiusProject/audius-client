import React from 'react'

import { Button, Modal } from '@audius/stems'
import { useDispatch, useSelector } from 'react-redux'

import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { useTikTokAuth } from 'hooks/useTikTokAuth'

import styles from './ShareSoundToTikTokModal.module.css'
import { authenticated, close, setStatus, share } from './store/actions'
import { Status } from './store/reducer'
import {
  getStatus,
  getIsOpen,
  getTrackCid,
  getTrackId,
  getTrackTitle
} from './store/selectors'

enum FileRequirementError {
  MAX_FILESIZE,
  MIN_LENGTH,
  MAX_LENGTH
}

const messages = {
  completeButton: 'Done',
  confirmation: 'Are you sure you want to share "[Track Name]" to TikTok?',
  error: 'Something went wrong, please try again',
  errorMaxFilesize: 'Maximum TikTok Filesize Exceeded',
  errorMaxLength: 'Maximum Length for TikTok Sounds is 5 Minutes',
  errorMinLength: 'Minimum Length for TikTok Sounds is 10 Seconds',
  inProgress: 'Sharing "[Track Name]" to TikTok',
  shareButton: 'Share Sound to TikTok',
  success: '"[Track Name]" has been shared to TikTok!',
  title: 'Share to TikTok'
}

const fileRequirementErrorMessages = {
  [FileRequirementError.MAX_FILESIZE]: messages.errorMaxFilesize,
  [FileRequirementError.MAX_LENGTH]: messages.errorMaxLength,
  [FileRequirementError.MIN_LENGTH]: messages.errorMinLength
}

const ShareSoundToTikTikModal = () => {
  const dispatch = useDispatch()
  const isOpen = useSelector(getIsOpen)
  // TODO: Might use trackId for analytics
  const trackId = useSelector(getTrackId)
  const trackCid = useSelector(getTrackCid)
  const trackTitle = useSelector(getTrackTitle)
  const status = useSelector(getStatus)

  const withTikTokAuth = useTikTokAuth({
    onError: () => dispatch(setStatus(Status.SHARE_ERROR))
  })

  const fileRequirementErrors: FileRequirementError[] = []

  // Fetch track data
  // Check requirements

  return (
    <Modal
      isOpen={isOpen}
      showTitleHeader
      showDismissButton
      title={messages.title}
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

  function handleShareButtonClick() {
    if (trackId && trackCid) {
      // Trigger the share process, which initially downloads the track to the client
      dispatch(share(trackId, trackCid))

      // Trigger the authentication process
      withTikTokAuth(() => dispatch(authenticated()))
    }
  }

  function renderMessage() {
    const hasError =
      fileRequirementErrors.length || status === Status.SHARE_ERROR

    const rawMessage =
      {
        [Status.SHARE_STARTED]: messages.inProgress,
        [Status.SHARE_SUCCESS]: messages.success,
        [Status.SHARE_ERROR]: messages.error
      }[status as Status] ?? messages.confirmation

    if (hasError) {
      const errorMessages =
        status === Status.SHARE_ERROR
          ? [messages.error]
          : fileRequirementErrors.map(e => fileRequirementErrorMessages[e])

      return errorMessages.map(em => (
        <div className={styles.errorMessages} key={em}>
          {em}
        </div>
      ))
    } else {
      return <div>{rawMessage.replace('[Track Name]', trackTitle ?? '')}</div>
    }
  }

  function renderButton() {
    if (status === Status.SHARE_SUCCESS) {
      return (
        <Button
          className={styles.button}
          onClick={() => dispatch(close())}
          text={messages.completeButton}
        />
      )
    } else {
      return (
        <Button
          className={styles.button}
          isDisabled={fileRequirementErrors.length > 0}
          onClick={handleShareButtonClick}
          text={messages.shareButton}
        />
      )
    }
  }
}

export default ShareSoundToTikTikModal
