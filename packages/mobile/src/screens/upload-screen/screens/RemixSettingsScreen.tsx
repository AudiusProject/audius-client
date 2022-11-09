import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  remixSettingsActions,
  remixSettingsSelectors,
  Status
} from '@audius/common'
import { useRoute } from '@react-navigation/native'
import { debounce } from 'lodash'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconRemix from 'app/assets/images/iconRemix.svg'
import type { TextProps } from 'app/components/core'
import {
  Pill,
  Tag,
  ErrorText,
  TextInput,
  Divider,
  Button,
  Switch,
  Text
} from 'app/components/core'
import { InputErrorMessage } from 'app/components/core/InputErrorMessage'
import { useNavigation } from 'app/hooks/useNavigation'
import { dispatch } from 'app/store'
import { makeStyles } from 'app/styles'

import type { UploadRouteProp } from '../ParamList'
import { UploadStackScreen } from '../UploadStackScreen'

const { getTrack, getUser, getStatus } = remixSettingsSelectors
const { fetchTrack, fetchTrackSucceeded, reset } = remixSettingsActions

const remixLinkInputDebounceMs = 1000

const messages = {
  screenTitle: 'Remix Settings',
  isRemixLabel: 'This Track is a Remix',
  isRemixLinkDescription: 'Paste the link to the Audius track you’ve remixed',
  hideRemixLabel: 'Hide Remixes on Track Page',
  hideRemixDescription:
    'Hide remixes of this track to prevent them showing on your track page.',
  done: 'Done',
  invalidRemixLink: 'Please paste a valid Audius track URL',
  trackBy: 'by'
}

const useStyles = makeStyles(({ spacing }) => ({
  setting: {
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(8)
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(5)
  }
}))

const labelProps: TextProps = {
  fontSize: 'large',
  weight: 'demiBold'
}

const descriptionProps: TextProps = {
  fontSize: 'large',
  weight: 'medium'
}

export type RemixSettingsValue = {
  remixOf: string
  remixesVisible: boolean
}

export type RemixSettingsParams = {
  value: RemixSettingsValue
  onChange: (value: Partial<RemixSettingsValue>) => void
}

export const RemixSettingsScreen = () => {
  const styles = useStyles()
  const { params } = useRoute<UploadRouteProp<'RemixSettings'>>()
  const { value, onChange } = params
  const [isTrackRemix, setIsTrackRemix] = useState(Boolean(value.remixOf))
  const [remixOf, setRemixOf] = useState(value.remixOf)
  const [hideRemixes, setHideRemixes] = useState(!value.remixesVisible)
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const parentTrack = useSelector(getTrack)
  const parentTrackArtist = useSelector(getUser)
  const parentTrackStatus = useSelector(getStatus)
  const isInvalidParentTrack = parentTrackStatus === Status.ERROR

  const handleRemixLink = useMemo(
    () =>
      debounce(
        (url: string) => {
          console.log('calling fetch track')
          dispatch(fetchTrack({ url: decodeURI(url) }))
        },
        remixLinkInputDebounceMs,
        { leading: true, trailing: false }
      ),
    [dispatch]
  )

  const handleSubmit = useCallback(() => {
    onChange({ remixOf, remixesVisible: !hideRemixes })
    navigation.goBack()
  }, [onChange, remixOf, hideRemixes, navigation])

  useEffect(() => {
    setRemixOf(parentTrack?.permalink ?? null)
  }, [parentTrack])

  return (
    <UploadStackScreen
      title={messages.screenTitle}
      icon={IconRemix}
      variant='white'
      bottomSection={
        <Button
          variant='primary'
          size='large'
          fullWidth
          title={messages.done}
          onPress={handleSubmit}
          disabled={isInvalidParentTrack}
        />
      }
    >
      <View>
        <View style={styles.setting}>
          <View style={styles.option}>
            <Text {...labelProps}>{messages.isRemixLabel}</Text>
            <Switch value={isTrackRemix} onValueChange={setIsTrackRemix} />
          </View>
          {isTrackRemix ? (
            <View>
              <Text {...descriptionProps}>
                {messages.isRemixLinkDescription}
              </Text>
              <TextInput value={remixOf} onChangeText={handleRemixLink} />
              {parentTrack && parentTrackArtist ? (
                <Pill>
                  <Text>{parentTrack.title}</Text>
                  {messages.trackBy}
                  <Text>{parentTrackArtist.name}</Text>
                </Pill>
              ) : null}
              {isInvalidParentTrack ? (
                <InputErrorMessage message={messages.invalidRemixLink} />
              ) : null}
            </View>
          ) : null}
        </View>
        <Divider />
        <View style={styles.setting}>
          <View style={styles.option}>
            <Text {...labelProps}>{messages.hideRemixLabel}</Text>
            <Switch value={hideRemixes} onValueChange={setHideRemixes} />
          </View>
          <Text {...descriptionProps}>{messages.hideRemixDescription}</Text>
        </View>
        <Divider />
      </View>
    </UploadStackScreen>
  )
}
