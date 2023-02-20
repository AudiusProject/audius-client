import * as combinedUserSelectors from './combinedUsersSelectors'
import { usersSelectors } from './usersSelectors'

export {
  default as cacheUsersReducer,
  actions as usersActions
} from './usersSlice'

export const cacheUsersSelectors = {
  ...usersSelectors,
  ...combinedUserSelectors
}

export { processAndCacheUsers, reformatUser } from './utils'
