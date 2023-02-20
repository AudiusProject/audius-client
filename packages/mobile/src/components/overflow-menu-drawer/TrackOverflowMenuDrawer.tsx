import { useContext } from 'react'

import type { ID, OverflowActionCallbacks, CommonState } from '@audius/common'
import {
  FavoriteSource,
  FollowSource,
  RepostSource,
  ShareSource,
  tracksSelectors,
  usersSelectors,
  tracksSocialActions,
  usersSocialActions,
  addToPlaylistUIActions,
  OverflowAction,
  mobileOverflowMenuUISelectors
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import { useDrawer } from 'app/hooks/useDrawer'
import { useNavigation } from 'app/hooks/useNavigation'
import { AppTabNavigationContext } from 'app/screens/app-screen'
import { setVisibility } from 'app/store/drawers/slice'

const { getMobileOverflowModal } = mobileOverflowMenuUISelectors
const { requestOpen: openAddToPlaylistModal } = addToPlaylistUIActions
const { followUser, unfollowUser } = usersSocialActions
const { repostTrack, undoRepostTrack, saveTrack, unsaveTrack, shareTrack } =
  tracksSocialActions
const { getUser } = usersSelectors
const { getTrack } = tracksSelectors

type Props = {
  render: (callbacks: OverflowActionCallbacks) => JSX.Element
}

const TrackOverflowMenuDrawer = ({ render }: Props) => {
  const { onClose: closeNowPlayingDrawer } = useDrawer('NowPlaying')
  const { navigation: contextNavigation } = useContext(AppTabNavigationContext)
  const navigation = useNavigation({ customNavigation: contextNavigation })
  const dispatch = useDispatch()
  const { id: modalId } = useSelector(getMobileOverflowModal)
  const id = modalId as ID

  const track = useSelector((state: CommonState) => getTrack(state, { id }))

  const user = useSelector((state: CommonState) =>
    getUser(state, { id: track?.owner_id })
  )

  if (!track || !user) {
    return null
  }
  const { owner_id, title } = track
  const { handle } = user

  if (!id || !owner_id || !handle || !title) {
    return null
  }

  const callbacks = {
    [OverflowAction.REPOST]: () =>
      dispatch(repostTrack(id, RepostSource.OVERFLOW)),
    [OverflowAction.UNREPOST]: () =>
      dispatch(undoRepostTrack(id, RepostSource.OVERFLOW)),
    [OverflowAction.FAVORITE]: () =>
      dispatch(saveTrack(id, FavoriteSource.OVERFLOW)),
    [OverflowAction.UNFAVORITE]: () =>
      dispatch(unsaveTrack(id, FavoriteSource.OVERFLOW)),
    [OverflowAction.SHARE]: () =>
      dispatch(shareTrack(id, ShareSource.OVERFLOW)),
    [OverflowAction.ADD_TO_PLAYLIST]: () =>
      dispatch(openAddToPlaylistModal(id, title)),
    [OverflowAction.VIEW_TRACK_PAGE]: () => {
      closeNowPlayingDrawer()
      navigation?.push('Track', { id })
    },
    [OverflowAction.VIEW_ARTIST_PAGE]: () => {
      closeNowPlayingDrawer()
      navigation?.push('Profile', { handle })
    },
    [OverflowAction.FOLLOW_ARTIST]: () =>
      dispatch(followUser(owner_id, FollowSource.OVERFLOW)),
    [OverflowAction.UNFOLLOW_ARTIST]: () =>
      dispatch(unfollowUser(owner_id, FollowSource.OVERFLOW)),
    [OverflowAction.EDIT_TRACK]: () => {
      navigation?.push('EditTrack', { id })
    },
    [OverflowAction.DELETE_TRACK]: () => {
      dispatch(
        setVisibility({
          drawer: 'DeleteConfirmation',
          visible: true,
          data: { trackId: id }
        })
      )
    }
  }

  return render(callbacks)
}

export default TrackOverflowMenuDrawer
