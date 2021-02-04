import React, { useCallback, useState, useEffect, useRef } from 'react'
import { Modal, Button, ButtonSize, ButtonType } from '@audius/stems'
import { debounce } from 'lodash'

import Input from 'components/data-entry/Input'
import Track from 'models/Track'
import User from 'models/User'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { useTrackCoverArt } from 'hooks/useImageSize'
import { SquareSizes } from 'models/common/ImageSizes'

import styles from './RemixSettingsModal.module.css'
import { withNullGuard } from 'utils/withNullGuard'
import { ID } from 'models/common/Identifiers'
import { fullTrackPage } from 'utils/route'
import UserBadges from 'containers/user-badges/UserBadges'

const INPUT_DEBOUNCE_MS = 1000

const messages = {
  done: 'DONE',
  title: 'REMIX SETTINGS',
  subtitle: 'Specify what track you remixed here',
  remixOf: 'This is a Remix of: (Paste Audius Track URL)',
  error: 'Please paste a valid Audius track URL',
  by: 'by'
}

type TrackInfoProps = {
  track: Track | null
  user: User | null
}

const g = withNullGuard(
  ({ track, user, ...p }: TrackInfoProps) =>
    track && user && { ...p, track, user }
)

const TrackInfo = g(({ track, user }) => {
  const image = useTrackCoverArt(
    track.track_id,
    track._cover_art_sizes,
    SquareSizes.SIZE_150_BY_150
  )
  return (
    <div className={styles.track}>
      <DynamicImage wrapperClassName={styles.artwork} image={image} />
      {track.title}
      <div className={styles.by}>{messages.by}</div>
      <div className={styles.artistName}>
        {user.name}
        <UserBadges
          className={styles.iconVerified}
          userId={user.user_id}
          badgeSize={8}
        />
      </div>
    </div>
  )
})

type RemixSettingsModalProps = {
  isOpen: boolean
  onClose: (trackId: ID | null) => void
  onEditUrl: (url: string) => void
  isInvalidTrack: boolean
  track: Track | null
  user: User | null
}

const RemixSettingsModal = ({
  isOpen,
  onClose,
  onEditUrl,
  track,
  user,
  isInvalidTrack
}: RemixSettingsModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (url === null && track && user && isOpen) {
      setUrl(fullTrackPage(user.handle, track.title, track.track_id))
    }
  }, [isOpen, track, user, url, setUrl])

  useEffect(() => {
    if (!isOpen) setUrl(null)
  }, [isOpen])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, inputRef])

  const onChange = useCallback(
    (url: string) => {
      setUrl(url)
      debounce(() => onEditUrl(url), INPUT_DEBOUNCE_MS, {
        leading: true,
        trailing: false
      })()
    },
    [onEditUrl, setUrl]
  )

  const onCloseModal = useCallback(() => {
    const trackId = url && track && !isInvalidTrack ? track.track_id : null
    onClose(trackId)
  }, [onClose, track, isInvalidTrack, url])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCloseModal}
      showTitleHeader
      title={messages.title}
      subtitle={messages.subtitle}
      dismissOnClickOutside
      showDismissButton
      // Since this can be nested in the edit track modal
      // Appear on top of it
      zIndex={1002}
      bodyClassName={styles.modalContainer}
      headerContainerClassName={styles.modalHeader}
      titleClassName={styles.modalTitle}
      subtitleClassName={styles.modalSubtitle}
    >
      <div className={styles.content}>
        <div className={styles.info}>{messages.remixOf}</div>
        <Input
          inputRef={inputRef}
          value={url}
          placeholder=''
          size='small'
          onChange={onChange}
        />
        {url && (
          <div className={styles.bottom}>
            {isInvalidTrack ? (
              <div className={styles.error}>{messages.error}</div>
            ) : (
              <TrackInfo user={user} track={track} />
            )}
          </div>
        )}
      </div>
      <Button
        className={styles.doneButton}
        text={messages.done}
        size={ButtonSize.TINY}
        type={ButtonType.SECONDARY}
        onClick={onCloseModal}
      />
    </Modal>
  )
}

export default RemixSettingsModal
