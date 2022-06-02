import { useCallback, useEffect, useState } from 'react'

import { User } from 'audius-client/src/common/models/User'
import { FeatureFlags } from 'audius-client/src/common/services/remote-config'
import { getUsers } from 'audius-client/src/common/store/cache/users/selectors'
import {
  getShowTip,
  getTipToDisplay
} from 'audius-client/src/common/store/tipping/selectors'
import {
  beginTip,
  fetchRecentTips,
  hideTip,
  setMainUser
} from 'audius-client/src/common/store/tipping/slice'
import { dismissRecentTip } from 'audius-client/src/store/tipping/utils'
import { profilePage } from 'audius-client/src/utils/route'
import { View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

import IconClose from 'app/assets/images/iconClose.svg'
import IconTip from 'app/assets/images/iconTip.svg'
import { Tile, Text, Button } from 'app/components/core'
import { ProfilePicture } from 'app/components/user'
import UserBadges from 'app/components/user-badges'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useNavigation } from 'app/hooks/useNavigation'
import { useFeatureFlag } from 'app/hooks/useRemoteConfig'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

import { NUM_FEED_TIPPERS_DISPLAYED } from './constants'

const messages = {
  wasTippedBy: 'Was Tipped By',
  andOthers: (num: number) => `& ${num} ${num > 1 ? 'others' : 'other'}`,
  sendTipToPrefix: 'SEND TIP TO '
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  tile: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing(3),
    marginTop: spacing(3),
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(4)
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  receiver: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(4)
  },
  profilePicture: {
    width: 42,
    height: 42
  },
  receiverInfo: {
    marginLeft: spacing(2)
  },
  receiverNameContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  receiverName: {
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontByWeight.bold
  },
  receiverHandle: {
    marginTop: spacing(1),
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontByWeight.demiBold
  },
  wasTippedByContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap'
  },
  wasTippedBy: {
    marginLeft: spacing(1.5),
    marginRight: spacing(1),
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontByWeight.medium,
    color: palette.neutralLight4
  },
  tippers: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap'
  },
  tipper: {
    maxWidth: '92%',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  tipperText: {
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontByWeight.medium,
    color: palette.neutral
  },
  andOthers: {
    marginLeft: spacing(1)
  },
  sendTipButton: {
    marginTop: spacing(4)
  },
  sendTipButtonTitleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendTipButtonTitle: {
    marginTop: spacing(1),
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontByWeight.bold,
    color: palette.neutralLight4
  },
  buttonReceiverName: {
    marginTop: spacing(1),
    maxWidth: '68%',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontByWeight.bold,
    color: palette.neutralLight4,
    textTransform: 'uppercase'
  },
  buttonBadge: {
    marginTop: spacing(0.5)
  },
  textWhite: {
    color: palette.white
  },
  textUnderline: {
    textDecorationLine: 'underline'
  }
}))

type ReceiverDetailsProps = {
  receiver: User
}

const ReceiverDetails = ({ receiver }: ReceiverDetailsProps) => {
  const styles = useStyles()
  const navigation = useNavigation()
  const [isActiveName, setIsActiveName] = useState(false)
  const [isActiveHandle, setIsActiveHandle] = useState(false)

  const goToReceiverProfile = useCallback(() => {
    navigation.navigate({
      native: { screen: 'Profile', params: { handle: receiver.handle } },
      web: { route: profilePage(receiver.handle) }
    })
  }, [navigation, receiver])

  const handlePressInName = useCallback(() => {
    setIsActiveName(true)
  }, [])
  const handlePressOutName = useCallback(() => {
    setIsActiveName(false)
  }, [])

  const handlePressInHandle = useCallback(() => {
    setIsActiveHandle(true)
  }, [])
  const handlePressOutHandle = useCallback(() => {
    setIsActiveHandle(false)
  }, [])

  return (
    <View style={styles.receiver}>
      <TouchableOpacity onPress={goToReceiverProfile}>
        <ProfilePicture
          profile={receiver}
          profilePhotoStyles={styles.profilePicture}
        />
      </TouchableOpacity>
      <View style={styles.receiverInfo}>
        <Text
          style={
            isActiveName
              ? [styles.receiverNameContainer, styles.textUnderline]
              : styles.receiverNameContainer
          }
          onPress={goToReceiverProfile}
          onPressIn={handlePressInName}
          onPressOut={handlePressOutName}
        >
          <Text variant='h3' style={styles.receiverName}>
            {receiver.name}
          </Text>
          <UserBadges user={receiver} badgeSize={12} hideName />
        </Text>
        <Text
          variant='h4'
          style={
            isActiveHandle
              ? [styles.receiverHandle, styles.textUnderline]
              : styles.receiverHandle
          }
          onPress={goToReceiverProfile}
          onPressIn={handlePressInHandle}
          onPressOut={handlePressOutHandle}
        >
          @{receiver.handle}
        </Text>
      </View>
    </View>
  )
}

type WasTippedByProps = {
  tippers: User[]
  receiver: User
}

