import { useCallback } from 'react'

import type { User } from '@audius/common'
import { View } from 'react-native'

import IconTip from 'app/assets/images/iconTip.svg'
import { Text } from 'app/components/core'
import UserBadges from 'app/components/user-badges'
import { useNavigation } from 'app/hooks/useNavigation'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

import { PressableText } from './PressableText'
import { NUM_FEED_TIPPERS_DISPLAYED } from './constants'

const messages = {
  wasTippedBy: 'Was Tipped By',
  andOthers: (num: number) => `& ${num} ${num > 1 ? 'others' : 'other'}`
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  wasTippedByContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    marginLeft: spacing(1)
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
    flexDirection: 'row',
    alignItems: 'center'
  },
  tipperText: {
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontByWeight.medium,
    color: palette.neutral,
    flexGrow: 0,
    flexShrink: 1
  },
  pressedText: {
    textDecorationLine: 'underline'
  },
  andOthers: {
    marginLeft: spacing(1)
  }
}))

type SenderDetailsProps = {
  senders: User[]
  receiver: User
}

export const SenderDetails = ({ senders, receiver }: SenderDetailsProps) => {
  const styles = useStyles()
  const { neutralLight4 } = useThemeColors()
  const navigation = useNavigation()

  const handlePressTippers = useCallback(() => {
    navigation.push('TopSupporters', {
      userId: receiver.user_id,
      source: 'feed'
    })
  }, [navigation, receiver])

  return (
    <View style={styles.wasTippedByContainer}>
      <IconTip fill={neutralLight4} height={16} width={16} />
      <Text style={styles.wasTippedBy}>{messages.wasTippedBy}</Text>
      <PressableText style={styles.tippers} onPress={handlePressTippers}>
        {({ pressed }) => {
          const textStyle = [styles.tipperText, pressed && styles.pressedText]

          return (
            <>
              {senders
                .slice(0, NUM_FEED_TIPPERS_DISPLAYED)
                .map((tipper, index) => (
                  <View key={`tipper-${index}`} style={styles.tipper}>
                    <Text style={textStyle} numberOfLines={1}>
                      {tipper.name}
                    </Text>
                    <UserBadges user={tipper} badgeSize={12} hideName />
                    {index < senders.length - 1 &&
                    index < NUM_FEED_TIPPERS_DISPLAYED - 1 ? (
                      <Text style={textStyle}>&nbsp;,&nbsp;</Text>
                    ) : null}
                  </View>
                ))}
              {receiver.supporter_count > NUM_FEED_TIPPERS_DISPLAYED ? (
                <Text style={[...textStyle, styles.andOthers]}>
                  {messages.andOthers(
                    receiver.supporter_count -
                      Math.min(senders.length, NUM_FEED_TIPPERS_DISPLAYED)
                  )}
                </Text>
              ) : null}
            </>
          )
        }}
      </PressableText>
    </View>
  )
}
