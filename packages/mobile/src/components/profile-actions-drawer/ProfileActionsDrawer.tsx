import { ShareSource, shareModalUIActions } from '@audius/common'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { Text } from 'app/components/core'
import { NativeDrawer } from 'app/components/drawer'
import { getData } from 'app/store/drawers/selectors'
import { setVisibility } from 'app/store/drawers/slice'
import { makeStyles } from 'app/styles'
const { requestOpen: requestOpenShareModal } = shareModalUIActions

const PROFILE_ACTIONS_MODAL_NAME = 'ProfileActions'

const messages = {
  visitProfile: 'Visit Profile',
  blockMessages: 'Block Messages'
}

const useStyles = makeStyles(({ spacing, typography, palette }) => ({
  drawer: {
    marginVertical: spacing(7),
    alignItems: 'center'
  },
  text: {
    fontSize: 21,
    lineHeight: spacing(6.5),
    letterSpacing: 0.233333,
    fontWeight: 700,
    color: palette.secondary,
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: palette.neutralLight9
  }
}))

export const ProfileActionsDrawer = () => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const userId = useSelector(getData)

  const handleShareProfilePress = () => {
    dispatch(
      setVisibility({
        drawer: 'ProfileActions',
        visible: false
      })
    )
    dispatch(
      requestOpenShareModal({
        type: 'profile',
        profileId: userId,
        source: ShareSource.PAGE
      })
    )
  }

  const handleBlockMessagesPress = () => {
    dispatch(
      setVisibility({
        drawer: 'ProfileActions',
        visible: false
      })
    )
    dispatch(
      setVisibility({
        type: 'blockMessages',
        visible: 'true',
        userId
      })
    )
  }

  return (
    <NativeDrawer drawerName={PROFILE_ACTIONS_MODAL_NAME}>
      <View style={styles.drawer}>
        <Text style={styles.text} onPress={handleShareProfilePress}>
          {messages.shareProfile}
        </Text>
        <Text style={styles.text} onPress={handleBlockMessagesPress}>
          {messages.blockMessages}
        </Text>
      </View>
    </NativeDrawer>
  )
}
