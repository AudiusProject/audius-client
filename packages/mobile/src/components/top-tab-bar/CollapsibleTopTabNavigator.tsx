import { ComponentType, ReactNode, useContext } from 'react'

import { Portal, PortalHost } from '@gorhom/portal'
import { NavigationContext } from '@react-navigation/core'
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
  MaterialTopTabNavigationOptions
} from '@react-navigation/material-top-tabs'
import { Animated, Dimensions } from 'react-native'
import { SvgProps } from 'react-native-svg'

import { FlatList } from 'app/components/core/FlatList'
import { TopTabBar } from 'app/components/top-tab-bar'
import { makeStyles } from 'app/styles'

const Tab = createMaterialTopTabNavigator()

const useStyles = makeStyles(({ palette }) => ({
  root: { backgroundColor: palette.white },
  label: { fontSize: 12 },
  indicator: { backgroundColor: palette.primary, height: 3 }
}))

type CollapsibleTabNavigatorProps = {
  /**
   * Function that renders the collapsible header
   */
  renderHeader: () => ReactNode

  /**
   * Animated value to capture scrolling. If unset, an
   * animated value is created.
   */
  animatedValue?: Animated.Value

  initialScreenName?: string
  children: ReactNode
  screenOptions?: MaterialTopTabNavigationOptions

  refreshing?: boolean
  onRefresh?: () => void
  scrollY?: Animated.Value
}

const CollapsibleTabBar = (props: MaterialTopTabBarProps) => {
  const navigation = useContext(NavigationContext)
  return (
    <Portal hostName='CollapsibleTabBarHost'>
      <NavigationContext.Provider value={navigation}>
        <TopTabBar {...props} />
      </NavigationContext.Provider>
    </Portal>
  )
}

export const CollapsibleTabNavigator = ({
  renderHeader,
  animatedValue,
  initialScreenName,
  children,
  screenOptions
}: CollapsibleTabNavigatorProps) => {
  const styles = useStyles()
  const { height } = Dimensions.get('screen')
  return (
    <FlatList
      data={[0, 1, 2]}
      scrollAnim={animatedValue}
      renderItem={({ index }) => {
        if (index === 0) {
          return renderHeader() as any
        }
        if (index === 1) {
          return <PortalHost name='CollapsibleTabBarHost' />
        }
        return (
          <Tab.Navigator
            initialRouteName={initialScreenName}
            tabBar={CollapsibleTabBar}
            sceneContainerStyle={{ paddingBottom: height }}
            screenOptions={{
              tabBarStyle: styles.root,
              tabBarLabelStyle: styles.label,
              tabBarIndicatorStyle: styles.indicator,
              lazy: true,
              ...screenOptions
            }}
          >
            {children}
          </Tab.Navigator>
        )
      }}
      stickyHeaderIndices={[1]}
      refreshIndicatorTopOffset={40}
    />
  )
}

type ScreenConfig = {
  name: string
  label?: string
  component: ComponentType<any>
  Icon: ComponentType<SvgProps>
}

type TabScreenConfig = ScreenConfig & {
  key?: string
  initialParams?: Record<string, unknown>
}

export const collapsibleTabScreen = (config: TabScreenConfig) => {
  const { key, name, label, Icon, component: Component, initialParams } = config

  return (
    <Tab.Screen
      key={key}
      name={name}
      options={{
        tabBarLabel: label ?? name,
        tabBarIcon: ({ color }) => <Icon fill={color} />
      }}
      initialParams={initialParams}
      component={Component}
    />
  )
}
