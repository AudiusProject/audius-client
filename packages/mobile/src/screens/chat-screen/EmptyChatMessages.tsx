import { playerSelectors } from '@audius/common'
import { View, Text, Image } from 'react-native'
import { useSelector } from 'react-redux'

import WavingHand from 'app/assets/images/emojis/waving-hand-sign.png'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'
const { getHasTrack } = playerSelectors

const messages = {
  newMessage: 'New Message',
  sayHello: 'Say Hello!',
  firstImpressions: 'First impressions are important, so make it count!'
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  outerContainer: {
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing(8)
  },
  emptyContainer: {
    marginHorizontal: spacing(6),
    padding: spacing(6),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.neutralLight7,
    borderWidth: 1,
    borderRadius: spacing(2),
    transform: [{ rotateY: '180deg' }, { rotateZ: '180deg' }]
  },
  emptyTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginHorizontal: spacing(6)
  },
  wavingHand: {
    height: spacing(16),
    width: spacing(16)
  },
  emptyTitle: {
    fontSize: typography.fontSize.xxl,
    color: palette.neutral,
    fontFamily: typography.fontByWeight.bold,
    lineHeight: typography.fontSize.xxl * 1.3
  },
  emptyText: {
    marginTop: spacing(2),
    marginRight: spacing(6),
    fontSize: typography.fontSize.large,
    lineHeight: typography.fontSize.large * 1.3,
    color: palette.neutral
  }
}))

export const EmptyChatMessages = () => {
  const styles = useStyles()
  const hasCurrentlyPlayingTrack = useSelector(getHasTrack)
  return (
    <View
      style={[
        styles.outerContainer,
        hasCurrentlyPlayingTrack ? { paddingBottom: spacing(19.5) } : null
      ]}
    >
      <View style={styles.emptyContainer}>
        <Image style={styles.wavingHand} source={WavingHand} />
        <View style={styles.emptyTextContainer}>
          <Text style={styles.emptyTitle}>{messages.sayHello}</Text>
          <Text style={styles.emptyText}>{messages.firstImpressions}</Text>
        </View>
      </View>
    </View>
  )
}
