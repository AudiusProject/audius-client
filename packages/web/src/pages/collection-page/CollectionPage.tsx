import {
  SmartCollection,
  CollectionsPageType,
  FeatureFlags
} from '@audius/common'

import { useFlag } from 'hooks/useRemoteConfig'
import { isMobile } from 'utils/clientUtil'

import CollectionPageProvider from './CollectionPageProvider'
import DesktopCollectionPage from './components/desktop/CollectionPage'
import MobileCollectionPage from './components/mobile/CollectionPage'

type CollectionPageProps = {
  type: CollectionsPageType
  smartCollection?: SmartCollection
}

const isMobileClient = isMobile()

const CollectionPage = (props: CollectionPageProps) => {
  const { type, smartCollection } = props
  const content = isMobileClient ? MobileCollectionPage : DesktopCollectionPage

  return (
    <CollectionPageProvider
      isMobile={isMobileClient}
      smartCollection={smartCollection}
      type={type}
      // todo: remove later, we are removing the ff for this
      playlistByPermalinkEnabled={true}
    >
      {content}
    </CollectionPageProvider>
  )
}

export default CollectionPage
