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
  const { isEnabled } = useFlag(FeatureFlags.NEW_PLAYLIST_ROUTES)

  return (
    <CollectionPageProvider
      isMobile={isMobileClient}
      smartCollection={smartCollection}
      type={type}
      playlistByPermalinkEnabled={isEnabled}
    >
      {content}
    </CollectionPageProvider>
  )
}

export default CollectionPage
