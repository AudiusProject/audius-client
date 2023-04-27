import type { User } from '@audius/common'
import {
  chatSelectors,
  cacheUsersSelectors,
  ChatPermissionAction
} from '@audius/common'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconMessageLocked from 'app/assets/images/iconMessageLocked.svg'
import IconTip from 'app/assets/images/iconTip.svg'
import { Text, Button } from 'app/components/core'
import { NativeDrawer } from 'app/components/drawer'
import { getData } from 'app/store/drawers/selectors'
import { setVisibility } from 'app/store/drawers/slice'
import { makeStyles, flexRowCentered } from 'app/styles'
import { useColor } from 'app/utils/theme'

import { UserBadges } from '../user-badges'

const { getCanChat } = chatSelectors
const { getUser } = cacheUsersSelectors

const INBOX_UNAVAILABLE_MODAL_NAME = 'InboxUnavailable'

const messages = {
  title: 'Inbox Unavailable',
  blockee: 'You cannot send messages to users you have blocked.',
  tipGated1: 'You must send ',
  tipGated2: ' a tip before you can send them messages.',
  noAction: 'You can no longer send messages to ',
  info: 'This will not affect their ability to view your profile or interact with your content.',
  learnMore: 'Learn More',
  sendAudio: 'Send $AUDIO'
}

const useStyles = makeStyles(({ spacing, typography, palette }) => ({
  drawer: {
    marginTop: spacing(2),
    marginBottom: spacing(5),
    padding: spacing(3.5),
    gap: spacing(4)
  },
  titleContainer: {
    ...flexRowCentered(),
    gap: spacing(3.5),
    alignSelf: 'center'
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontByWeight.heavy,
    color: palette.neutralLight2,
    textTransform: 'uppercase',
    lineHeight: typography.fontSize.xl * 1.25
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(4.5),
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(4),
    backgroundColor: palette.neutralLight9,
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    borderRadius: spacing(2)
  },
  callToActionText: {
    color: palette.neutral,
    fontSize: typography.fontSize.large,
    fontFamily: typography.fontByWeight.medium,
    lineHeight: typography.fontSize.large * 1.3,
    textAlign: 'center'
  },
  button: {
    padding: spacing(4),
    height: spacing(12)
  },
  buttonText: {
    color: palette.neutral,
    fontSize: typography.fontSize.large,
    fontFamily: typography.fontByWeight.bold
  },
  buttonTextTip: {
    color: palette.white
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: palette.neutralLight8
  }
}))

const getCallToActionText = (
  callToAction: ChatPermissionAction,
  user: User,
  styles: ReturnType<typeof useStyles>
) => {
  switch (callToAction) {
    case ChatPermissionAction.NONE:
      return (
        <>
          {messages.noAction}
          <UserBadges
            user={user}
            nameStyle={styles.callToActionText}
            as={Text}
          />
        </>
      )
    case ChatPermissionAction.TIP:
      return (
        <>
          {messages.tipGated1}
          {user.name}
          <UserBadges user={user} hideName />
          {messages.tipGated2}
        </>
      )
    case ChatPermissionAction.UNBLOCK:
      return <>{messages.blockee}</>
    default:
      return ''
  }
}

export const InboxUnavailableDrawer = () => {
  const styles = useStyles()
  const neutralLight2 = useColor('neutralLight2')
  const dispatch = useDispatch()
  const { userId } = useSelector((state) => getData<'InboxUnavailable'>(state))
  const { callToAction } = useSelector((state) => getCanChat(state, userId))
  const isTipGated = callToAction === ChatPermissionAction.TIP
  const user = useSelector((state) => getUser(state, { id: userId }))

  const handleLearnMorePress = () => {
    dispatch(
      setVisibility({
        drawer: 'InboxUnavailable',
        visible: false
      })
    )
  }

  if (!user) return

  return (
    <NativeDrawer drawerName={INBOX_UNAVAILABLE_MODAL_NAME}>
      <View style={styles.drawer}>
        <View style={styles.titleContainer}>
          <IconMessageLocked fill={neutralLight2} />
          <Text style={styles.title}>{messages.title}</Text>
        </View>
        <View style={styles.border} />
        <Text style={styles.callToActionText}>
          {getCallToActionText(callToAction, user, styles)}
        </Text>
        <Button
          title={isTipGated ? messages.sendAudio : messages.learnMore}
          onPress={handleLearnMorePress}
          variant={isTipGated ? 'primary' : 'common'}
          styles={{
            root: styles.button,
            text: [styles.buttonText, isTipGated ? styles.buttonTextTip : null]
          }}
          icon={isTipGated ? IconTip : undefined}
          iconPosition='left'
          fullWidth
        />
      </View>
    </NativeDrawer>
  )
}
