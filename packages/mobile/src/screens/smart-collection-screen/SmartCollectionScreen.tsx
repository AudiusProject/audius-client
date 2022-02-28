import { FavoriteSource } from 'audius-client/src/common/models/Analytics'
import { SmartCollection } from 'audius-client/src/common/models/Collection'
import { SmartCollectionVariant } from 'audius-client/src/common/models/SmartCollectionVariant'
import {
  saveSmartCollection,
  unsaveSmartCollection
} from 'audius-client/src/common/store/social/collections/actions'
import { getCollection } from 'common/store/pages/smart-collection/selectors'
import { StyleSheet, View } from 'react-native'

import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { CollectionScreenDetailsTile } from 'app/screens/collection-screen/CollectionScreenDetailsTile'
import { ThemeColors } from 'app/utils/theme'

const createStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    root: {
      padding: 12
    },
    headerContainer: {
      marginBottom: 24
    }
  })

type SmartCollectionScreenProps = {
  variant: SmartCollectionVariant
}

/**
 * `SmartCollectionScreen` displays the details of a smart collection
 */
export const SmartCollectionScreen = ({
  variant
}: SmartCollectionScreenProps) => {
  const collection = useSelectorWeb(state => getCollection(state, { variant }))

  if (!collection) {
    console.warn(
      'Collection missing for SmartCollectionScreen, preventing render'
    )
    return null
  }

  return (
    <SmartCollectionScreenComponent
      collection={collection as SmartCollection}
      variant={variant}
    />
  )
}

type SmartCollectionScreenComponentProps = {
  collection: SmartCollection
  variant: SmartCollectionVariant
}

const SmartCollectionScreenComponent = ({
  collection,
  variant
}: SmartCollectionScreenComponentProps) => {
  const styles = useThemedStyles(createStyles)
  const dispatchWeb = useDispatchWeb()
  const {
    gradient,
    description,
    has_current_user_saved,
    playlist_name
  } = collection

  const handlePressSave = () => {
    if (has_current_user_saved) {
      dispatchWeb(
        unsaveSmartCollection(variant, FavoriteSource.COLLECTION_PAGE)
      )
    } else {
      dispatchWeb(saveSmartCollection(variant, FavoriteSource.COLLECTION_PAGE))
    }
  }
  return (
    <View style={styles.root}>
      <View style={styles.headerContainer}>
        <CollectionScreenDetailsTile
          description={description ?? ''}
          hasSaved={has_current_user_saved}
          hideFavoriteCount
          hideOverflow
          hideRepost
          hideRepostCount
          hideShare
          imageUrl={gradient ?? ''}
          onPressSave={handlePressSave}
          title={playlist_name}
        />
      </View>
    </View>
  )
}
