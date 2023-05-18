import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'

import type { ID, User } from '@audius/common'
import {
  chatSelectors,
  chatActions,
  tippingActions,
  cacheUsersSelectors,
  ChatPermissionAction
} from '@audius/common'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconMessageLocked from 'app/assets/images/iconMessageLocked.svg'
import IconTip from 'app/assets/images/iconTip.svg'
import { Text, Button } from 'app/components/core'
import { NativeDrawer } from 'app/components/drawer'
import { useNavigation } from 'app/hooks/useNavigation'
import { getData } from 'app/store/drawers/selectors'
import { setVisibility } from 'app/store/drawers/slice'
import { makeStyles, flexRowCentered } from 'app/styles'
import { useColor } from 'app/utils/theme'

import { UserBadges } from '../user-badges'

const { unblockUser } = chatActions
const { getCanChat } = chatSelectors
const { getUser } = cacheUsersSelectors
const { beginTip } = tippingActions

const INBOX_UNAVAILABLE_MODAL_NAME = 'InboxUnavailable'

const messages = {
  title: 'Inbox Unavailable',
  blockee: 'You cannot send messages to users you have blocked.',
  tipGated: (displayName: ReactNode) => (
    <>
      {'You must send '}
      {displayName}
      {' a tip before you can send them messages.'}
    </>
  ),
  noAction: 'You can no longer send messages to ',
  info: 'This will not affect their ability to view your profile or interact with your content.',
  unblockUser: 'Unblock User',
  learnMore: 'Learn More',
  sendAudio: 'Send $AUDIO',
  cancel: 'Cancel'
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
  buttonTextWhite: {
    color: palette.white
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: palette.neutralLight8
  }
}))

const mapActionToContent = (
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
          {messages.tipGated(
            <UserBadges
              user={user}
              nameStyle={styles.callToActionText}
              as={Text}
            />
          )}
        </>
      )
    case ChatPermissionAction.UNBLOCK:
      return <>{messages.blockee}</>
    default:
      return null
  }
}

export const InboxUnavailableDrawer = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const styles = useStyles()
  const neutralLight2 = useColor('neutralLight2')

  const { userId } = useSelector((state) => getData<'InboxUnavailable'>(state))
  const user = useSelector((state) => getUser(state, { id: userId }))
  const { callToAction } = useSelector((state) => getCanChat(state, userId))

  const closeDrawer = useCallback(() => {
    dispatch(
      setVisibility({
        drawer: 'InboxUnavailable',
        visible: false
      })
    )
  }, [dispatch])

  const handleUnblockPress = useCallback(() => {
    dispatch(unblockUser({ userId }))
    closeDrawer()
  }, [dispatch, userId, closeDrawer])

  const handleLearnMorePress = useCallback(() => {
    // TODO: Link to blog
    closeDrawer()
  }, [closeDrawer])

  const handleTipPress = useCallback(() => {
    dispatch(beginTip({ user, source: 'profile' }))
    navigation.navigate('TipArtist')
  }, [dispatch, navigation, user])

  const actionToButtonsMap = useMemo(() => {
    return {
      [ChatPermissionAction.NONE]: [
        {
          buttonTitle: messages.learnMore,
          buttonPress: handleLearnMorePress,
          buttonVariant: 'common'
        }
      ],
      [ChatPermissionAction.TIP]: [
        {
          buttonTitle: messages.sendAudio,
          buttonPress: handleTipPress,
          buttonVariant: 'primary',
          buttonIcon: IconTip,
          buttonTextStyle: styles.buttonTextWhite
        }
      ],
      [ChatPermissionAction.UNBLOCK]: [
        {
          buttonTitle: messages.unblockUser,
          buttonPress: handleUnblockPress,
          buttonVariant: 'primary',
          buttonTextStyle: styles.buttonTextWhite
        },
        {
          buttonTitle: messages.cancel,
          buttonPress: closeDrawer,
          buttonVariant: 'common'
        }
      ]
    }
  }, [
    handleLearnMorePress,
    handleTipPress,
    styles.buttonTextWhite,
    handleUnblockPress,
    closeDrawer
  ])

  if (!user) return

  const content = mapActionToContent(callToAction, user, styles)

  return (
    <NativeDrawer drawerName={INBOX_UNAVAILABLE_MODAL_NAME}>
      <View style={styles.drawer}>
        <View style={styles.titleContainer}>
          <IconMessageLocked fill={neutralLight2} />
          <Text style={styles.title}>{messages.title}</Text>
        </View>
        <View style={styles.border} />
        <Text style={styles.callToActionText}>{content}</Text>
        {actionToButtonsMap[callToAction].map(
          ({
            buttonTitle,
            buttonPress,
            buttonVariant,
            buttonIcon,
            buttonTextStyle
          }) => (
            <Button
              key={buttonTitle}
              title={buttonTitle}
              onPress={buttonPress}
              variant={buttonVariant}
              icon={buttonIcon}
              iconPosition='left'
              styles={{
                root: styles.button,
                text: [styles.buttonText, buttonTextStyle]
              }}
              fullWidth
            />
          )
        )}
      </View>
    </NativeDrawer>
  )
}
