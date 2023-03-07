import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Nullable, PremiumConditions } from '@audius/common'
import {
  createRemixOfMetadata,
  remixSettingsActions,
  remixSettingsSelectors,
  Status
} from '@audius/common'
import { useFocusEffect } from '@react-navigation/native'
import { useField } from 'formik'
import { debounce } from 'lodash'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconRemix from 'app/assets/images/iconRemix.svg'
import type { TextProps } from 'app/components/core'
import { TextInput, Divider, Button, Switch, Text } from 'app/components/core'
import { InputErrorMessage } from 'app/components/core/InputErrorMessage'
import { HelpCallout } from 'app/components/help-callout/HelpCallout'
import { useIsPremiumContentEnabled } from 'app/hooks/useIsPremiumContentEnabled'
import { useNavigation } from 'app/hooks/useNavigation'
import { makeStyles } from 'app/styles'
import { getTrackRoute } from 'app/utils/routes'

import { FormScreen, RemixTrackPill } from '../components'
import type { RemixOfField } from '../types'

const { getTrack, getUser, getStatus } = remixSettingsSelectors
const { fetchTrack, fetchTrackSucceeded, reset } = remixSettingsActions

const remixLinkInputDebounceMs = 1000

const messages = {
  screenTitle: 'Remix Settings',
  isRemixLabel: 'This Track is a Remix',
  markRemix: 'Mark This Track as a Remix',
  isRemixLinkDescription: 'Paste the link to the Audius track you’ve remixed.',
  hideRemixLabel: 'Hide Remixes on Track Page',
  hideRemixesDescription:
    'Enabling this option will prevent other user’s remixes from appearing on your track page.',
  hideRemixes: 'Hide Remixes of this Track',
  hideRemixDescription:
    'Hide remixes of this track to prevent them from showing on your track page.',
  done: 'Done',
  invalidRemixUrl: 'Please paste a valid Audius track URL',
  missingRemixUrl: 'Must include a link to the original track',
  remixUrlPlaceholder: 'Track URL',
  enterLink: 'Enter an Audius Link',
  changeAvailbilityPrefix: 'Availablity is set to ',
  changeAvailbilitySuffix:
    'To enable these options, change availability to Public.',
  collectibleGated: 'Collectible Gated. ',
  specialAccess: 'Special Access. '
}

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  setting: {
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(8)
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(5)
  },
  inputRoot: {
    marginTop: spacing(4),
    paddingVertical: spacing(4),
    paddingLeft: spacing(4)
  },
  input: {
    fontSize: typography.fontSize.large
  },
  changeAvailability: {
    marginBottom: spacing(16)
  },
  changeAvailabilityText: {
    flexDirection: 'row',
    flexWrap: 'wrap'
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

export const RemixSettingsScreen = () => {
  const isGatedContentEnabled = useIsPremiumContentEnabled()
  const styles = useStyles()
  const [{ value: remixOf }, , { setValue: setRemixOf }] =
    useField<RemixOfField>('remix_of')
  const [{ value: remixesVisible }, , { setValue: setRemixesVisible }] =
    useField<boolean>('field_visibility.remixes')
  const [{ value: isPremium }] = useField<boolean>('is_premium')
  const [{ value: premiumConditions }] =
    useField<Nullable<PremiumConditions>>('premium_conditions')
  const isCollectibleGated = 'nft_collection' in (premiumConditions ?? {})

  const parentTrackId = remixOf?.tracks[0].parent_track_id
  const [isTrackRemix, setIsTrackRemix] = useState(Boolean(parentTrackId))
  const [remixOfInput, setRemixOfInput] = useState('')
  const [isRemixUrlMissing, setIsRemixUrlMissing] = useState(false)
  const [isTouched, setIsTouched] = useState(false)
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const parentTrack = useSelector(getTrack)
  const parentTrackArtist = useSelector(getUser)
  const parentTrackStatus = useSelector(getStatus)
  const isInvalidParentTrack = parentTrackStatus === Status.ERROR

  useEffect(() => {
    if (isPremium) {
      setRemixOf(null)
      setRemixesVisible(false)
    } else {
      setRemixesVisible(true)
    }
    // adding the useField setters cause infinite rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium])

  const handleFetchParentTrack = useMemo(
    () =>
      debounce(
        (url: string) => {
          dispatch(fetchTrack({ url: decodeURI(url) }))
        },
        remixLinkInputDebounceMs,
        { leading: true, trailing: false }
      ),
    [dispatch]
  )

  const handleFocusScreen = useCallback(() => {
    const initialParentTrackId = parentTrackId
    if (initialParentTrackId) {
      dispatch(fetchTrackSucceeded({ trackId: initialParentTrackId }))
    }
    return () => {
      dispatch(reset())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleFetchParentTrack, dispatch])

  useFocusEffect(handleFocusScreen)

  const handleChangeLink = useCallback(
    (value: string) => {
      setRemixOfInput(value)
      handleFetchParentTrack(value)
      setIsRemixUrlMissing(false)
    },
    [handleFetchParentTrack]
  )

  const handleChangeIsRemix = useCallback((isRemix: boolean) => {
    setIsTrackRemix(isRemix)
    if (!isRemix) {
      setIsRemixUrlMissing(false)
    }
  }, [])

  const handleSubmit = useCallback(() => {
    if (isTrackRemix && !remixOf) {
      setIsRemixUrlMissing(true)
    } else {
      navigation.goBack()
      dispatch(reset())
    }
  }, [navigation, dispatch, isTrackRemix, remixOf])

  useEffect(() => {
    if (isTrackRemix && parentTrack && parentTrack.track_id !== parentTrackId) {
      setRemixOf(createRemixOfMetadata({ parentTrackId: parentTrack.track_id }))
    } else if (!isTrackRemix) {
      setRemixOf(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentTrack, isTrackRemix])

  const handleFocus = useCallback(() => {
    setIsTouched(true)
  }, [])

  useEffect(() => {
    if (!remixOfInput && !isTouched && parentTrack) {
      setRemixOfInput(getTrackRoute(parentTrack, true))
    }
  }, [remixOfInput, isTouched, parentTrack])

  const hasErrors = Boolean(
    isTrackRemix && (isInvalidParentTrack || isRemixUrlMissing)
  )

  return (
    <FormScreen
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
          disabled={hasErrors}
        />
      }
    >
      <View>
        <View style={styles.setting}>
          {isPremium ? (
            <HelpCallout
              style={styles.changeAvailability}
              content={
                <View style={styles.changeAvailabilityText}>
                  <Text>{messages.changeAvailbilityPrefix}</Text>
                  <Text>
                    {isCollectibleGated
                      ? messages.collectibleGated
                      : messages.specialAccess}
                  </Text>
                  <Text>{messages.changeAvailbilitySuffix}</Text>
                </View>
              }
            />
          ) : null}
          <View style={styles.option}>
            <Text {...labelProps}>
              {isGatedContentEnabled
                ? messages.markRemix
                : messages.isRemixLabel}
            </Text>
            <Switch
              value={isTrackRemix}
              onValueChange={handleChangeIsRemix}
              isDisabled={isPremium}
            />
          </View>
          {isTrackRemix ? (
            <View>
              <Text {...descriptionProps}>
                {messages.isRemixLinkDescription}
              </Text>
              <TextInput
                styles={{ root: styles.inputRoot, input: styles.input }}
                value={remixOfInput}
                onChangeText={handleChangeLink}
                placeholder={
                  isGatedContentEnabled
                    ? messages.enterLink
                    : messages.remixUrlPlaceholder
                }
                onFocus={handleFocus}
                returnKeyType='done'
              />
              {parentTrack && parentTrackArtist && !isInvalidParentTrack ? (
                <RemixTrackPill track={parentTrack} user={parentTrackArtist} />
              ) : null}
              {hasErrors ? (
                <InputErrorMessage
                  message={
                    isInvalidParentTrack
                      ? messages.invalidRemixUrl
                      : messages.missingRemixUrl
                  }
                />
              ) : null}
            </View>
          ) : null}
        </View>
        <Divider />
        <View style={styles.setting}>
          <View style={styles.option}>
            <Text {...labelProps}>
              {isGatedContentEnabled
                ? messages.hideRemixes
                : messages.hideRemixLabel}
            </Text>
            <Switch
              value={!remixesVisible}
              onValueChange={(value) => setRemixesVisible(!value)}
              isDisabled={isPremium}
            />
          </View>
          <Text {...descriptionProps}>
            {isGatedContentEnabled
              ? messages.hideRemixesDescription
              : messages.hideRemixDescription}
          </Text>
        </View>
        <Divider />
      </View>
    </FormScreen>
  )
}
