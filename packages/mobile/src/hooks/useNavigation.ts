import { useCallback, useMemo, useRef } from 'react'

import type {
  ParamListBase,
  NavigationProp as RNNavigationProp
} from '@react-navigation/native'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { isEqual } from 'lodash'

export type ContextualParams = {
  fromNotifications?: boolean
}

export type ContextualizedParamList<ParamList extends ParamListBase> = {
  [K in keyof ParamList]: ParamList[K] & ContextualParams
}

type PerformNavigationConfig<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList
> = [screen: RouteName, params?: ParamList[RouteName] & ContextualParams]

type UseNavigationOptions<NavigationProp extends RNNavigationProp<any>> = {
  customNavigation?: NavigationProp
}

/**
 * Custom wrapper around react-navigation `useNavigation`
 *
 * Features:
 * - Prevent duplicate navigation pushes
 * - Apply contextual params to all routes
 */
export function useNavigation<
  ParamList extends ParamListBase,
  NavigationProp extends RNNavigationProp<any> = NativeStackNavigationProp<ParamList>
>(options?: UseNavigationOptions<NavigationProp>): NavigationProp {
  const defaultNativeNavigation = useNativeNavigation<NavigationProp>()

  const lastNavAction = useRef<PerformNavigationConfig<ParamList>>()

  const nativeNavigation: NavigationProp =
    options?.customNavigation ?? defaultNativeNavigation

  // Prevent duplicate pushes by de-duping
  // navigation actions
  const performCustomPush = useCallback(
    (...config: PerformNavigationConfig<ParamList>) => {
      if (!isEqual(lastNavAction.current, config)) {
        ;(nativeNavigation as NativeStackNavigationProp<any>).push(...config)
        lastNavAction.current = config
        setTimeout(() => {
          lastNavAction.current = undefined
        }, 500)
      }
    },
    [nativeNavigation, lastNavAction]
  )

  return useMemo(
    () => ({
      ...nativeNavigation,
      push:
        'push' in nativeNavigation
          ? performCustomPush
          : () => {
              console.error('Push is not implemented for this navigator')
            }
    }),
    [nativeNavigation, performCustomPush]
  )
}
