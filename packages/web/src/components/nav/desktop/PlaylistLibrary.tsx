import React, { useCallback, useMemo } from 'react'

import cn from 'classnames'
import { isEmpty } from 'lodash'
import { useDispatch } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { Name } from 'common/models/Analytics'
import { SmartCollection } from 'common/models/Collection'
import { ID } from 'common/models/Identifiers'
import {
  PlaylistLibrary as PlaylistLibraryType,
  PlaylistLibraryFolder
} from 'common/models/PlaylistLibrary'
import { SmartCollectionVariant } from 'common/models/SmartCollectionVariant'
import { FeatureFlags } from 'common/services/remote-config'
import { AccountCollection } from 'common/store/account/reducer'
import {
  getAccountNavigationPlaylists,
  getAccountUser,
  getPlaylistLibrary
} from 'common/store/account/selectors'
import { addTrackToPlaylist } from 'common/store/cache/collections/actions'
import Droppable from 'components/dragndrop/Droppable'
import { getPlaylistUpdates } from 'components/notification/store/selectors'
import { useArePlaylistUpdatesEnabled, useFlag } from 'hooks/useRemoteConfig'
import { SMART_COLLECTION_MAP } from 'pages/smart-collection/smartCollections'
import { make, useRecord } from 'store/analytics/actions'
import { setFolderId as setEditFolderModalFolderId } from 'store/application/ui/editFolderModal/slice'
import { open as openEditPlaylistModal } from 'store/application/ui/editPlaylistModal/slice'
import { getIsDragging } from 'store/dragndrop/selectors'
import {
  containsTempPlaylist,
  reorderPlaylistLibrary
} from 'store/playlist-library/helpers'
import { update } from 'store/playlist-library/slice'
import { useSelector } from 'utils/reducer'
import { getPathname, playlistPage } from 'utils/route'

import navColumnStyles from './NavColumn.module.css'
import { PlaylistFolderNavItem } from './PlaylistFolderNavItem'
import styles from './PlaylistLibrary.module.css'
import { PlaylistNavItem, PlaylistNavLink } from './PlaylistNavItem'

type PlaylistLibraryProps = {
  onClickNavLinkWithAccount: () => void
}

type LibraryContentsLevelProps = {
  contents: PlaylistLibraryType['contents']
  playlists: { [id: number]: AccountCollection }
  renderPlaylist: (playlist: AccountCollection) => void
  renderExplorePlaylist: (playlist: SmartCollection) => void
  renderFolder: (folder: PlaylistLibraryFolder) => void
}

// Function component for rendering a single level of the playlist library. Playlist library consists of up to two content levels (root + inside a folder)
const LibraryContentsLevel = ({
  contents,
  playlists,
  renderPlaylist,
  renderExplorePlaylist,
  renderFolder
}: LibraryContentsLevelProps) => {
  return (
    <>
      {contents.map(content => {
        switch (content.type) {
          case 'explore_playlist': {
            const playlist = SMART_COLLECTION_MAP[content.playlist_id]
            if (!playlist) return null
            return renderExplorePlaylist(playlist)
          }
          case 'playlist': {
            const playlist = playlists[content.playlist_id]
            return renderPlaylist(playlist)
          }
          case 'temp_playlist': {
            try {
              const playlist = playlists[parseInt(content.playlist_id)]
              return renderPlaylist(playlist)
            } catch (e) {
              console.debug(e)
              break
            }
          }
          case 'folder':
            return renderFolder(content)
        }
        return null
      })}
    </>
  )
}

