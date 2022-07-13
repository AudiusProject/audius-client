import { CommonState } from 'common/store'
import { getUsers } from 'common/store/cache/users/selectors'
import { createShallowSelector } from 'common/utils/selectorHelpers'

export const getSuggestedFollows = (state: CommonState) =>
  state.pages.feed.suggestedFollows
export const getDiscoverFeedLineup = (state: CommonState) =>
  state.pages.feed.feed

export const getFeedFilter = (state: CommonState) => state.pages.feed.feedFilter

export const getSuggestedFollowUsers = (state: CommonState) =>
  getUsers(state, { ids: getSuggestedFollows(state) })

export const makeGetSuggestedFollows = () => {
  return createShallowSelector(
    [getSuggestedFollowUsers, getSuggestedFollows],
    (users, followIds) => {
      return followIds
        .map((id) => users[id])
        .filter((user) => !!user && !user.is_deactivated)
    }
  )
}
