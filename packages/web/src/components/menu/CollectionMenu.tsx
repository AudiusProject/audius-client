import {
  cacheUsersSelectors,
  collectionsSocialActions as socialActions,
  EnhancedCollectionTrack,
  FavoriteSource,
  ID,
  PlayableType,
  queueActions,
  QueueSource,
  RepostSource,
  ShareSource
} from '@audius/common'
import { PopupMenuItem } from '@audius/stems'
import { push as pushRoute } from 'connected-react-router'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import * as embedModalActions from 'components/embed-modal/store/actions'
import { open as openEditCollectionModal } from 'store/application/ui/editPlaylistModal/slice'
import { AppState } from 'store/types'
import { albumPage, playlistPage, profilePage } from 'utils/route'
const { getUser } = cacheUsersSelectors

type PlaylistId = number

export type OwnProps = {
  children: (items: PopupMenuItem[]) => JSX.Element
  extraMenuItems: PopupMenuItem[]
  handle: string
  includeEdit?: boolean
  includeEmbed: boolean
  includeFavorite: boolean
  includeRepost: boolean
  includeShare: boolean
  includeVisitPage: boolean
  isFavorited: boolean
  isOwner: boolean
  isPublic: boolean
  isReposted: boolean
  onClose?: () => void
  onRepost?: () => void
  tracks: EnhancedCollectionTrack[]
  onShare?: () => void
  playlistId: PlaylistId
  playlistUid: string
  playlistName: string
  type: 'album' | 'playlist'
}

export type CollectionMenuProps = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const messages = {
  embed: 'Embed',
  addToQueue: 'Add to Queue',
  addToPlayNext: 'Play Next'
}

const CollectionMenu = (props: CollectionMenuProps) => {
  const getMenu = () => {
    const {
      type,
      handle,
      playlistName,
      playlistId,
      isOwner,
      isFavorited,
      isReposted,
      includeEdit,
      includeShare,
      includeRepost,
      includeFavorite,
      includeEmbed,
      includeVisitPage,
      isPublic,
      isArtist,
      tracks,
      onShare,
      goToRoute,
      openEmbedModal,
      editCollection,
      shareCollection,
      saveCollection,
      unsaveCollection,
      repostCollection,
      undoRepostCollection,
      dispatchUserAddToPlayNext,
      onRepost,
      extraMenuItems,
      dispatchUserAddToQueue
    } = props

    const routePage = type === 'album' ? albumPage : playlistPage
    const shareMenuItem = {
      text: 'Share',
      onClick: () => {
        shareCollection(playlistId)
        if (onShare) onShare()
      }
    }

    const typeName = type === 'album' ? 'Album' : 'Playlist'
    const favoriteMenuItem = {
      text: isFavorited ? `Unfavorite ${typeName}` : `Favorite ${typeName}`,
      onClick: () =>
        isFavorited ? unsaveCollection(playlistId) : saveCollection(playlistId)
    }

    const repostMenuItem = {
      text: isReposted ? 'Undo Repost' : 'Repost',
      onClick: () => {
        if (isReposted) {
          undoRepostCollection(playlistId)
        } else {
          repostCollection(playlistId)
          if (onRepost) onRepost()
        }
      }
    }

    const addToQueueMenuItem = {
      text: messages.addToQueue,
      onClick: () => {
        dispatchUserAddToQueue({
          entries: tracks.map((t) => ({
            id: t.track_id,
            uid: t.uid,
            source: QueueSource.USER_ADDED
          }))
        })
      }
    }

    const addToPlayNextMenuItem = {
      text: messages.addToPlayNext,
      onClick: () => {
        dispatchUserAddToPlayNext({
          entries: tracks.map((t) => ({
            id: t.track_id,
            uid: t.uid,
            source: QueueSource.USER_ADDED
          }))
        })
      }
    }

    const artistPageMenuItem = {
      text: `Visit ${isArtist ? 'Artist' : 'User'} Page`,
      onClick: () => goToRoute(profilePage(handle))
    }

    const playlistPageMenuItem = {
      text: `Visit ${typeName} Page`,
      onClick: () => goToRoute(routePage(handle, playlistName, playlistId))
    }

    const editCollectionMenuItem = {
      text: `Edit ${typeName}`,
      onClick: () => editCollection(playlistId)
    }

    const embedMenuItem = {
      text: messages.embed,
      onClick: () =>
        openEmbedModal(
          playlistId,
          type === 'album' ? PlayableType.ALBUM : PlayableType.PLAYLIST
        )
    }

    const menu: { items: PopupMenuItem[] } = { items: [] }
    menu.items.push(addToQueueMenuItem)
    menu.items.push(addToPlayNextMenuItem)
    if (menu) {
      if (includeShare) menu.items.push(shareMenuItem)
    }
    if (!isOwner) {
      if (includeRepost) menu.items.push(repostMenuItem)
      if (includeFavorite) menu.items.push(favoriteMenuItem)
    }
    menu.items.push(artistPageMenuItem)
    if (includeVisitPage) {
      menu.items.push(playlistPageMenuItem)
    }

    if (extraMenuItems.length > 0) {
      menu.items = menu.items.concat(extraMenuItems)
    }
    if (includeEmbed && isPublic) {
      menu.items.push(embedMenuItem)
    }
    if (includeEdit && isOwner) {
      menu.items.push(editCollectionMenuItem)
    }

    return menu
  }

  const menu = getMenu()

  return props.children(menu.items)
}

function mapStateToProps(state: AppState, props: OwnProps) {
  const user = getUser(state, {
    handle: props.handle ? props.handle.toLowerCase() : null
  })
  return {
    isArtist: user ? user.track_count > 0 : false
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    goToRoute: (route: string) => dispatch(pushRoute(route)),
    shareCollection: (playlistId: PlaylistId) =>
      dispatch(socialActions.shareCollection(playlistId, ShareSource.OVERFLOW)),
    editCollection: (playlistId: ID) =>
      dispatch(openEditCollectionModal(playlistId)),
    saveCollection: (playlistId: PlaylistId) =>
      dispatch(
        socialActions.saveCollection(playlistId, FavoriteSource.OVERFLOW)
      ),
    unsaveCollection: (playlistId: PlaylistId) =>
      dispatch(
        socialActions.unsaveCollection(playlistId, FavoriteSource.OVERFLOW)
      ),
    repostCollection: (playlistId: PlaylistId) =>
      dispatch(
        socialActions.repostCollection(playlistId, RepostSource.OVERFLOW)
      ),
    undoRepostCollection: (playlistId: PlaylistId) =>
      dispatch(
        socialActions.undoRepostCollection(playlistId, RepostSource.OVERFLOW)
      ),
    openEmbedModal: (playlistId: ID, kind: PlayableType) =>
      dispatch(embedModalActions.open(playlistId, kind)),
    dispatchUserAddToQueue: (payload: any) =>
      dispatch(queueActions.userAddToQueue(payload)),
    dispatchUserAddToPlayNext: (payload: any) =>
      dispatch(queueActions.userAddToPlayNext(payload))
  }
}

CollectionMenu.defaultProps = {
  handle: '',
  mount: 'page',
  isFavorited: false,
  isReposted: false,
  includeFavorite: true,
  isArtist: false,
  includeVisitPage: true,
  includeEmbed: true,
  extraMenuItems: []
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionMenu)
