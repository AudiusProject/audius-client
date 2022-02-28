import React, { useCallback, useState } from 'react'

import {
  IconCaretRight,
  IconFolder,
  IconKebabHorizontal,
  IconFolderOutline
} from '@audius/stems'
import cn from 'classnames'
import { isEmpty } from 'lodash'
import { useDispatch } from 'react-redux'
import { NavLink, NavLinkProps } from 'react-router-dom'

import { useModalState } from 'common/hooks/useModalState'
import { Name } from 'common/models/Analytics'
import { SmartCollection } from 'common/models/Collection'
import { ID } from 'common/models/Identifiers'
import { PlaylistLibraryFolder } from 'common/models/PlaylistLibrary'
import { SmartCollectionVariant } from 'common/models/SmartCollectionVariant'
import { AccountCollection } from 'common/store/account/reducer'
import {
  getAccountNavigationPlaylists,
  getAccountUser,
  getPlaylistLibrary
} from 'common/store/account/selectors'
import { addTrackToPlaylist } from 'common/store/cache/collections/actions'
import Draggable from 'components/dragndrop/Draggable'
import Droppable from 'components/dragndrop/Droppable'
import IconButton from 'components/icon-button/IconButton'
import { getPlaylistUpdates } from 'components/notification/store/selectors'
import Tooltip from 'components/tooltip/Tooltip'
import UpdateDot from 'components/update-dot/UpdateDot'
import { useArePlaylistUpdatesEnabled } from 'hooks/useRemoteConfig'
import { SMART_COLLECTION_MAP } from 'pages/smart-collection/smartCollections'
import { make, useRecord } from 'store/analytics/actions'
import { setFolderId as setEditFolderModalFolderId } from 'store/application/ui/editFolderModal/slice'
import { open as openEditPlaylistModal } from 'store/application/ui/editPlaylistModal/slice'
import { getIsDragging } from 'store/dragndrop/selectors'
import { reorderPlaylistLibrary } from 'store/playlist-library/helpers'
import { update } from 'store/playlist-library/slice'
import { useSelector } from 'utils/reducer'
import { playlistPage, getPathname } from 'utils/route'

import navColumnStyles from './NavColumn.module.css'
import styles from './PlaylistLibrary.module.css'

type PlaylistNavLinkProps = NavLinkProps & {
  droppableKey: ID | SmartCollectionVariant
  playlistId: ID | SmartCollectionVariant
  name: string
  onReorder: (
    draggingId: ID | SmartCollectionVariant,
    droppingId: ID | SmartCollectionVariant
  ) => void
  link?: string
}

type PlaylistFolderNavButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  onReorder: () => void
}

const PlaylistNavLink = ({
  droppableKey,
  playlistId,
  name,
  link,
  onReorder,
  children,
  className,
  ...navLinkProps
}: PlaylistNavLinkProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const onDrag = useCallback(() => {
    setIsDragging(true)
  }, [setIsDragging])
  const onDrop = useCallback(() => {
    setIsDragging(false)
  }, [setIsDragging])
  return (
    <Droppable
      key={droppableKey}
      className={styles.droppable}
      hoverClassName={styles.droppableHover}
      onDrop={(id: ID | SmartCollectionVariant) => onReorder(id, playlistId)}
      acceptedKinds={['library-playlist']}
    >
      <Draggable
        id={playlistId}
        text={name}
        link={link}
        kind='library-playlist'
        onDrag={onDrag}
        onDrop={onDrop}
      >
        <NavLink
          {...navLinkProps}
          draggable={false}
          className={cn(className, styles.navLink, {
            [styles.dragging]: isDragging
          })}
        >
          {children}
        </NavLink>
      </Draggable>
    </Droppable>
  )
}

