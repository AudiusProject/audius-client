import { cacheUsersSelectors } from '@audius/common'
import { createSelector } from 'reselect'
const { getUsers } = cacheUsersSelectors

// Sign On selectors
export const getSignOn = (state) => state.signOn
export const getEmailField = (state) => state.signOn.email
export const getNameField = (state) => state.signOn.name
export const getPasswordField = (state) => state.signOn.password
export const getHandleField = (state) => state.signOn.handle
export const getIsVerified = (state) => state.signOn.verified
export const getProfileImageField = (state) => state.signOn.profileImage
export const getIsMobileSignOnVisible = (state) =>
  state.signOn.isMobileSignOnVisible
export const getStatus = (state) => state.signOn.status
export const getPage = (state) => state.signOn.page
export const getToastText = (state) => state.signOn.toastText
export const getRouteOnCompletion = (state) => state.signOn.routeOnCompletion
export const getRouteOnExit = (state) => state.signOn.routeOnExit
export const getAccountReady = (state) => state.signOn.accountReady
export const getStartedSignOnProcess = (state) =>
  state.signOn.startedSignOnProcess
export const getReferrer = (state) => state.signOn.referrer

export const getFollowArtists = (state) => state.signOn.followArtists
export const getFollowIds = (state) =>
  state.signOn.followArtists.selectedUserIds

export const getSuggestedFollowIds = (state) => {
  const { selectedCategory, categories } = state.signOn.followArtists
  return categories[selectedCategory] || []
}

/**
 * Each lineup that invokes this selector should pass its own selector as an argument, e.g.
 *   const getLineupMetadatas = makeGetLineupMetadatas(ownProps.lineupSelector)
 *   const mapStateToProps = (state, props) => ({ lineup: getLineupMetadatas(state) })
 */
export const makeGetFollowArtists = () =>
  createSelector([getSuggestedFollowIds, getUsers], (artistIds, users) =>
    artistIds.map((aId) => users[aId]).filter(Boolean)
  )
