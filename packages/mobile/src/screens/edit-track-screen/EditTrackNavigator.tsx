import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { FormikProps } from 'formik'

import { useAppScreenOptions } from 'app/screens/app-screen/useAppScreenOptions'

import type { FormValues } from '../upload-screen/types'

import { EditTrackForm } from './EditTrackForm'
import {
  AdvancedOptionsScreen,
  IsrcIswcScreen,
  LicenseTypeScreen,
  RemixSettingsScreen,
  SelectGenreScreen,
  SelectMoodScreen,
  TrackVisibilityScreen
} from './screens'

const Stack = createNativeStackNavigator()

const screenOptionOverrides = { headerRight: () => null }

export const EditTrackNavigator = (props: FormikProps<FormValues>) => {
  const screenOptions = useAppScreenOptions(screenOptionOverrides)

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name='CompleteTrackForm'>
        {() => <EditTrackForm {...props} />}
      </Stack.Screen>
      <Stack.Screen name='SelectGenre' component={SelectGenreScreen} />
      <Stack.Screen name='SelectMood' component={SelectMoodScreen} />
      <Stack.Screen name='RemixSettings' component={RemixSettingsScreen} />
      <Stack.Screen name='AdvancedOptions' component={AdvancedOptionsScreen} />
      <Stack.Screen name='TrackVisibility' component={TrackVisibilityScreen} />
      <Stack.Screen name='IsrcIswc' component={IsrcIswcScreen} />
      <Stack.Screen name='LicenseType' component={LicenseTypeScreen} />
    </Stack.Navigator>
  )
}