const PlaylistLibrary = ({
  onClickNavLinkWithAccount
}: PlaylistLibraryProps) => {
  const account = useSelector(getAccountUser)
  const playlists = useSelector(getAccountNavigationPlaylists)
  const library = useSelector(getPlaylistLibrary)
  const updates = useSelector(getPlaylistUpdates)
  const { dragging, kind: draggingKind } = useSelector(getIsDragging)
  const dispatch = useDispatch()
  const {
    isEnabled: arePlaylistUpdatesEnabled
  } = useArePlaylistUpdatesEnabled()
  const { isEnabled: isPlaylistFoldersEnabled } = useFlag(
    FeatureFlags.PLAYLIST_FOLDERS
  )
  const record = useRecord()
  const [, setIsEditFolderModalOpen] = useModalState('EditFolder')

  const handleClickEditFolder = useCallback(
    folderId => {
      dispatch(setEditFolderModalFolderId(folderId))
      setIsEditFolderModalOpen(true)
    },
    [dispatch, setIsEditFolderModalOpen]
  )

  const handleClickEditPlaylist = useCallback(
    playlistId => {
      dispatch(openEditPlaylistModal(playlistId))
    },
    [dispatch]
  )

  const onReorder = useCallback(
    (
      draggingId: ID | SmartCollectionVariant,
      droppingId: ID | SmartCollectionVariant
    ) => {
      if (!library) return
      const newLibrary = reorderPlaylistLibrary(library, draggingId, droppingId)
      dispatch(update({ playlistLibrary: newLibrary }))
      record(
        make(Name.PLAYLIST_LIBRARY_REORDER, {
          containsTemporaryPlaylists: containsTempPlaylist(newLibrary)
        })
      )
    },
    [dispatch, library, record]
  )

  const renderExplorePlaylist = (playlist: SmartCollection) => {
    const name = playlist.playlist_name
    const url = playlist.link
    return (
      <PlaylistNavLink
        key={playlist.link}
        playlistId={name as SmartCollectionVariant}
        droppableKey={name as SmartCollectionVariant}
        name={name}
        to={url}
        onReorder={onReorder}
        isActive={() => url === getPathname()}
        activeClassName='active'
        onClick={onClickNavLinkWithAccount}
        className={cn(navColumnStyles.link, {
          [navColumnStyles.disabledLink]:
            !account || (dragging && draggingKind !== 'library-playlist')
        })}
      >
        {name}
      </PlaylistNavLink>
    )
  }

  const onClickPlaylist = useCallback(
    (playlistId: ID, hasUpdate: boolean) => {
      onClickNavLinkWithAccount()
      record(
        make(Name.PLAYLIST_LIBRARY_CLICKED, {
          playlistId,
          hasUpdate
        })
      )
    },
    [record, onClickNavLinkWithAccount]
  )
  const renderPlaylist = (playlist: AccountCollection) => {
    if (!account || !playlist) return null
    const { id, name } = playlist
    const url = playlistPage(playlist.user.handle, name, id)
    const addTrack = (trackId: ID) => dispatch(addTrackToPlaylist(trackId, id))
    const isOwner = playlist.user.handle === account.handle
    const hasUpdate = updates.includes(id)
    return (
      <PlaylistNavItem
        key={id}
        playlist={playlist}
        hasUpdate={Boolean(arePlaylistUpdatesEnabled) && hasUpdate}
        url={url}
        addTrack={addTrack}
        isOwner={isOwner}
        onReorder={onReorder}
        dragging={dragging}
        draggingKind={draggingKind}
        onClickPlaylist={onClickPlaylist}
        onClickEdit={
          isOwner && isPlaylistFoldersEnabled
            ? handleClickEditPlaylist
            : undefined
        }
      />
    )
  }

  const renderFolder = (folder: PlaylistLibraryFolder) => {
    return (
      <PlaylistFolderNavItem
        key={folder.id}
        folder={folder}
        hasUpdate={false}
        dragging={dragging}
        draggingKind={draggingKind}
        onClickEdit={handleClickEditFolder}
      >
        {isEmpty(folder.contents) ? null : (
          <div className={styles.folderContentsContainer}>
            <LibraryContentsLevel
              playlists={playlists}
              contents={folder.contents}
              renderPlaylist={renderPlaylist}
              renderExplorePlaylist={renderExplorePlaylist}
              renderFolder={renderFolder}
            />
          </div>
        )}
      </PlaylistFolderNavItem>
    )
  }

  const playlistsNotInLibrary = useMemo(() => {
    const result = { ...playlists }
    if (library && playlists) {
      library.contents.forEach(content => {
        if (content.type === 'temp_playlist') {
          const playlist = playlists[parseInt(content.playlist_id)]
          if (playlist) {
            delete result[parseInt(content.playlist_id)]
          }
        } else if (content.type === 'playlist') {
          const playlist = playlists[content.playlist_id]
          if (playlist) {
            delete result[content.playlist_id]
          }
        }
      })
    }
    return result
  }, [library, playlists])

  // Iterate over playlist library and render out available explore/smart
  // playlists and ordered playlists. Remaining playlists that are unordered
  // are rendered aftewards by sort order.
  return (
    <>
      <Droppable
        key={-1}
        className={cn(styles.droppable, styles.top)}
        hoverClassName={styles.droppableHover}
        onDrop={(id: ID | SmartCollectionVariant) => onReorder(id, -1)}
        acceptedKinds={['library-playlist']}
      />
      {account && playlists && library ? (
        <LibraryContentsLevel
          playlists={playlists}
          contents={library.contents || []}
          renderPlaylist={renderPlaylist}
          renderExplorePlaylist={renderExplorePlaylist}
          renderFolder={renderFolder}
        />
      ) : null}
      {Object.values(playlistsNotInLibrary).map(playlist => {
        return renderPlaylist(playlist)
      })}
      {isEmpty(library?.contents) ? (
        <div className={cn(navColumnStyles.link, navColumnStyles.disabled)}>
          Create your first playlist!
        </div>
      ) : null}
    </>
  )
}

export default PlaylistLibrary
