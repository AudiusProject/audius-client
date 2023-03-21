import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { GatedContentUploadPromptDrawer } from 'app/components/gated-content-upload-prompt-drawer'
import { useIsGatedContentEnabled } from 'app/hooks/useIsGatedContentEnabled'
import { useAppScreenOptions } from 'app/screens/app-screen/useAppScreenOptions'

import { EditTrackForm } from './EditTrackForm'
import {
  AdvancedOptionsScreen,
  IsrcIswcScreen,
  LicenseTypeScreen,
  RemixSettingsScreen,
  SelectGenreScreen,
  SelectMoodScreen,
  TrackVisibilityScreen,
  TrackAvailabilityScreen
} from './screens'
import { NFTCollectionsScreen } from './screens/NFTCollectionsScreen'
import type { EditTrackFormProps } from './types'

const Stack = createNativeStackNavigator()

const screenOptionOverrides = { headerRight: () => null }

type EditTrackNavigatorProps = EditTrackFormProps

export const EditTrackNavigator = (props: EditTrackNavigatorProps) => {
  const isGatedContentEnabled = useIsGatedContentEnabled()
  const screenOptions = useAppScreenOptions(screenOptionOverrides)

  return (
    <>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name='CompleteTrackForm'>
          {() => <EditTrackForm {...props} />}
        </Stack.Screen>
        <Stack.Screen name='SelectGenre' component={SelectGenreScreen} />
        <Stack.Screen name='SelectMood' component={SelectMoodScreen} />
        <Stack.Screen name='RemixSettings' component={RemixSettingsScreen} />
        <Stack.Screen
          name='AdvancedOptions'
          component={AdvancedOptionsScreen}
        />
        {isGatedContentEnabled ? (
          <Stack.Screen name='Availability'>
            {() => (
              <TrackAvailabilityScreen initialValues={props.initialValues} />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen
            name='TrackVisibility'
            component={TrackVisibilityScreen}
          />
        )}
        {isGatedContentEnabled && (
          <Stack.Screen
            name='NFTCollections'
            component={NFTCollectionsScreen}
          />
        )}
        <Stack.Screen name='IsrcIswc' component={IsrcIswcScreen} />
        <Stack.Screen name='LicenseType' component={LicenseTypeScreen} />
      </Stack.Navigator>
      <GatedContentUploadPromptDrawer
        isUpload={!props.initialValues.track_id}
      />
    </>
  )
}
