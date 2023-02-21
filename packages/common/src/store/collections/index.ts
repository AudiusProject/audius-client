import * as baseCollectionSelectors from './collectionsSelectors'
import * as combinedCollectionSelectors from './combinedCollectionsSelectors'

export {
  default as collectionsReducer,
  actions as collectionsActions
} from './collectionsSlice'

export const collectionsSelectors = {
  ...baseCollectionSelectors,
  ...combinedCollectionSelectors
}

export * from './types'
