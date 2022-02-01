import { useCallback } from 'react'

import {
  getModalVisibility,
  setVisibility
} from 'audius-client/src/common/store/ui/modals/slice'
import { StyleSheet, View } from 'react-native'

import Drawer from 'app/components/drawer'
import GradientText from 'app/components/gradient-text'
import Text from 'app/components/text'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { ThemeColors } from 'app/utils/theme'

const MODAL_NAME = 'MobileEditCollectiblesDrawer'

const messages = {
  title: 'Edit Collectibles',
  text:
    'Visit audius.co from a desktop browser to hide and sort your NFT collectibles.'
}

const createStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    container: {
      paddingVertical: 48,
      paddingHorizontal: 16
    },

    title: {
      textAlign: 'center',
      fontSize: 28,
      marginVertical: 24
    },

    text: {
      textAlign: 'center',
      fontSize: 24,
      lineHeight: 30
    }
  })

export const EditCollectiblesDrawer = () => {
  const styles = useThemedStyles(createStyles)
  const isOpen = useSelectorWeb(state => getModalVisibility(state, MODAL_NAME))
  const dispatchWeb = useDispatchWeb()

  const handleClose = useCallback(() => {
    dispatchWeb(setVisibility({ modal: MODAL_NAME, visible: false }))
  }, [dispatchWeb])

  return (
    <Drawer onClose={handleClose} isOpen={isOpen}>
      <View style={styles.container}>
        <GradientText text={messages.title} style={styles.title} />
        <Text style={styles.text} weight='medium'>
          {messages.text}
        </Text>
      </View>
    </Drawer>
  )
}
