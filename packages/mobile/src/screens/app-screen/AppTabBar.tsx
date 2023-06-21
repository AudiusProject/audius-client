import { useCallback, useRef } from 'react'

import { bottomTabBarUIActions } from '@audius/common'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Animated, Dimensions, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { BottomTabBar } from 'app/components/bottom-tab-bar'
import { FULL_DRAWER_HEIGHT } from 'app/components/drawer'
import { NowPlayingDrawer } from 'app/components/now-playing-drawer'
import { makeStyles } from 'app/styles'

const { setBottomTabBarHeight } = bottomTabBarUIActions

const useStyles = makeStyles(({ palette }) => ({
  bottomBarContainer: {
    zIndex: 4,
    elevation: 4
  }
}))

type TabBarProps = BottomTabBarProps

const screenHeight = Dimensions.get('screen').height

export const AppTabBar = (props: TabBarProps) => {
  const { navigation, state } = props
  const styles = useStyles()
  const dispatch = useDispatch()
  // Set handlers for the NowPlayingDrawer and BottomTabBar
  // When the drawer is open, the bottom bar should hide (animated away).
  // When the drawer is closed, the bottom bar should reappear (animated in).
  const translationAnim = useRef(new Animated.Value(FULL_DRAWER_HEIGHT)).current

  const viewRef = useRef<View | null>(null)
  const handleOnLayout = useCallback(() => {
    if (viewRef.current) {
      viewRef.current.measure((x, y, width, height, pageX, pageY) => {
        dispatch(setBottomTabBarHeight({ height: screenHeight - pageY }))
      })
    }
  }, [dispatch])

  return (
    <>
      <NowPlayingDrawer translationAnim={translationAnim} />
      <View
        style={styles.bottomBarContainer}
        onLayout={handleOnLayout}
        ref={viewRef}
      >
        <BottomTabBar
          translationAnim={translationAnim}
          navigation={navigation}
          state={state}
        />
      </View>
    </>
  )
}