const WasTippedBy = ({ tippers, receiver }: WasTippedByProps) => {
  const styles = useStyles()
  const { neutralLight4 } = useThemeColors()
  const navigation = useNavigation()

  const handlePressTippers = useCallback(() => {
    navigation.push({
      native: { screen: 'TopSupporters', params: { userId: receiver.user_id } }
    })
  }, [navigation, receiver])

  return (
    <View style={styles.wasTippedByContainer}>
      <IconTip fill={neutralLight4} height={16} width={16} />
      <Text style={styles.wasTippedBy}>{messages.wasTippedBy}</Text>
      <TouchableOpacity style={styles.tippers} onPress={handlePressTippers}>
        {tippers.slice(0, NUM_FEED_TIPPERS_DISPLAYED).map((tipper, index) => (
          <View key={`tipper-${index}`} style={styles.tipper}>
            <Text style={styles.tipperText} numberOfLines={1}>
              {tipper.name}
            </Text>
            <UserBadges user={tipper} badgeSize={12} hideName />
            {index < tippers.length - 1 &&
            index < NUM_FEED_TIPPERS_DISPLAYED - 1 ? (
              <Text style={styles.tipperText}>&nbsp;,&nbsp;</Text>
            ) : null}
          </View>
        ))}
        {receiver.supporter_count > NUM_FEED_TIPPERS_DISPLAYED ? (
          <Text style={[styles.tipperText, styles.andOthers]}>
            {messages.andOthers(
              receiver.supporter_count -
                Math.min(tippers.length, NUM_FEED_TIPPERS_DISPLAYED)
            )}
          </Text>
        ) : null}
      </TouchableOpacity>
    </View>
  )
}

type SendTipButtonProps = {
  receiver: User
}

const SendTipButton = ({ receiver }: SendTipButtonProps) => {
  const styles = useStyles()
  const navigation = useNavigation()
  const dispatchWeb = useDispatchWeb()
  const [isActive, setIsActive] = useState(false)

  const handlePress = useCallback(() => {
    dispatchWeb(beginTip({ user: receiver }))
    navigation.navigate({ native: { screen: 'TipArtist' } })
  }, [dispatchWeb, receiver, navigation])

  const handlePressIn = useCallback(() => {
    setIsActive(true)
  }, [])

  const handlePressOut = useCallback(() => {
    setIsActive(false)
  }, [])

  return (
    <View style={styles.sendTipButton}>
      <Button
        // @ts-ignore: react native title wants string but we need Element
        title={
          <View style={styles.sendTipButtonTitleContainer}>
            <Text
              style={
                isActive
                  ? [styles.sendTipButtonTitle, styles.textWhite]
                  : styles.sendTipButtonTitle
              }
            >
              {messages.sendTipToPrefix}
            </Text>
            <Text
              style={
                isActive
                  ? [styles.buttonReceiverName, styles.textWhite]
                  : styles.buttonReceiverName
              }
              numberOfLines={1}
            >
              {receiver.name}
            </Text>
            <UserBadges
              user={receiver}
              badgeSize={12}
              style={styles.buttonBadge}
              hideName
            />
          </View>
        }
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        size='small'
        variant='common'
        corners='pill'
        fullWidth
      />
    </View>
  )
}

export const FeedTipTile = () => {
  const styles = useStyles()
  const dispatchWeb = useDispatchWeb()
  const showTip = useSelectorWeb(getShowTip)
  const tipToDisplay = useSelectorWeb(getTipToDisplay)
  const tipperIds = tipToDisplay
    ? [
        tipToDisplay.sender_id,
        tipToDisplay.receiver_id,
        ...tipToDisplay.followee_supporter_ids
      ]
    : []
  const usersMap = useSelectorWeb(state =>
    getUsers(state, { ids: tipToDisplay ? tipperIds : [] })
  )
  const { isEnabled: isTippingEnabled } = useFeatureFlag(
    FeatureFlags.TIPPING_ENABLED
  )
  const [hasSetMainUser, setHasSetMainUser] = useState(false)

  useEffect(() => {
    if (
      isTippingEnabled &&
      !hasSetMainUser &&
      tipToDisplay &&
      usersMap[tipToDisplay.receiver_id]
    ) {
      dispatchWeb(setMainUser({ user: usersMap[tipToDisplay.receiver_id] }))
      setHasSetMainUser(true)
    }
  }, [isTippingEnabled, hasSetMainUser, tipToDisplay, usersMap, dispatchWeb])

  useEffect(() => {
    dispatchWeb(fetchRecentTips())
  }, [dispatchWeb])

  const handlePressClose = useCallback(() => {
    dismissRecentTip()
    dispatchWeb(hideTip())
  }, [dispatchWeb])

  if (!isTippingEnabled || !showTip) {
    return null
  }

  return tipToDisplay ? (
    <Tile
      styles={{
        tile: styles.tile
      }}
    >
      <View style={styles.header}>
        <ReceiverDetails receiver={usersMap[tipToDisplay.receiver_id]} />
        <IconClose onPress={handlePressClose} height={16} width={16} />
      </View>
      <WasTippedBy
        tippers={[
          tipToDisplay.sender_id,
          ...tipToDisplay.followee_supporter_ids
        ]
          .map(id => usersMap[id])
          .filter((user): user is User => !!user)}
        receiver={usersMap[tipToDisplay.receiver_id]}
      />
      <SendTipButton receiver={usersMap[tipToDisplay.receiver_id]} />
    </Tile>
  ) : null
}
