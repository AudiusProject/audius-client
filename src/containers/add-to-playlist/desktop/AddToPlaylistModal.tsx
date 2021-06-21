import React, { useState } from 'react'

import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { Modal } from '@audius/stems'
import SimpleBar from 'simplebar-react'

import { getAccountWithOwnPlaylists } from 'store/account/selectors'
import { AppState } from 'store/types'

import { getIsOpen } from '../store/selectors'
import { close } from '../store/actions'
import styles from './AddToPlaylistModal.module.css'
import SearchBar from 'components/search-bar/SearchBar'

const messages = {
  title: 'Add to Playlist',
  newPlaylist: 'New Playlist',
  searchPlaceholder: 'Find one of your playlists'
}

const AddToPlaylistModal = () => {
  const dispatch = useDispatch()

  const isOpen = useSelector(getIsOpen)
  const [searchValue, setSearchValue] = useState('')

  const account = useSelector((state: AppState) =>
    getAccountWithOwnPlaylists(state, {})
  )

  const handlePlaylistClick = (
    playlist: NonNullable<typeof account>['playlists'][1]
  ) => {
    // TODO: sk - do something
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
          <div className={styles.list}>
            {account?.playlists.map((playlist, i) => (
              <div
                key={`${playlist.playlist_name}_${i}`}
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
