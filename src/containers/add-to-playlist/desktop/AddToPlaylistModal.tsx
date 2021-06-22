import React, { useContext, useState } from 'react'

import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { Modal } from '@audius/stems'
import SimpleBar from 'simplebar-react'

import { ReactComponent as IconMultiselectAdd } from 'assets/img/iconMultiselectAdd.svg'
import SearchBar from 'components/search-bar/SearchBar'
import { ToastContext } from 'components/toast/ToastContext'
import { getAccountWithOwnPlaylists } from 'store/account/selectors'
import {
  addTrackToPlaylist,
  createPlaylist
} from 'store/cache/collections/actions'
import { AppState } from 'store/types'

import { getIsOpen, getTrackId, getTrackTitle } from '../store/selectors'
import { close } from '../store/actions'
import styles from './AddToPlaylistModal.module.css'
import { newCollectionMetadata } from 'schemas'

const messages = {
  title: 'Add to Playlist',
  newPlaylist: 'New Playlist',
  searchPlaceholder: 'Find one of your playlists',
  addedToast: 'Added To Playlist!',
  createdToast: 'Playlist Created!'
}

const AddToPlaylistModal = () => {
  const dispatch = useDispatch()
  const { toast } = useContext(ToastContext)

  const isOpen = useSelector(getIsOpen)
  const trackId = useSelector(getTrackId)
  const trackTitle = useSelector(getTrackTitle)
  const [searchValue, setSearchValue] = useState('')

  const account = useSelector((state: AppState) =>
    getAccountWithOwnPlaylists(state, {})
  )

  const handlePlaylistClick = (
    playlist: NonNullable<typeof account>['playlists'][1]
  ) => {
    dispatch(addTrackToPlaylist(trackId, playlist.playlist_id))
    toast(messages.addedToast)
    dispatch(close())
  }

  const handleCreatePlaylist = () => {
    const metadata = newCollectionMetadata({
      playlist_name: trackTitle,
      is_private: false
    })
    const tempId = `${Date.now()}`
    dispatch(createPlaylist(tempId, metadata, trackId))
    dispatch(addTrackToPlaylist(trackId, tempId))
    toast(messages.addedToast)
    dispatch(close())
  }

  return (
    <Modal
      isOpen={isOpen}
      showTitleHeader
      showDismissButton
      title={messages.title}
      onClose={() => dispatch(close())}
      allowScroll={false}
      bodyClassName={styles.modalBody}
    >
      <SimpleBar className={styles.simpleBar}>
        <div className={styles.listContent}>
          <SearchBar
            className={styles.searchBar}
            iconClassname={styles.searchIcon}
            open
            value={searchValue}
            onSearch={setSearchValue}
            onOpen={() => {}}
            onClose={() => {}}
            placeholder={messages.searchPlaceholder}
            shouldAutoFocus={false}
          />
          <div className={cn(styles.listItem)} onClick={handleCreatePlaylist}>
            <IconMultiselectAdd className={styles.add} />
            <span>{messages.newPlaylist}</span>
          </div>
          <div className={styles.list}>
            {account?.playlists.map((playlist, i) => (
              <div
                key={`${playlist.playlist_id}`}
                className={cn(styles.listItem)}
                onClick={() => handlePlaylistClick(playlist)}
              >
                {playlist.playlist_name}
              </div>
            ))}
          </div>
        </div>
      </SimpleBar>
    </Modal>
  )
}

export default AddToPlaylistModal