const FolderNavLink = ({
  id,
  name,
  onReorder,
  children,
  className,
  ...buttonProps
}: PlaylistFolderNavButtonProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const onDrag = useCallback(() => {
    setIsDragging(true)
  }, [setIsDragging])
  const onDrop = useCallback(() => {
    setIsDragging(false)
  }, [setIsDragging])

  return (
    <Droppable
      key={id}
      className={styles.droppable}
      hoverClassName={styles.droppableHover}
      onDrop={(id: ID | SmartCollectionVariant) => onReorder()}
      acceptedKinds={['library-playlist', 'playlist-folder']}
    >
      <Draggable
        id={id}
        text={name}
        kind='playlist-folder'
        onDrag={onDrag}
        onDrop={onDrop}
      >
        <button
          {...buttonProps}
          draggable={false}
          className={cn(className, styles.folderButton, styles.navLink, {
            [styles.dragging]: isDragging
          })}
        >
          {children}
        </button>
      </Draggable>
    </Droppable>
  )
}

const PlaylistFolderNavItem = ({
  folder,
  hasUpdate = false,
  dragging,
  draggingKind,
  onClickEdit
}: {
  folder: PlaylistLibraryFolder
  hasUpdate: boolean
  dragging: boolean
  draggingKind: string
  onClickEdit: (folderId: string) => void
}) => {
  const { id, name, contents } = folder
  const isDroppableKind =
    draggingKind === 'track' ||
    draggingKind === 'playlist' ||
    draggingKind === 'playlist-folder'
  const [isHovering, setIsHovering] = useState(false)

  return (
    <Droppable
      key={id}
      className={navColumnStyles.droppable}
      hoverClassName={navColumnStyles.droppableHover}
      onDrop={() => {}}
      acceptedKinds={['library-playlist']}
    >
      <FolderNavLink
        onMouseEnter={() => {
          setIsHovering(true)
        }}
        onMouseLeave={() => setIsHovering(false)}
        id={id}
        name={name}
        onReorder={() => {}}
        className={cn(navColumnStyles.link, {
          [navColumnStyles.droppableLink]: dragging && isDroppableKind,
          [navColumnStyles.disabledLink]:
            dragging && !isDroppableKind && draggingKind !== 'library-playlist'
        })}
        onClick={() => {}}
      >
        <div className={styles.folderButtonContentContainer}>
          {isEmpty(contents) ? (
            <IconFolderOutline
              width={12}
              height={12}
              className={styles.iconFolder}
            />
          ) : (
            <IconFolder
              width={12}
              height={12}
              className={cn(styles.iconFolder, {
                [styles.iconFolderUpdated]: hasUpdate
              })}
            />
          )}
          <div className={styles.folderNameContainer}>
            <span>{name}</span>
          </div>
          <IconCaretRight height={11} width={11} className={styles.iconCaret} />
          <IconButton
            className={cn(styles.iconKebabHorizontal, {
              [styles.hidden]: !isHovering || dragging
            })}
            icon={<IconKebabHorizontal height={11} width={11} />}
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              onClickEdit(id)
            }}
          />
        </div>
      </FolderNavLink>

      {/* Loop over contents and render playlist list */}
    </Droppable>
  )
}

