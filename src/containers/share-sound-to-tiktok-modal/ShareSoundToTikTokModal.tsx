import React from 'react'

import { Button, Modal } from '@audius/stems'
import { useDispatch, useSelector } from 'react-redux'

import { useTikTokAuth } from 'hooks/useTikTokAuth'

import styles from './ShareSoundToTikTokModal.module.css'
import { authenticated, close, share } from './store/actions'
import {
  getIsOpen,
  getTrackCid,
  getTrackId,
  getTrackTitle
} from './store/selectors'

const messages = {
  title: 'Share to TikTok',
  confirmation: 'Are you sure you want to share "[Track Name]" to TikTok?',
  inProgress: 'Sharing "[Track Name]" to TikTok',
  success: '"[Track Name]" has been shared to TikTok!',
  shareButton: 'Share Sound to TikTok',
  errorMinLength: 'Minimum Length for TikTok Sounds is 10 Seconds',
  errorMaxLength: 'Maximum Length for TikTok Sounds is 5 Minutes',
  errorMaxFilesize: 'Maximum TikTok Filesize Exceeded',
  completeButton: 'Done'
}

const ShareSoundToTikTikModal = () => {
  const withTikTokAuth = useTikTokAuth({ onError: console.log })
  const isOpen = useSelector(getIsOpen)
  // TODO: Might not need trackId
  const trackId = useSelector(getTrackId)
  const trackCid = useSelector(getTrackCid)
  const trackTitle = useSelector(getTrackTitle)
  const dispatch = useDispatch()

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
        {trackTitle && (
          <div>{messages.confirmation.replace('[Track Name]', trackTitle)}</div>
        )}
        <Button
          className={styles.button}
          text={messages.shareButton}
          onClick={handleShareButtonClick}
        ></Button>
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
    // Start download
  }
}

export default ShareSoundToTikTikModal
