import type { ReactElement, ReactNode } from 'react'
import { useLayoutEffect, useState } from 'react'

import { Keyboard, Platform, View } from 'react-native'

import type { ScreenProps } from 'app/components/core'
import { Button, Screen } from 'app/components/core'
import { useNavigation } from 'app/hooks/useNavigation'
import { makeStyles } from 'app/styles'

const messages = {
  done: 'Done'
}

type FormScreenProps = Omit<ScreenProps, 'children'> & {
  bottomSection?: ReactNode
  children: ReactElement
}

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: { justifyContent: 'space-between' },
  bottomSection: {
    paddingHorizontal: spacing(4),
    paddingTop: spacing(6),
    paddingBottom: spacing(12),
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.neutralLight6
  }
}))

export const FormScreen = (props: FormScreenProps) => {
  const { children, bottomSection, style: styleProp, ...other } = props
  const styles = useStyles()
  const navigation = useNavigation()
  const [hideBottomSection, setHideBottomSection] = useState(false)

  // // On android, explicitly hide bottomSection when keydoard shown.
  // // This will prevent users from accidently pressing "continue".
  useLayoutEffect(() => {
    if (Platform.OS === 'android') {
      const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
        setHideBottomSection(true)
      })

      const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
        setHideBottomSection(false)
      })

      return () => {
        showSubscription.remove()
        hideSubscription.remove()
      }
    }
  }, [])

  const defaultBottomSection = (
    <Button
      variant='primary'
      size='large'
      fullWidth
      title={messages.done}
      onPress={navigation.goBack}
    />
  )

  return (
    <Screen variant='secondary' style={[styles.root, styleProp]} {...other}>
      {children}
      {hideBottomSection ? null : (
        <View style={styles.bottomSection}>
          {bottomSection ?? defaultBottomSection}
        </View>
      )}
    </Screen>
  )
}
