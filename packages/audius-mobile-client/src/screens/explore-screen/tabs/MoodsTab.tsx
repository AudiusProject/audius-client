import React, { useCallback } from 'react'

import { ParamListBase } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { push } from 'connected-react-router'
import { ScrollView, StyleSheet, View } from 'react-native'

import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { ThemeColors } from 'app/utils/theme'

import {
  CHILL_PLAYLISTS,
  PROVOKING_PLAYLISTS,
  INTIMATE_PLAYLISTS,
  UPBEAT_PLAYLISTS,
  INTENSE_PLAYLISTS
} from '../collections'
import { ColorTile } from '../components/ColorTile'
import { TabInfo } from '../components/TabInfo'

const messages = {
  infoHeader: 'Playlists to Fit Your Mood',
  infoText: 'Playlists made by Audius users, sorted by mood and feel.'
}

type Props = {
  navigation: NativeStackNavigationProp<ParamListBase, keyof ParamListBase>
}

const createStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    tabContainer: {
      flex: 1,
      display: 'flex'
    },
    contentContainer: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 12,
      paddingVertical: 24,
      // TODO: Fix this
      marginBottom: 240
    }
  })

const tiles = [
  CHILL_PLAYLISTS,
  UPBEAT_PLAYLISTS,
  INTENSE_PLAYLISTS,
  PROVOKING_PLAYLISTS,
  INTIMATE_PLAYLISTS
]

export const MoodsTab = ({ navigation }: Props) => {
  const styles = useThemedStyles(createStyles)
  const dispatchWeb = useDispatchWeb()
  const goToRoute = useCallback((route: string) => dispatchWeb(push(route)), [
    dispatchWeb
  ])

  return (
    <ScrollView style={styles.tabContainer}>
      <TabInfo header={messages.infoHeader} text={messages.infoText} />
      <View style={styles.contentContainer}>
        {tiles.map((tile, idx) => (
          <ColorTile
            style={{
              flex: 1,
              flexBasis: idx === 0 ? '100%' : '40%',
              marginLeft: idx && !(idx % 2) ? 8 : 0,
              marginBottom: 8
            }}
            key={tile.title}
            title={tile.title}
            description={tile.description}
            link={tile.link}
            emoji={tile.emoji}
            goToRoute={goToRoute}
            gradientColors={tile.gradientColors}
            gradientAngle={tile.gradientAngle}
            shadowColor={tile.shadowColor}
            shadowOpacity={tile.shadowOpacity}
            icon={tile.icon}
            isIncentivized={tile.incentivized}
          />
        ))}
      </View>
    </ScrollView>
  )
}
