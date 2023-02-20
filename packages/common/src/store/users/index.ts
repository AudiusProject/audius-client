import * as combinedUserSelectors from './combinedUsersSelectors'
import { usersSelectors } from './usersSelectors'

export {
  default as cacheUsersReducer,
  actions as cacheUsersActions
} from './usersSlice'

export const cacheUsersSelectors = {
  ...usersSelectors,
  ...combinedUserSelectors
}
