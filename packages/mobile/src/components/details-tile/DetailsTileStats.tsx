import { useCallback } from 'react'

import { FavoriteType } from 'audius-client/src/common/models/Favorite'
import { ID } from 'audius-client/src/common/models/Identifiers'
import { setFavorite } from 'audius-client/src/common/store/user-list/favorites/actions'
import { setRepost } from 'audius-client/src/common/store/user-list/reposts/actions'
import { RepostType } from 'audius-client/src/common/store/user-list/reposts/types'
import {
  FAVORITING_USERS_ROUTE,
  REPOSTING_USERS_ROUTE
} from 'audius-client/src/utils/route'
import { StyleSheet, View } from 'react-native'

import IconFavorite from 'app/assets/images/iconHeart.svg'
import IconRepost from 'app/assets/images/iconRepost.svg'
import Text from 'app/components/text'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useNavigation } from 'app/hooks/useNavigation'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { flexRowCentered } from 'app/styles'
import { ThemeColors } from 'app/utils/theme'

import { DetailsTileStat } from './DetailsStat'

const messages = {
  plays: 'Plays'
}

type DetailsTileStatsProps = {
  favoriteCount: number
  favoriteType: FavoriteType
  repostType: RepostType
  hideFavoriteCount?: boolean
  hideListenCount?: boolean
  hideRepostCount?: boolean
  id: ID
  playCount?: number
  repostCount: number
}

const createStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    statsContainer: {
      ...flexRowCentered(),
      justifyContent: 'center',
      marginBottom: 12
    },
    countLabel: {
      fontSize: 16,
      color: themeColors.neutralLight4,
      textAlign: 'center'
    }
  })

/**
 * The stats displayed on track and playlist screens
 */
export const DetailsTileStats = ({
  favoriteCount,
  favoriteType,
  repostType,
  hideFavoriteCount,
  hideListenCount,
  hideRepostCount,
  id,
  playCount = 0,
  repostCount
}: DetailsTileStatsProps) => {
  const navigation = useNavigation()

  const styles = useThemedStyles(createStyles)
  const dispatchWeb = useDispatchWeb()

  const handlePressFavorites = useCallback(() => {
    dispatchWeb(setFavorite(id, favoriteType))
    navigation.push({
      native: { screen: 'FavoritedScreen', params: undefined },
      web: { route: FAVORITING_USERS_ROUTE }
    })
  }, [dispatchWeb, id, navigation, favoriteType])

  const handlePressReposts = useCallback(() => {
    dispatchWeb(setRepost(id, repostType))
    navigation.push({
      native: { screen: 'RepostsScreen', params: undefined },
      web: { route: REPOSTING_USERS_ROUTE }
    })
  }, [dispatchWeb, id, navigation, repostType])

  return (
    <>
      {(!hideListenCount || !hideFavoriteCount || !hideRepostCount) && (
        <View style={styles.statsContainer}>
          {hideListenCount ? null : (
            <DetailsTileStat
              count={playCount}
              renderLabel={color => (
                <Text style={[styles.countLabel, { color }]}>
                  {messages.plays}
                </Text>
              )}
            />
          )}
          {hideFavoriteCount ? null : (
            <DetailsTileStat
              count={favoriteCount}
              onPress={handlePressFavorites}
              renderLabel={color => (
                <IconFavorite fill={color} height={16} width={16} />
              )}
            />
          )}
          {hideRepostCount ? null : (
            <DetailsTileStat
              count={repostCount}
              onPress={handlePressReposts}
              renderLabel={color => (
                <IconRepost fill={color} height={18} width={18} />
              )}
            />
          )}
        </View>
      )}
    </>
  )
}
