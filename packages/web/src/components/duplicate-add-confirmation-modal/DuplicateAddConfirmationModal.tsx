import { useCallback, useContext } from 'react'

import {
  accountSelectors,
  cacheCollectionsActions,
  cacheCollectionsSelectors,
  duplicateAddConfirmationModalUISelectors,
  fillString
} from '@audius/common'
import {
  Button,
  ButtonType,
  Modal,
  ModalContent,
  ModalContentText,
  ModalFooter,
  ModalHeader,
  ModalTitle
} from '@audius/stems'
import { useDispatch } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { useSelector } from 'common/hooks/useSelector'
import { ToastContext } from 'components/toast/ToastContext'
import ToastLinkContent from 'components/toast/mobile/ToastLinkContent'
import { playlistPage } from 'utils/route'

import styles from './DuplicateAddConfirmationModal.module.css'

const { addTrackToPlaylist } = cacheCollectionsActions
const { getCollection } = cacheCollectionsSelectors
const { getPlaylistId, getTrackId } = duplicateAddConfirmationModalUISelectors
const { getAccountUser } = accountSelectors

const messages = {
  title: 'Already Added',
  description: 'This is already in your%0 playlist',
  cancel: "Don't Add",
  add: 'Add Anyway',
  addedToast: 'Added To Playlist!',
  view: 'View'
}

export const DuplicateAddConfirmationModal = () => {
  const dispatch = useDispatch()
  const { toast } = useContext(ToastContext)
  const playlistId = useSelector(getPlaylistId)
  const trackId = useSelector(getTrackId)
  const playlist = useSelector((state) =>
    getCollection(state, { id: playlistId })
  )
  const account = useSelector(getAccountUser)
  const [isOpen, setIsOpen] = useModalState('DuplicateAddConfirmation')

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const handleAdd = useCallback(() => {
    if (trackId && playlistId) {
      dispatch(addTrackToPlaylist(trackId, playlistId))
      if (account) {
        toast(
          <ToastLinkContent
            text={messages.addedToast}
            linkText={messages.view}
            link={playlistPage(
              account.handle,
              playlist?.playlist_name,
              playlistId
            )}
          />
        )
      } else {
        toast(messages.addedToast)
      }
    }
    onClose()
  }, [
    trackId,
    playlistId,
    onClose,
    dispatch,
    account,
    toast,
    playlist?.playlist_name
  ])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='small'>
      <ModalHeader>
        <ModalTitle title={messages.title} />
      </ModalHeader>
      <ModalContent>
        <ModalContentText>
          {fillString(
            messages.description,
            playlist ? ` "${playlist.playlist_name}"` : ''
          )}
        </ModalContentText>
      </ModalContent>
      <ModalFooter className={styles.modalFooter}>
        <Button
          textClassName={styles.modalButton}
          fullWidth
          text={messages.add}
          type={ButtonType.COMMON}
          onClick={handleAdd}
        />
        <Button
          textClassName={styles.modalButton}
          fullWidth
          text={messages.cancel}
          type={ButtonType.PRIMARY}
          onClick={onClose}
        />
      </ModalFooter>
    </Modal>
  )
}
