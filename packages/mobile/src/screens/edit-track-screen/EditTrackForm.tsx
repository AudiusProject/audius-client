import { useCallback, useEffect } from 'react'

import type { UploadTrack } from '@audius/common'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Keyboard } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useDispatch } from 'react-redux'
import { useAsync } from 'react-use'

import IconArrow from 'app/assets/images/iconArrow.svg'
import IconCaretRight from 'app/assets/images/iconCaretRight.svg'
import IconUpload from 'app/assets/images/iconUpload.svg'
import { Button, Tile } from 'app/components/core'
import { InputErrorMessage } from 'app/components/core/InputErrorMessage'
import { useIsGatedContentEnabled } from 'app/hooks/useIsGatedContentEnabled'
import { useIsSpecialAccessEnabled } from 'app/hooks/useIsSpecialAccessEnabled'
import { useNavigation } from 'app/hooks/useNavigation'
import { setVisibility } from 'app/store/drawers/slice'
import { makeStyles } from 'app/styles'

import { TopBarIconButton } from '../app-screen'

import { CancelEditTrackDrawer, FormScreen } from './components'
import {
  PickArtworkField,
  SelectGenreField,
  TextField,
  DescriptionField,
  SelectMoodField,
  TagField,
  SubmenuList,
  RemixSettingsField,
  AdvancedOptionsField
} from './fields'
import type { EditTrackFormProps } from './types'
import type { Drawer as DrawerName } from 'app/store/drawers/slice'

const messages = {
  trackName: 'Track Name',
  trackNameError: 'Track Name Required',
  fixErrors: 'Fix Errors To Continue'
}

const GATED_CONTENT_UPLOAD_PROMPT_DRAWER_SEEN_KEY =
  'gated_content_upload_prompt_drawer_seen'

const useStyles = makeStyles(({ spacing }) => ({
  backButton: {
    transform: [{ rotate: '180deg' }],
    marginLeft: -6
  },
  tile: {
    margin: spacing(3)
  },
  errorText: {
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: spacing(4)
  }
}))

export type EditTrackParams = UploadTrack

type UseOneTimeDrawerProps = {
  key: string // AsyncStorage key
  name: DrawerName
  disabled?: boolean
}

const useOneTimeDrawer = ({ key, name, disabled = false }: UseOneTimeDrawerProps) => {
  if (disabled) return

  const dispatch = useDispatch()
  const { value: seen, loading } = useAsync(() =>
    AsyncStorage.getItem(key)
  )

  useEffect(() => {
    const shouldOpen = !loading && !seen
    if (shouldOpen) {
      dispatch(
        setVisibility({ drawer: name, visible: true })
      )
      AsyncStorage.setItem(key, 'true')
    }
  }, [loading, seen, dispatch])
}

export const EditTrackForm = (props: EditTrackFormProps) => {
  const {
    handleSubmit,
    isSubmitting,
    errors,
    touched,
    dirty,
    title,
    doneText
  } = props
  const errorsKeys = Object.keys(errors)
  const hasErrors =
    errorsKeys.length > 0 && errorsKeys.every((errorKey) => touched[errorKey])
  const styles = useStyles()
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const isGatedContentEnabled = useIsGatedContentEnabled()
  const isSpecialAccessEnabled = useIsSpecialAccessEnabled()

  useOneTimeDrawer({
    key: GATED_CONTENT_UPLOAD_PROMPT_DRAWER_SEEN_KEY,
    name: 'GatedContentUploadPrompt',
    disabled: !isGatedContentEnabled || !isSpecialAccessEnabled
  })

  const handlePressBack = useCallback(() => {
    if (!dirty) {
      navigation.goBack()
    } else {
      Keyboard.dismiss()
      dispatch(
        setVisibility({
          drawer: 'CancelEditTrack',
          visible: true
        })
      )
    }
  }, [dirty, navigation, dispatch])

  return (
    <FormScreen
      title={title}
      icon={IconUpload}
      topbarLeft={
        <TopBarIconButton
          icon={IconCaretRight}
          style={styles.backButton}
          onPress={handlePressBack}
        />
      }
      bottomSection={
        <>
          {hasErrors ? (
            <InputErrorMessage
              message={messages.fixErrors}
              style={styles.errorText}
            />
          ) : null}
          <Button
            variant='primary'
            size='large'
            icon={IconArrow}
            fullWidth
            title={doneText}
            onPress={() => {
              handleSubmit()
            }}
            disabled={isSubmitting || hasErrors}
          />
        </>
      }
    >
      <>
        <KeyboardAwareScrollView>
          <Tile style={styles.tile}>
            <PickArtworkField />
            <TextField
              name='title'
              label={messages.trackName}
              required
              errorMessage={messages.trackNameError}
            />
            <SubmenuList>
              <SelectGenreField />
              <SelectMoodField />
            </SubmenuList>
            <TagField />
            <DescriptionField />
            <SubmenuList removeBottomDivider>
              <RemixSettingsField />
              <AdvancedOptionsField />
            </SubmenuList>
          </Tile>
        </KeyboardAwareScrollView>
        <CancelEditTrackDrawer />
      </>
    </FormScreen>
  )
}
