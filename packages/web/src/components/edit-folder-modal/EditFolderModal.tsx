import React, { useCallback, useState } from 'react'

import {
  IconFolder,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle
} from '@audius/stems'
import { useDispatch } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { PlaylistLibraryFolder } from 'common/models/PlaylistLibrary'
import { getPlaylistLibrary } from 'common/store/account/selectors'
import FolderForm from 'components/create-playlist/FolderForm'
import DeleteConfirmationModal from 'components/delete-confirmation/DeleteConfirmationModal'
import { getFolderId } from 'store/application/ui/editFolderModal/selectors'
import { setFolderId } from 'store/application/ui/editFolderModal/slice'
import {
  removePlaylistFolderInLibrary,
  renamePlaylistFolderInLibrary
} from 'store/playlist-library/helpers'
import { update as updatePlaylistLibrary } from 'store/playlist-library/slice'
import { useSelector } from 'utils/reducer'
import { zIndex } from 'utils/zIndex'

import styles from './EditFolderModal.module.css'

const messages = {
  editFolderModalTitle: 'Edit Folder',
  confirmDeleteFolderModalTitle: 'Delete Folder',
  folderEntity: 'Folder'
}

const EditFolderModal = () => {
  const folderId = useSelector(getFolderId)
  const playlistLibrary = useSelector(getPlaylistLibrary)
  const [isOpen, setIsOpen] = useModalState('EditFolder')
  const folder =
    playlistLibrary == null || folderId == null
      ? null
      : (playlistLibrary.contents.find(
          item => item.type === 'folder' && item.id === folderId
        ) as PlaylistLibraryFolder | undefined)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const onCancelDelete = () => setShowDeleteConfirmation(false)

  const dispatch = useDispatch()

  const handleClose = useCallback(() => {
    dispatch(setFolderId(null))
    setIsOpen(false)
  }, [dispatch, setIsOpen])

  const handleSubmit = useCallback(
    (newName: string) => {
      const infoIsEmpty =
        playlistLibrary == null || folderId == null || folder == null
      if (!infoIsEmpty && newName !== folder.name) {
        const newLibrary = renamePlaylistFolderInLibrary(
          playlistLibrary,
          folderId,
          newName
        )
        dispatch(updatePlaylistLibrary({ playlistLibrary: newLibrary }))
      }
      handleClose()
    },
    [dispatch, folder, folderId, handleClose, playlistLibrary]
  )

  const handleClickDelete = useCallback(() => {
    setShowDeleteConfirmation(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    const infoIsEmpty =
      playlistLibrary == null || folderId == null || folder == null
    if (!infoIsEmpty) {
      const newLibrary = removePlaylistFolderInLibrary(
        playlistLibrary,
        folderId
      )
      setShowDeleteConfirmation(false)
      dispatch(updatePlaylistLibrary({ playlistLibrary: newLibrary }))
    }
    handleClose()
  }, [dispatch, folder, folderId, handleClose, playlistLibrary])

  return (
    <>
      <Modal
        modalKey='editfolder'
        isOpen={isOpen}
        onClose={handleClose}
        zIndex={zIndex.CREATE_PLAYLIST_MODAL}
        bodyClassName={styles.modalBody}
      >
        <ModalHeader onClose={handleClose}>
          <ModalTitle
            icon={<IconFolder />}
            title={messages.editFolderModalTitle}
          />
        </ModalHeader>
        <ModalContent>
          <FolderForm
            isEditMode
            onSubmit={handleSubmit}
            onCancel={handleClose}
            onDelete={handleClickDelete}
            initialFolderName={folder?.name}
          />
        </ModalContent>
      </Modal>
      <DeleteConfirmationModal
        title={messages.confirmDeleteFolderModalTitle}
        entity={messages.folderEntity}
        visible={showDeleteConfirmation}
        onDelete={handleConfirmDelete}
        onCancel={onCancelDelete}
      />
    </>
  )
}

export default EditFolderModal
