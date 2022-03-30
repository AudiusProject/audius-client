import { useCallback } from 'react'

import { useNavigation } from '@react-navigation/native'

import { Screen, ScreenProps } from '../core/Screen'
import { TextButton } from '../core/TextButton'

const messages = {
  cancel: 'Cancel',
  save: 'Save'
}

type FormScreenProps = ScreenProps & {
  onSubmit: () => void
  onReset: () => void
}

export const FormScreen = (props: FormScreenProps) => {
  const { onSubmit, onReset, ...other } = props

  const navigation = useNavigation()

  const handleCancel = useCallback(() => {
    onReset()
    navigation.goBack()
  }, [navigation, onReset])

  const handleSave = useCallback(() => {
    onSubmit()
    navigation.goBack()
  }, [onSubmit, navigation])

  const topbarLeft = (
    <TextButton
      title={messages.cancel}
      variant='secondary'
      onPress={handleCancel}
    />
  )

  const topbarRight = (
    <TextButton title={messages.save} variant='primary' onPress={handleSave} />
  )

  return (
    <Screen
      variant={'white'}
      topbarLeft={topbarLeft}
      topbarRight={topbarRight}
      {...other}
    />
  )
}
