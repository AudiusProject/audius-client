import { ComponentType, ReactNode } from 'react'

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { SvgProps } from 'react-native-svg'

import { TopTabBar } from 'app/components/top-tab-bar'
import { makeStyles } from 'app/styles'

const Tab = createMaterialTopTabNavigator()

const useStyles = makeStyles(({ palette }) => ({
  root: { backgroundColor: palette.white },
  label: { fontSize: 12 },
  indicator: { backgroundColor: palette.primary, height: 3 }
}))

type TabNavigatorProps = {
  initialScreenName?: string
  children: ReactNode
}

export const TabNavigator = ({
  initialScreenName,
  children
}: TabNavigatorProps) => {
  const styles = useStyles()
  return (
    <Tab.Navigator
      initialRouteName={initialScreenName}
      tabBar={props => <TopTabBar {...props} />}
      screenOptions={{
        tabBarStyle: styles.root,
        tabBarLabelStyle: styles.label,
        tabBarIndicatorStyle: styles.indicator
      }}
    >
      {children}
    </Tab.Navigator>
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
}

export const tabScreen = (config: TabScreenConfig) => {
  const { key, name, label, Icon, component } = config
  return (
    <Tab.Screen
      key={key}
      name={name}
      component={component}
      options={{
        tabBarLabel: label ?? name,
        tabBarIcon: ({ color }) => <Icon fill={color} />
      }}
    />
  )
}

type TopTabsProps = {
  initialScreenName?: string
  screens?: ScreenConfig[]
}

const TopTabNavigator = ({ initialScreenName, screens }: TopTabsProps) => {
  return (
    <TabNavigator initialScreenName={initialScreenName}>
      {screens?.map(screen => tabScreen({ key: screen.name, ...screen }))}
    </TabNavigator>
  )
}

export default TopTabNavigator
