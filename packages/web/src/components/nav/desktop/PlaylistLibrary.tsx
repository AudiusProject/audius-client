import React, { useCallback, useMemo } from 'react'

import cn from 'classnames'
import { isEmpty } from 'lodash'
import { useDispatch } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { Name } from 'common/models/Analytics'
import { ID } from 'common/models/Identifiers'
import {
  PlaylistLibrary as PlaylistLibraryType,
  PlaylistLibraryFolder
} from 'common/models/PlaylistLibrary'
import { SmartCollectionVariant } from 'common/models/SmartCollectionVariant'
import { FeatureFlags } from 'common/services/remote-config'
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
  renderPlaylist: (playlistId: number) => void
  renderExplorePlaylist: (playlistId: SmartCollectionVariant) => void
  renderFolder: (folder: PlaylistLibraryFolder) => void
}
/** Function component for rendering a single level of the playlist library.
 * Playlist library consists of up to two content levels (root + inside a folder) */
const LibraryContentsLevel = ({
  contents,
  renderPlaylist,
  renderExplorePlaylist,
  renderFolder
}: LibraryContentsLevelProps) => {
  return (
    <>
      {contents.map(content => {
        switch (content.type) {
          case 'explore_playlist': {
            return renderExplorePlaylist(content.playlist_id)
          }
          case 'playlist': {
            return renderPlaylist(content.playlist_id)
          }
          case 'temp_playlist': {
            return renderPlaylist(parseInt(content.playlist_id))
          }
          case 'folder':
            return renderFolder(content)
          default:
            return null
        }
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

  const renderExplorePlaylist = (playlistId: SmartCollectionVariant) => {
    const playlist = SMART_COLLECTION_MAP[playlistId]
    if (!playlist) return null
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
  const renderPlaylist = (playlistId: ID) => {
    const playlist = playlists[playlistId]
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

  /** We want to ensure that all playlists attached to the user's account show up in the library UI, even
  /* if the user's library itself does not contain some of the playlists (for example, if a write failed).
  /* This computes those playlists that are attached to the user's account but are not in the user library. */
  const playlistsNotInLibrary = useMemo(() => {
    const result = { ...playlists }
    const helpComputePlaylistsNotInLibrary = (
      libraryContentsLevel: PlaylistLibraryType['contents']
    ) => {
      libraryContentsLevel.forEach(content => {
        if (content.type === 'temp_playlist' || content.type === 'playlist') {
          const playlist = playlists[Number(content.playlist_id)]
          if (playlist) {
            delete result[Number(content.playlist_id)]
          }
        } else if (content.type === 'folder') {
          helpComputePlaylistsNotInLibrary(content.contents)
        }
      })
    }

    if (library && playlists) {
      helpComputePlaylistsNotInLibrary(library.contents)
    }
    return result
  }, [library, playlists])

  /** Iterate over playlist library and render out available explore/smart
  /* playlists and ordered playlists. Remaining playlists that are unordered
  /* are rendered afterwards by sort order. */
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
          contents={library.contents || []}
          renderPlaylist={renderPlaylist}
          renderExplorePlaylist={renderExplorePlaylist}
          renderFolder={renderFolder}
        />
      ) : null}
      {Object.values(playlistsNotInLibrary).map(playlist => {
        return renderPlaylist(playlist.id)
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
