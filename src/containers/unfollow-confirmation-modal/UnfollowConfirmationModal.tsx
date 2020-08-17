import React from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { AppState } from 'store/types'
import UnfollowConfirmationModal from './components/UnfollowConfirmationModal'
import { getIsOpen, getUserId } from './store/selectors'
import * as actions from './store/actions'
import * as socialActions from 'store/social/users/actions'
import { ID } from 'models/common/Identifiers'
import { setNotificationSubscription } from 'containers/profile-page/store/actions'
import { FollowSource } from 'services/analytics'

type UnfollowConfirmationModalProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

// A modal that asks the user to confirm an unfollow.
const ConnectedUnfollowConfirmationModal = ({
  isOpen,
  userId,
  onClose,
  onUnfollow
}: UnfollowConfirmationModalProps) => {
  return (
    <UnfollowConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      unfollowUser={onUnfollow}
      userId={userId || -1}
    />
  )
}

function mapStateToProps(state: AppState) {
  return {
    isOpen: getIsOpen(state),
    userId: getUserId(state)
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    onUnfollow: (id: ID) => {
      dispatch(socialActions.unfollowUser(id, FollowSource.USER_LIST))
      dispatch(
        setNotificationSubscription(
          id,
          /** isSubscribed */ false,
          /* update */ true
        )
      )
    },
    onClose: () => dispatch(actions.setClosed())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedUnfollowConfirmationModal)
