import { StyleSheet, View } from 'react-native'

import { NativeDrawer } from 'app/components/drawer'
import Text from 'app/components/text'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { ThemeColors } from 'app/utils/theme'

const DRAWER_NAME = 'EditPlaylistRemoveTrackConfirmation'
const messages = {
  confirmTitle: 'Are You Sure',
  confirm: (title: string) =>
    `Do you want to remove ${title} from this playlist?`,
  buttonConfirm: 'RemoveTrack',
  buttonGoBack: 'Nevermind'
}

const createStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    customDrawerTitle: {
      maxHeight: 500,
      zIndex: 1000,
      borderBottomColor: themeColors.neutralLight8,
      borderBottomWidth: 1
    },
    customDrawerTitleHeader: {
      marginTop: 8,
      marginBottom: 16,
      textAlign: 'center',
      fontSize: 18
    },
    customDrawerTitleWarning: {
      paddingBottom: 24,
      textAlign: 'center',
      fontSize: 18,
      color: themeColors.accentRed
    }
  })

type EditPlaylistRemoveTrackConfirmationDrawerProps = {
  //   onConfirm: () => void
  //   title: string
}

export const EditPlaylistRemoveTrackConfirmationDrawer = ({}: EditPlaylistRemoveTrackConfirmationDrawerProps) => {
  const styles = useThemedStyles(createStyles)

  return (
    <NativeDrawer
      drawerName={DRAWER_NAME}
      //   rows={[
      //     {
      //       text: messages.buttonConfirm,
      //       isDestructive: true,
      //       callback: onConfirm
      //     },
      //     {
      //       text: messages.buttonGoBack
      //     }
      //   ]}
    >
      <View style={styles.customDrawerTitle}>
        <Text weight={'bold'} style={styles.customDrawerTitleHeader}>
          {messages.confirmTitle}
        </Text>
        <Text weight={'demiBold'} style={styles.customDrawerTitleWarning}>
          {messages.confirm('test')}
        </Text>
      </View>
    </NativeDrawer>
  )
}
