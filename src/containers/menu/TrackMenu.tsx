import { useContext } from 'react'

import { push as pushRoute } from 'connected-react-router'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { PopupMenuItem } from 'components/general/PopupMenu'
import { ToastContext } from 'components/toast/ToastContext'
import { requestOpen as openAddToPlaylist } from 'containers/add-to-playlist/store/actions'
import { getCollectionId } from 'containers/collection-page/store/selectors'
import * as embedModalActions from 'containers/embed-modal/store/actions'
import { requestOpen as openTikTokModal } from 'containers/share-sound-to-tiktok-modal/store/slice'
import { ID, PlayableType } from 'models/common/Identifiers'
import { newCollectionMetadata } from 'schemas'
import {
  FavoriteSource,
  RepostSource,
  ShareSource,
  CreatePlaylistSource
} from 'services/analytics'
import { getAccountOwnedPlaylists } from 'store/account/selectors'
import * as editTrackModalActions from 'store/application/ui/editTrackModal/actions'
import { showSetAsArtistPickConfirmation } from 'store/application/ui/setAsArtistPickConfirmation/actions'
import {
  createPlaylist,
  addTrackToPlaylist
} from 'store/cache/collections/actions'
import {
  saveTrack,
  unsaveTrack,
  repostTrack,
  undoRepostTrack,
  shareTrack
} from 'store/social/tracks/actions'
import { AppState } from 'store/types'
import { trackPage, profilePage } from 'utils/route'

const messages = {
  addToNewPlaylist: 'Add to New Playlist',
  addToPlaylist: 'Add to Playlist',
  copiedToClipboard: 'Copied To Clipboard!',
  embed: 'Embed',
  favorite: 'Favorite',
  repost: 'Repost',
  reposted: 'Reposted!',
  setArtistPick: 'Set as Artist Pick',
  share: 'Share',
  shareToTikTok: 'Share to TikTok',
  undoRepost: 'Undo Repost',
  unfavorite: 'Unfavorite',
  unreposted: 'Un-Reposted!',
  unsetArtistPick: 'Unset as Artist Pick',
  visitArtistPage: 'Visit Artist Page',
  visitTrackPage: 'Visit Track Page'
}

export type OwnProps = {
  children: (items: PopupMenuItem[]) => JSX.Element
  extraMenuItems?: PopupMenuItem[]
  handle: string
  includeAddToPlaylist: boolean
  includeArtistPick: boolean
  includeEdit: boolean
  includeEmbed?: boolean
  includeFavorite: boolean
  includeRepost: boolean
  includeShare: boolean
  includeTrackPage: boolean
  isArtistPick: boolean
  isDeleted: boolean
  isFavorited: boolean
  isOwner: boolean
  isReposted: boolean
  trackId: ID
  trackTitle: string
  type: 'track'
}

export type TrackMenuProps = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>

