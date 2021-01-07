import React, { useState } from 'react'
import { connect } from 'react-redux'
import { AppState } from 'store/types'
import { Dispatch } from 'redux'
import CreatePlaylistModal from 'components/create-playlist/CreatePlaylistModal'
import DeleteConfirmationModal from 'components/delete-confirmation/DeleteConfirmationModal'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import {
  getIsOpen,
  getCollectionId
} from 'store/application/ui/editPlaylistModal/selectors'
import { getCollectionWithUser } from 'store/cache/collections/selectors'
import { close } from 'store/application/ui/editPlaylistModal/slice'
import { editPlaylist, deletePlaylist } from 'store/cache/collections/actions'
import { ID } from 'models/common/Identifiers'
import { push as pushRoute } from 'connected-react-router'
import { FEED_PAGE, playlistPage } from 'utils/route'
import zIndex from 'utils/zIndex'

const messages = {
  edit: 'EDIT',
  delete: 'DELETE',
  title: {
    playlist: 'PLAYLIST',
    album: 'ALBUM'
  },
  type: {
    playlist: 'Playlist',
    album: 'Album'
  }
}

type OwnProps = {}
type EditPlaylistModalProps = OwnProps &
  RouteComponentProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const EditPlaylistModal = ({
  isOpen,
  collection,
  location,
  onClose,
  editPlaylist,
  deletePlaylist,
  goToRoute
}: EditPlaylistModalProps) => {
  const {
    playlist_id: playlistId,
    is_album: isAlbum,
    playlist_name: title,
    user
  } = collection || {}
  const { handle } = user || {}
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const onClickDelete = () => setShowDeleteConfirmation(true)
  const onCancelDelete = () => setShowDeleteConfirmation(false)
  const onDelete = () => {
    setShowDeleteConfirmation(false)
    onClose()
    deletePlaylist(playlistId!)
    const playlistRoute = playlistPage(handle, title, playlistId!)
    // If on the playlist page, direct user to feed
    if (location.pathname === playlistRoute) goToRoute(FEED_PAGE)
  }
  const onSaveEdit = (formFields: any) => {
    editPlaylist(playlistId!, formFields)
    onClose()
  }

  if (!collection) return null
  return (
    <>
      <CreatePlaylistModal
        key={playlistId}
        title={`${messages.edit} ${
          isAlbum ? messages.title.album : messages.title.playlist
        }`}
        isAlbum={isAlbum}
        visible={isOpen}
        metadata={collection}
        editMode
        onDelete={onClickDelete}
        onSave={onSaveEdit}
        onCancel={onClose}
        zIndex={zIndex.EDIT_PLAYLIST_MODAL}
      />
      <DeleteConfirmationModal
        title={`${messages.delete} ${
          isAlbum ? messages.title.album : messages.title.playlist
        }`}
        entity={isAlbum ? messages.type.album : messages.type.playlist}
        visible={showDeleteConfirmation}
        onDelete={onDelete}
        onCancel={onCancelDelete}
      />
    </>
  )
}

const mapStateToProps = (state: AppState) => {
  const collectionId = getCollectionId(state)
  return {
    isOpen: getIsOpen(state),
    collection: getCollectionWithUser(state, { id: collectionId || undefined })
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onClose: () => dispatch(close()),
  goToRoute: (route: string) => dispatch(pushRoute(route)),
  editPlaylist: (playlistId: ID, formFields: any) =>
    dispatch(editPlaylist(playlistId, formFields)),
  deletePlaylist: (playlistId: ID) => dispatch(deletePlaylist(playlistId))
})

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EditPlaylistModal)
)
