import { useCallback, useMemo, useState } from 'react'

import type { ParamListBase } from '@react-navigation/native'
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
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList
> = [screen: RouteName, params?: ParamList[RouteName] & ContextualParams]

type UseNavigationOptions<ParamList extends ParamListBase> = {
  customNavigation?: NativeStackNavigationProp<
    ContextualizedParamList<ParamList>
  >
}

export const useNavigation = <
  ParamList extends ParamListBase = AppTabScreenParamList
>(
  options?: UseNavigationOptions<ParamList>
) => {
  const defaultNativeNavigation =
    useNativeNavigation<
      NativeStackNavigationProp<ContextualizedParamList<ParamList>>
    >()

  const [lastNavAction, setLastNavAction] =
    useState<PerformNavigationConfig<ParamList, keyof ParamList>>()

  // Allow navigation to be performed
  // without passing a `params` argument
  const performNavigation = useCallback(
    (method) =>
      <RouteName extends keyof ParamList>(
        ...config: PerformNavigationConfig<ParamList, RouteName>
      ) => {
        const [screen, params] = config
        method(screen, params)
      },
    []
  )
  const nativeNavigation: NativeStackNavigationProp<
    ContextualizedParamList<ParamList>
  > = options?.customNavigation ?? defaultNativeNavigation

  // Prevent duplicate pushes by de-duping
  // navigation actions
  const performCustomPush = useCallback(
    (...config: PerformNavigationConfig<ParamList, keyof ParamList>) => {
      if (!isEqual(lastNavAction, config)) {
        ;(nativeNavigation as any).push(...config)
        setLastNavAction(config)
        setTimeout(() => setLastNavAction(undefined), 500)
      }
    },
    [nativeNavigation, lastNavAction]
  )

  return useMemo(
    () => ({
      ...nativeNavigation,
      navigate: performNavigation(nativeNavigation.navigate),
      push:
        'push' in nativeNavigation
          ? performCustomPush
          : () => {
              console.error('Push is not implemented for this navigator')
            },
      replace:
        'replace' in nativeNavigation
          ? performNavigation(nativeNavigation.replace)
          : () => {
              console.error('Replace is not implemented for this navigator')
            }
    }),
    [nativeNavigation, performNavigation, performCustomPush]
  )
}
