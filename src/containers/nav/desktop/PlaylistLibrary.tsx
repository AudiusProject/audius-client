import React, { useCallback, useState } from 'react'
import { NavLink, NavLinkProps } from 'react-router-dom'
import cn from 'classnames'

import {
  getAccountNavigationPlaylists,
  getAccountUser,
  getPlaylistLibrary
} from 'store/account/selectors'
import { getPlaylistUpdates } from 'containers/notification/store/selectors'
import { useSelector } from 'utils/reducer'
import { playlistPage, getPathname } from 'utils/route'

import { addTrackToPlaylist } from 'store/cache/collections/actions'

import Droppable from 'containers/dragndrop/Droppable'
import UpdateDot from 'components/general/UpdateDot'
import navColumnStyles from './NavColumn.module.css'
import styles from './PlaylistLibrary.module.css'

import { getIsDragging } from 'store/dragndrop/selectors'
import { ID } from 'models/common/Identifiers'
import { SMART_COLLECTION_MAP } from 'containers/smart-collection/smartCollections'
import { SmartCollection } from 'models/Collection'
import { AccountCollection } from 'store/account/reducer'
import Draggable from 'containers/dragndrop/Draggable'
import { useDispatch } from 'react-redux'
import { update } from 'store/playlist-library/slice'
import { SmartCollectionVariant } from 'containers/smart-collection/types'
import { reorderPlaylistLibrary } from 'store/playlist-library/helpers'
import Tooltip from 'components/tooltip/Tooltip'
import { useArePlaylistUpdatesEnabled } from 'containers/remote-config/hooks'

type DraggableNavLinkProps = NavLinkProps & {
  key: ID | SmartCollectionVariant
  playlistId: ID | SmartCollectionVariant
  name: string
  onReorder: (
    draggingId: ID | SmartCollectionVariant,
    droppingId: ID | SmartCollectionVariant
  ) => void
  link?: string
}

const DraggableNavLink = ({
  key,
  playlistId,
  name,
  link,
  onReorder,
  children,
  className,
  ...navLinkProps
}: DraggableNavLinkProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const onDrag = useCallback(() => {
    setIsDragging(true)
  }, [setIsDragging])
  const onDrop = useCallback(() => {
    setIsDragging(false)
  }, [setIsDragging])
  return (
    <Droppable
      key={key}
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
          className={cn(className, { [styles.dragging]: isDragging })}
        >
          {children}
        </NavLink>
      </Draggable>
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
      <DraggableNavLink
        playlistId={name as SmartCollectionVariant}
        key={name as SmartCollectionVariant}
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
      </DraggableNavLink>
    )
  }

  const renderPlaylist = (playlist: AccountCollection) => {
    if (!account || !playlist) return
    const { id, name } = playlist
    const url = playlistPage(playlist.user.handle, name, id)
    const addTrack = (trackId: ID) => addTrackToPlaylist(trackId, id)
    const isOwner = playlist.user.handle === account.handle
    return (
      <Droppable
        key={id}
        className={navColumnStyles.droppable}
        hoverClassName={navColumnStyles.droppableHover}
        onDrop={addTrack}
        acceptedKinds={['track']}
        disabled={!isOwner}
      >
        <DraggableNavLink
          key={id}
          playlistId={id}
          name={name}
          link={url}
          to={url}
          onReorder={onReorder}
          isActive={() => url === getPathname()}
          activeClassName='active'
          className={cn(navColumnStyles.link, {
            [navColumnStyles.playlistUpdate]: updates.includes(id),
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
          onClick={onClickNavLinkWithAccount}
        >
          {!!arePlaylistUpdatesEnabled && updates.includes(id) ? (
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
            </div>
          ) : (
            <span>{name}</span>
          )}
        </DraggableNavLink>
      </Droppable>
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
        library.contents.map(identifier => {
          switch (identifier.type) {
            case 'explore_playlist': {
              const playlist = SMART_COLLECTION_MAP[identifier.playlist_id]
              return renderExplorePlaylist(playlist)
            }
            case 'playlist': {
              const playlist = playlists[identifier.playlist_id]
              if (playlist) {
                delete playlistsNotInLibrary[identifier.playlist_id]
              }
              return renderPlaylist(playlist)
            }
            case 'folder':
              // TODO support folders!
              break
          }
          return null
        })}
      {Object.values(playlistsNotInLibrary).map(playlist => {
        return renderPlaylist(playlist)
      })}
      {playlists && Object.keys(playlists).length === 0 ? (
        <div className={cn(navColumnStyles.link, navColumnStyles.disabled)}>
          Create your first playlist!
        </div>
      ) : null}
    </>
  )
}

export default PlaylistLibrary
