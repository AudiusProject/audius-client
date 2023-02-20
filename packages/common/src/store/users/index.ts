import * as combinedUserSelectors from './combinedUsersSelectors'
import { usersSelectors as baseUsersSelectors } from './usersSelectors'

export {
  default as cacheUsersReducer,
  actions as usersActions
} from './usersSlice'

export const usersSelectors = {
  ...baseUsersSelectors,
  ...combinedUserSelectors
}

export { processAndCacheUsers, reformatUser } from './utils'
