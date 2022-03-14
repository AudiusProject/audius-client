import { RouteProp, useRoute as useRouteRN } from '@react-navigation/core'

import { AppTabScreenParamList } from 'app/screens/app-screen'
import { ProfileTabParamList } from 'app/screens/app-screen/ProfileTab'

export const useRoute = <RouteName extends keyof AppTabScreenParamList>() => {
  return useRouteRN<RouteProp<AppTabScreenParamList, RouteName>>()
}

export const useProfileRoute = <
  RouteName extends keyof ProfileTabParamList
>() => {
  return useRouteRN<RouteProp<ProfileTabParamList, RouteName>>()
}
