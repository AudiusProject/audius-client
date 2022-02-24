import { getUserId } from 'audius-client/src/common/store/account/selectors'
import {
  getCollection,
  getCollectionStatus,
  getCollectionTracksLineup,
  getCollectionUid,
  getUser,
  getUserUid
} from 'common/store/pages/collection/selectors'
import { StyleSheet, View } from 'react-native'

import { usePushRouteWeb } from 'app/hooks/usePushRouteWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { ThemeColors } from 'app/utils/theme'

import { TrackScreenHeader } from './TrackScreenHeader'

const createStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    root: {
      padding: 12
    },
    headerContainer: {
      marginBottom: 24
    }
  })

/**
 * `CollectionScreen` displays a collection and its details
 */
export const CollectionScreen = () => {
  const collection = useSelectorWeb(getCollection)
  const user = useSelectorWeb(getUser)

  const styles = useThemedStyles(createStyles)
  const pushRouteWeb = usePushRouteWeb()

  const currentUserId = useSelectorWeb(getUserId)
  return (
    <View style={styles.root}>
      <View style={styles.headerContainer}>
        <TrackScreenHeader
          track={track}
          user={user}
          uid={lineup?.entries?.[0]?.uid}
          currentUserId={currentUserId}
        />
      </View>
    </View>
  )
}
