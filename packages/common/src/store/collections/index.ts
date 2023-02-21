import * as baseCollectionSelectors from './collectionsSelectors'
import * as combinedCollectionSelectors from './combinedCollectionsSelectors'

export {
  default as collectionsReducer,
  actions as cacheCollectionsActions
} from './collectionsSlice'

export const cacheCollectionsSelectors = {
  ...baseCollectionSelectors,
  ...combinedCollectionSelectors
}

export * from './types'
