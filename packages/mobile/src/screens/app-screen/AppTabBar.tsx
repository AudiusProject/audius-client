import { useRef } from 'react'

import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Animated, Dimensions } from 'react-native'

import { BottomTabBar } from 'app/components/bottom-tab-bar'
import NowPlayingDrawer from 'app/components/now-playing-drawer'

type TabBarProps = BottomTabBarProps
const { height } = Dimensions.get('window')

export const AppTabBar = (props: TabBarProps) => {
  // Set handlers for the NowPlayingDrawer and BottomTabBar
  // When the drawer is open, the bottom bar should hide (animated away).
  // When the drawer is closed, the bottom bar should reappear (animated in).
  const translationAnim = useRef(new Animated.Value(height)).current

  return (
    <>
      <NowPlayingDrawer translationAnim={translationAnim} />
      <BottomTabBar {...props} translationAnim={translationAnim} />
    </>
  )
}
