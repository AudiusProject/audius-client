import {
  OverflowAction,
  OverflowSource,
  mobileOverflowMenuUISelectors
} from '@audius/common'
import { useSelector } from 'react-redux'

import ActionDrawer from 'app/components/action-drawer'

import type { ActionDrawerRow } from '../action-drawer/ActionDrawer'

import CollectionOverflowMenuDrawer from './CollectionOverflowMenuDrawer'
import ProfileOverflowMenuDrawer from './ProfileOverflowMenuDrawer'
import TrackOverflowMenuDrawer from './TrackOverflowMenuDrawer'
const { getMobileOverflowModal } = mobileOverflowMenuUISelectors

const overflowRowConfig: Record<OverflowAction, ActionDrawerRow> = {
  [OverflowAction.REPOST]: { text: 'Repost' },
  [OverflowAction.UNREPOST]: { text: 'Unrepost' },
  [OverflowAction.FAVORITE]: { text: 'Favorite' },
  [OverflowAction.UNFAVORITE]: { text: 'Unfavorite' },
  [OverflowAction.SHARE]: { text: 'Share' },
  [OverflowAction.ADD_TO_PLAYLIST]: { text: 'Add To Playlist' },
  [OverflowAction.EDIT_PLAYLIST]: { text: 'Edit Playlist' },
  [OverflowAction.DELETE_PLAYLIST]: {
    text: 'Delete Playlist',
    isDestructive: true
  },
  [OverflowAction.PUBLISH_PLAYLIST]: { text: 'Publish Playlist' },
  [OverflowAction.VIEW_TRACK_PAGE]: { text: 'View Track Page' },
  [OverflowAction.VIEW_ARTIST_PAGE]: { text: 'View Artist Page' },
  [OverflowAction.VIEW_PLAYLIST_PAGE]: { text: 'View Playlist Page' },
  [OverflowAction.VIEW_ALBUM_PAGE]: { text: 'View Album Page' },
  [OverflowAction.FOLLOW_ARTIST]: { text: 'Follow Artist' },
  [OverflowAction.UNFOLLOW_ARTIST]: { text: 'Unfollow Artist' },
  [OverflowAction.FOLLOW]: { text: 'Follow' },
  [OverflowAction.UNFOLLOW]: { text: 'Unfollow' },
  [OverflowAction.EDIT_TRACK]: { text: 'Edit Track' },
  [OverflowAction.DELETE_TRACK]: { text: 'Delete Track', isDestructive: true },
  [OverflowAction.VIEW_COLLECTIBLE_PAGE]: { text: 'View Collectible Page' }
}

export const OverflowMenuDrawer = () => {
  const overflowMenu = useSelector(getMobileOverflowModal)

  if (!overflowMenu?.id) {
    return <></>
  }

  const { source, overflowActions } = overflowMenu

  const OverflowDrawerComponent =
    {
      [OverflowSource.TRACKS]: TrackOverflowMenuDrawer,
      [OverflowSource.COLLECTIONS]: CollectionOverflowMenuDrawer,
      // No case for NOTIFICATIONS because there currently isn't an overflow menu on notifications
      [OverflowSource.PROFILE]: ProfileOverflowMenuDrawer
    }[source] ?? TrackOverflowMenuDrawer

  return (
    <OverflowDrawerComponent
      render={(callbacks) => {
        const rows = (overflowActions ?? []).map((action) => ({
          ...overflowRowConfig[action],
          callback: callbacks[action]
        }))
        return <ActionDrawer modalName='Overflow' rows={rows} />
      }}
    />
  )
}
