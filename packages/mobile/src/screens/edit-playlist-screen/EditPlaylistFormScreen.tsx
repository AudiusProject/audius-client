import type { ReactElement, ReactNode } from 'react'

import { Text, View } from 'react-native'
import { useSelector } from 'react-redux'

import type { ScreenProps } from 'app/components/core'
import { ScreenContent, Button, Screen } from 'app/components/core'
import { useNavigation } from 'app/hooks/useNavigation'
import { getIsKeyboardOpen } from 'app/store/keyboard/selectors'
import { makeStyles } from 'app/styles'

const messages = {
  cancel: 'Cancel',
  save: 'Save'
}

type FormScreenProps = Omit<ScreenProps, 'children'> & {
  bottomSection?: ReactNode
  topSection?: ReactNode
  onReset: () => void
  onSubmit: () => void
  goBackOnSubmit: boolean
  children: ReactElement
}

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: { justifyContent: 'space-between' },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing(4)
  },
  bottomButton: {
    flexGrow: 1
  },
  topSection: {},
  bottomSection: {
    padding: spacing(4),
    paddingBottom: spacing(12),
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.neutralLight7
  }
}))

export const FormScreen = (props: FormScreenProps) => {
  const {
    children,
    bottomSection,
    topSection,
    style: styleProp,
    ...other
  } = props
  const styles = useStyles()
  const navigation = useNavigation()
  const isKeyboardOpen = useSelector(getIsKeyboardOpen)

  const defaultTopSection = (
    <View style={styles.buttonContainer}>
      <Text>Banana Bread</Text>
    </View>
  )

  const defaultBottomSection = (
    <View style={styles.buttonContainer}>
      <Button
        variant='commonAlt'
        size='large'
        style={styles.bottomButton}
        title={messages.cancel}
        onPress={navigation.goBack}
      />
      <Button
        variant='primary'
        size='large'
        style={styles.bottomButton}
        title={messages.save}
        onPress={navigation.goBack}
      />
    </View>
  )

  return (
    <Screen variant='secondary' style={[styles.root, styleProp]} {...other}>
      <ScreenContent>
        <View style={styles.topSection}>{topSection ?? defaultTopSection}</View>
        {children}
        {isKeyboardOpen ? null : (
          <View style={styles.bottomSection}>
            {bottomSection ?? defaultBottomSection}
          </View>
        )}
      </ScreenContent>
    </Screen>
  )
}
