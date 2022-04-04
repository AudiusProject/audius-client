import { ComponentType, createContext, ReactNode, useContext } from 'react'

import { Portal, PortalHost } from '@gorhom/portal'
import { NavigationContext } from '@react-navigation/core'
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
  MaterialTopTabNavigationOptions
} from '@react-navigation/material-top-tabs'
import { Animated, Dimensions, FlatList, View } from 'react-native'
import { SvgProps } from 'react-native-svg'

import { TopTabBar } from 'app/components/top-tab-bar'
import { makeStyles } from 'app/styles'

const Tab = createMaterialTopTabNavigator()

const useStyles = makeStyles(({ palette }) => ({
  root: { backgroundColor: palette.white },
  label: { fontSize: 12 },
  indicator: { backgroundColor: palette.primary, height: 3 }
}))

type CollapsibleTabNavigatorContextProps = {
  sceneName?: string
  refreshing?: boolean
  onRefresh?: () => void
  scrollY?: Animated.Value
}

export const CollapsibleTabNavigatorContext = createContext<
  CollapsibleTabNavigatorContextProps
>({
  sceneName: undefined,
  refreshing: undefined,
  onRefresh: undefined,
  scrollY: undefined
})

export const CollapsibleTabNavigatorContextProvider = ({
  sceneName,
  refreshing,
  onRefresh,
  scrollY,
  children
}: {
  sceneName: string
  refreshing?: boolean
  onRefresh?: () => void
  scrollY?: Animated.Value
  children: ReactNode
}) => {
  return (
    <CollapsibleTabNavigatorContext.Provider
      value={{ sceneName, refreshing, onRefresh, scrollY }}
    >
      {children}
    </CollapsibleTabNavigatorContext.Provider>
  )
}

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
  return (
    <FlatList
      data={[0, 1, 2]}
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
      showsVerticalScrollIndicator={false}
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
  refreshing?: boolean
  onRefresh?: () => void
  scrollY?: Animated.Value
}

export const collapsibleTabScreen = (config: TabScreenConfig) => {
  const {
    key,
    name,
    label,
    Icon,
    component: Component,
    initialParams,
    refreshing,
    onRefresh,
    scrollY
  } = config
  const { height } = Dimensions.get('screen')

  return (
    <Tab.Screen
      key={key}
      name={name}
      options={{
        tabBarLabel: label ?? name,
        tabBarIcon: ({ color }) => <Icon fill={color} />
      }}
      initialParams={initialParams}
    >
      {() => (
        // <CollapsibleTabNavigatorContextProvider
        //   sceneName={name}
        //   refreshing={refreshing}
        //   onRefresh={onRefresh}
        //   scrollY={scrollY}
        // >
        <View style={{ paddingBottom: height }}>
          <Component />
        </View>
        // </CollapsibleTabNavigatorContextProvider>
      )}
    </Tab.Screen>
  )
}
