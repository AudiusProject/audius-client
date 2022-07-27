import { useCallback } from 'react'

import { ID, SquareSizes } from '@audius/common'
import { push as pushRoute } from 'connected-react-router'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { getTrack } from 'common/store/cache/tracks/selectors'
import { getUserFromTrack } from 'common/store/cache/users/selectors'
import RemixCard from 'components/remix-card/RemixCard'
import { useTrackCoverArt } from 'hooks/useTrackCoverArt'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'
import { AppState } from 'store/types'
import { profilePage } from 'utils/route'
import { withNullGuard } from 'utils/withNullGuard'

type OwnProps = {
  trackId: ID
}

type ConnectedRemixCardProps = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const g = withNullGuard(
  ({ track, user, ...p }: ConnectedRemixCardProps) =>
    track && user && { ...p, track, user }
)

const ConnectedRemixCard = g(({ track, user, goToRoute }) => {
  const profilePictureImage = useUserProfilePicture(
    user.user_id,
    user._profile_picture_sizes,
    SquareSizes.SIZE_150_BY_150
  )
  const coverArtImage = useTrackCoverArt(
    track.track_id,
    track._cover_art_sizes,
    SquareSizes.SIZE_480_BY_480
  )
  const goToTrackPage = useCallback(() => {
    goToRoute(track.permalink)
  }, [goToRoute, track])
  const goToArtistPage = useCallback(() => {
    goToRoute(profilePage(user.handle))
  }, [goToRoute, user])

  return (
    <RemixCard
      profilePictureImage={profilePictureImage}
      coverArtImage={coverArtImage}
      coSign={track._co_sign}
      artistName={user.name}
      artistHandle={user.handle}
      onClick={goToTrackPage}
      onClickArtistName={goToArtistPage}
      userId={user.user_id}
    />
  )
})

function mapStateToProps(state: AppState, ownProps: OwnProps) {
  return {
    track: getTrack(state, { id: ownProps.trackId }),
    user: getUserFromTrack(state, { id: ownProps.trackId })
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    goToRoute: (route: string) => dispatch(pushRoute(route))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedRemixCard)
