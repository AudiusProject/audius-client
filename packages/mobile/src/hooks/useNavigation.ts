import { useCallback, useMemo, useState } from 'react'

import type { ExtractTypeParam } from '@audius/common'
import type {
  ParamListBase,
  NavigationProp as RNNavigationProp
} from '@react-navigation/native'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { isEqual } from 'lodash'

import type { AppTabScreenParamList } from 'app/screens/app-screen/AppTabScreen'

export type ContextualParams = {
  fromNotifications?: boolean
}

export type ContextualizedParamList<ParamList extends ParamListBase> = {
  [K in keyof ParamList]: ParamList[K] & ContextualParams
}

type PerformNavigationConfig<
  NavigationProp extends RNNavigationProp<any>,
  ParamList = ExtractTypeParam<NavigationProp>,
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
 *
 * Overloaded to support supplying only a ParamList type parameter
 * or the entire NavigationProp itself
 * @param options
 */
export function useNavigation<
  ParamList extends ParamListBase,
  NavigationProp extends RNNavigationProp<any> = NativeStackNavigationProp<ParamList>
>(options?: UseNavigationOptions<NavigationProp>): NavigationProp
export function useNavigation<
  NavigationProp extends RNNavigationProp<any> = NativeStackNavigationProp<
    ContextualizedParamList<AppTabScreenParamList>
  >
>(options?: UseNavigationOptions<NavigationProp>): NavigationProp {
  const defaultNativeNavigation = useNativeNavigation<NavigationProp>()

  const [lastNavAction, setLastNavAction] =
    useState<PerformNavigationConfig<NavigationProp>>()

  const nativeNavigation: NavigationProp =
    options?.customNavigation ?? defaultNativeNavigation

  // Prevent duplicate pushes by de-duping
  // navigation actions
  const performCustomPush = useCallback(
    (...config: PerformNavigationConfig<NavigationProp>) => {
      if (!isEqual(lastNavAction, config)) {
        ;(nativeNavigation as NativeStackNavigationProp<any>).push(...config)
        setLastNavAction(config)
        setTimeout(() => setLastNavAction(undefined), 500)
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