const TrackMenu = (props: TrackMenuProps) => {
  const { toast } = useContext(ToastContext)

  const getMenu = () => {
    const {
      extraMenuItems,
      goToRoute,
      handle,
      includeAddToPlaylist,
      includeArtistPick,
      includeEdit,
      includeEmbed,
      includeFavorite,
      includeRepost,
      includeShare,
      includeTrackPage,
      isArtistPick,
      isDeleted,
      isFavorited,
      isOwner,
      isReposted,
      openAddToPlaylistModal,
      openEditTrackModal,
      openEmbedModal,
      openShareSoundToTikTokModal,
      repostTrack,
      saveTrack,
      setArtistPick,
      shareTrack,
      trackId,
      trackTitle,
      undoRepostTrack,
      unsaveTrack,
      unsetArtistPick
    } = props

    const shareMenuItem = {
      text: messages.share,
      onClick: () => {
        if (trackId) {
          shareTrack(trackId)
          toast(messages.copiedToClipboard)
        }
      }
    }

    const repostMenuItem = {
      text: isReposted ? messages.undoRepost : messages.repost,
      // Set timeout so the menu has time to close before we propagate the change.
      onClick: () =>
        setTimeout(() => {
          isReposted ? undoRepostTrack(trackId) : repostTrack(trackId)
          toast(isReposted ? messages.unreposted : messages.reposted)
        }, 0)
    }

    const favoriteMenuItem = {
      text: isFavorited ? messages.unfavorite : messages.favorite,
      // Set timeout so the menu has time to close before we propagate the change.
      onClick: () =>
        setTimeout(() => {
          isFavorited ? unsaveTrack(trackId) : saveTrack(trackId)
        }, 0)
    }

    const addToPlaylistMenuItem = {
      text: messages.addToPlaylist,
      onClick: () => {
        openAddToPlaylistModal(trackId, trackTitle)
      }
    }

    const trackPageMenuItem = {
      text: messages.visitTrackPage,
      onClick: () => goToRoute(trackPage(handle, trackTitle, trackId))
    }

    // TODO: Add back go to album when we have better album linking.
    // const albumPageMenuItem = {
    //   text: 'Visit Album Page',
    //   onClick: () => goToRoute(albumPage(handle, albumName, albumId))
    // }

    const artistPageMenuItem = {
      text: messages.visitArtistPage,
      onClick: () => goToRoute(profilePage(handle))
    }

    const artistPickMenuItem = {
      text: isArtistPick ? messages.unsetArtistPick : messages.setArtistPick,
      onClick: isArtistPick
        ? () => unsetArtistPick()
        : () => setArtistPick(trackId)
    }

    const editTrackMenuItem = {
      text: 'Edit Track',
      onClick: () => openEditTrackModal(trackId)
    }

    const embedMenuItem = {
      text: messages.embed,
      onClick: () => openEmbedModal(trackId)
    }
    const shareToTikTokMenuItem = {
      text: messages.shareToTikTok,
      onClick: () => openShareSoundToTikTokModal(trackId)
    }

    const menu: { items: PopupMenuItem[] } = { items: [] }

    if (includeShare && !isDeleted) {
      menu.items.push(shareMenuItem)
    }
    if (includeRepost && !isOwner && !isDeleted) {
      menu.items.push(repostMenuItem)
    }
    if (includeFavorite && !isOwner && (!isDeleted || isFavorited)) {
      menu.items.push(favoriteMenuItem)
    }
    if (includeAddToPlaylist && !isDeleted) {
      menu.items.push(addToPlaylistMenuItem)
    }
    if (trackId && trackTitle && includeTrackPage && !isDeleted) {
      menu.items.push(trackPageMenuItem)
    }
    if (trackId && isOwner && includeArtistPick && !isDeleted) {
      menu.items.push(artistPickMenuItem)
    }
    // TODO: Add back go to album when we have better album linking.
    // if (albumId && albumName) {
    //   menu.items.push(albumPageMenuItem)
    // }
    if (handle) {
      menu.items.push(artistPageMenuItem)
    }
    if (includeEdit && isOwner && !isDeleted) {
      menu.items.push(editTrackMenuItem)
    }
    if (extraMenuItems && extraMenuItems.length > 0) {
      menu.items = menu.items.concat(extraMenuItems)
    }
    if (includeEmbed) {
      menu.items.push(embedMenuItem)
    }
    if (trackId && isOwner && !isDeleted) {
      menu.items.push(shareToTikTokMenuItem)
    }

    return menu
  }

  const menu = getMenu()

  return props.children(menu.items)
}

function mapStateToProps(state: AppState) {
  return {
    playlists: getAccountOwnedPlaylists(state, {}),
    currentCollectionId: getCollectionId(state)
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    goToRoute: (route: string) => dispatch(pushRoute(route)),
    addTrackToPlaylist: (trackId: ID, playlistId: ID) =>
      dispatch(addTrackToPlaylist(trackId, playlistId)),
    shareTrack: (trackId: ID) =>
      dispatch(shareTrack(trackId, ShareSource.OVERFLOW)),
    saveTrack: (trackId: ID) =>
      dispatch(saveTrack(trackId, FavoriteSource.OVERFLOW)),
    unsaveTrack: (trackId: ID) =>
      dispatch(unsaveTrack(trackId, FavoriteSource.OVERFLOW)),
    repostTrack: (trackId: ID) =>
      dispatch(repostTrack(trackId, RepostSource.OVERFLOW)),
    undoRepostTrack: (trackId: ID) =>
      dispatch(undoRepostTrack(trackId, RepostSource.OVERFLOW)),
    setArtistPick: (trackId: ID) =>
      dispatch(showSetAsArtistPickConfirmation(trackId)),
    unsetArtistPick: () => dispatch(showSetAsArtistPickConfirmation()),
    createEmptyPlaylist: (tempId: ID, name: string, trackId: ID) =>
      dispatch(
        createPlaylist(
          tempId,
          newCollectionMetadata({ playlist_name: name }),
          CreatePlaylistSource.FROM_TRACK,
          trackId
        )
      ),
    openAddToPlaylistModal: (trackId: ID, title: string) =>
      dispatch(openAddToPlaylist(trackId, title)),
    openEditTrackModal: (trackId: ID) =>
      dispatch(editTrackModalActions.open(trackId)),
    openEmbedModal: (trackId: ID) =>
      dispatch(embedModalActions.open(trackId, PlayableType.TRACK)),
    openShareSoundToTikTokModal: (trackId: ID) =>
      dispatch(openTikTokModal({ id: trackId }))
  }
}

TrackMenu.defaultProps = {
  includeShare: false,
  includeRepost: false,
  isFavorited: false,
  isReposted: false,
  includeEdit: true,
  includeEmbed: true,
  includeFavorite: true,
  includeTrackPage: true,
  includeAddToPlaylist: true,
  includeArtistPick: true,
  extraMenuItems: []
}

export default connect(mapStateToProps, mapDispatchToProps)(TrackMenu)
