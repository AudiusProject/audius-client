import type { ReactNode } from 'react'
import { createContext } from 'react'

// eslint-disable-next-line import/no-unresolved
import type { DrawerNavigationHelpers } from '@react-navigation/drawer/lib/typescript/src/types'
import type {
  DrawerNavigationState,
  NavigationProp,
  ParamListBase
} from '@react-navigation/native'

type ContextType = {
  drawerHelpers: DrawerNavigationHelpers
  drawerNavigation?: NavigationProp<any>
  gesturesDisabled?: boolean
  setGesturesDisabled?: (gestureDisabled: boolean) => void
  state?: DrawerNavigationState<ParamListBase>
}

type NotificationsDrawerNavigationContextValue =
  | ContextType
  | Record<string, never>

export const NotificationsDrawerNavigationContext =
  createContext<NotificationsDrawerNavigationContextValue>({})

type ProviderProps = ContextType & {
  children: ReactNode
}

export const NotificationsDrawerNavigationContextProvider = (
  props: ProviderProps
) => {
  const { children, ...other } = props
  return (
    <NotificationsDrawerNavigationContext.Provider value={other}>
      {children}
    </NotificationsDrawerNavigationContext.Provider>
  )
}