type PlaylistNavItemProps = {
  playlist: AccountCollection
  url: string
  addTrack: (trackId: ID) => void
  isOwner: boolean
  onReorder: (
    draggingId: ID | SmartCollectionVariant,
    droppingId: ID | SmartCollectionVariant
  ) => void
  hasUpdate?: boolean
  dragging: boolean
  draggingKind: string
  onClickPlaylist: (id: ID, hasUpdate: boolean) => void
  onClickEdit?: (id: ID) => void
}
const PlaylistNavItem = ({
  playlist,
  hasUpdate = false,
  url,
  addTrack,
  isOwner,
  onReorder,
  dragging,
  draggingKind,
  onClickPlaylist,
  onClickEdit
}: PlaylistNavItemProps) => {
  const { id, name } = playlist
  const [isHovering, setIsHovering] = useState(false)

  return (
    <Droppable
      key={id}
      className={navColumnStyles.droppable}
      hoverClassName={navColumnStyles.droppableHover}
      onDrop={addTrack}
      acceptedKinds={['track']}
      disabled={!isOwner}
    >
      <PlaylistNavLink
        droppableKey={id}
        playlistId={id}
        name={name}
        link={url}
        to={url}
        onReorder={onReorder}
        isActive={() => url === getPathname()}
        activeClassName='active'
        className={cn(navColumnStyles.link, {
          [navColumnStyles.playlistUpdate]: hasUpdate,
          [navColumnStyles.droppableLink]:
            isOwner &&
            dragging &&
            (draggingKind === 'track' || draggingKind === 'playlist'),
          [navColumnStyles.disabledLink]:
            dragging &&
            ((draggingKind !== 'track' &&
              draggingKind !== 'playlist' &&
              draggingKind !== 'library-playlist') ||
              !isOwner)
        })}
        onClick={() => onClickPlaylist(id, hasUpdate)}
        onMouseEnter={() => {
          setIsHovering(true)
        }}
        onMouseLeave={() => setIsHovering(false)}
      >
        {hasUpdate ? (
          <div className={navColumnStyles.updateDotContainer}>
            <Tooltip
              className={navColumnStyles.updateDotTooltip}
              shouldWrapContent={true}
              shouldDismissOnClick={false}
              mount={null}
              mouseEnterDelay={0.1}
              text='Recently Updated'
            >
              <div>
                <UpdateDot />
              </div>
            </Tooltip>
            <span>{name}</span>
            {!isOwner || !onClickEdit ? null : (
              <IconButton
                className={cn(styles.iconKebabHorizontal, {
                  [styles.hidden]: !isHovering || dragging
                })}
                icon={<IconKebabHorizontal height={11} width={11} />}
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  onClickEdit(id)
                }}
              />
            )}
          </div>
        ) : (
          <span>{name}</span>
        )}
      </PlaylistNavLink>
    </Droppable>
  )
}

type PlaylistLibraryProps = {
  onClickNavLinkWithAccount: () => void
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
    },
    [dispatch, library]
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

  const onClick = useCallback(
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
        onClickPlaylist={onClick}
        onClickEdit={isOwner ? handleClickEditPlaylist : undefined}
      />
    )
  }

  // Iterate over playlist library and render out available explore/smart
  // playlists and ordered playlists. Remaining playlists that are unordered
  // are rendered aftewards by sort order.
  const playlistsNotInLibrary = { ...playlists }
  return (
    <>
      <Droppable
        key={-1}
        className={cn(styles.droppable, styles.top)}
        hoverClassName={styles.droppableHover}
        onDrop={(id: ID | SmartCollectionVariant) => onReorder(id, -1)}
        acceptedKinds={['library-playlist']}
      />
      {account &&
        playlists &&
        library &&
        library.contents.map(content => {
          switch (content.type) {
            case 'explore_playlist': {
              const playlist = SMART_COLLECTION_MAP[content.playlist_id]
              if (!playlist) return null
              return renderExplorePlaylist(playlist)
            }
            case 'playlist': {
              const playlist = playlists[content.playlist_id]
              if (playlist) {
                delete playlistsNotInLibrary[content.playlist_id]
              }
              return renderPlaylist(playlist)
            }
            case 'temp_playlist': {
              try {
                const playlist = playlists[parseInt(content.playlist_id)]
                if (playlist) {
                  delete playlistsNotInLibrary[parseInt(content.playlist_id)]
                }
                return renderPlaylist(playlist)
              } catch (e) {
                console.debug(e)
                break
              }
            }
            case 'folder':
              return (
                <PlaylistFolderNavItem
                  key={content.id}
                  folder={content}
                  hasUpdate={false}
                  dragging={dragging}
                  draggingKind={draggingKind}
                  onClickEdit={handleClickEditFolder}
                />
              )
          }
          return null
        })}
      {Object.values(playlistsNotInLibrary).map(playlist => {
        return renderPlaylist(playlist)
      })}
      {library && isEmpty(library.contents) ? (
        <div className={cn(navColumnStyles.link, navColumnStyles.disabled)}>
          Create your first playlist!
        </div>
      ) : null}
    </>
  )
}

export default PlaylistLibrary
