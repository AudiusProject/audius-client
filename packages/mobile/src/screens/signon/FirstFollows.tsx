import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as signOnActions from 'common/store/pages/signon/actions'
import {
  getEmailField,
  getHandleField,
  getFollowArtists
} from 'common/store/pages/signon/selectors'
import type {
  FollowArtists,
  EditableField
} from 'common/store/pages/signon/types'
import { SafeAreaView, View, Text } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { SuggestedFollows } from 'app/components/suggested-follows'
import { track, make } from 'app/services/analytics'
import { EventNames } from 'app/types/analytics'

import type { SignOnStackParamList } from './types'

const messages = {
  title: 'Follow At Least 3 Artists To Get Started'
}

export type FirstFollowsProps = NativeStackScreenProps<
  SignOnStackParamList,
  'FirstFollows'
>
const FirstFollows = ({ navigation }: FirstFollowsProps) => {
  const dispatch = useDispatch()

  const emailField: EditableField = useSelector(getEmailField)
  const handleField: EditableField = useSelector(getHandleField)
  const followArtists: FollowArtists = useSelector(getFollowArtists)
  const { selectedUserIds: followedArtistIds } = followArtists

  const onPressContinue = () => {
    dispatch(signOnActions.followArtists(followArtists.selectedUserIds))

    track(
      make({
        eventName: EventNames.CREATE_ACCOUNT_COMPLETE_FOLLOW,
        emailAddress: emailField.value,
        handle: handleField.value,
        users: followedArtistIds.join('|'),
        count: followedArtistIds.length
      })
    )

    navigation.replace('SignupLoadingPage')
  }

  return (
    <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
      <SuggestedFollows
        title={messages.title}
        onPress={onPressContinue}
        screen='sign-on'
      />
    </SafeAreaView>
  )
}

export default FirstFollows
