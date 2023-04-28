import { useEffect } from 'react'

import type { ID } from '@audius/common'
import { aiPageActions, aiPageSelectors } from '@audius/common'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AUDIUS_DOCS_LINK } from 'utils/route'

import IconRobot from 'app/assets/images/iconRobot.svg'
import { Text, Link } from 'app/components/core'
import UserBadges from 'app/components/user-badges'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

const { fetchAiUser, reset } = aiPageActions
const { getAiUser } = aiPageSelectors

const messages = {
  title: 'Generated with AI',
  description: 'This song was made by an AI that has been trained to imitate ',
  learnMore: 'Learn More'
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  root: {
    gap: spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: palette.neutralLight7,
    paddingBottom: spacing(4),
    marginBottom: spacing(4)
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2)
  },
  titleText: {
    textTransform: 'uppercase',
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontByWeight.bold,
    lineHeight: typography.fontSize.small * 1.3
  },
  description: {
    fontSize: typography.fontSize.small,
    lineHeight: typography.fontSize.small * 1.3
  },
  userBadgeTitle: {
    fontSize: typography.fontSize.small,
    lineHeight: typography.fontSize.small * 1.3,
    fontFamily: typography.fontByWeight.medium,
    color: palette.secondary
  },
  badges: {
    paddingTop: spacing(4)
  },
  learnMore: {
    fontSize: typography.fontSize.small,
    lineHeight: typography.fontSize.small * 1.2,
    color: palette.secondary
  }
}))

export const DetailsTileAiAttribution = ({ userId }: { userId: ID }) => {
  const styles = useStyles()
  const { neutral } = useThemeColors()

  const dispatch = useDispatch()
  const user = useSelector(getAiUser)

  useEffect(() => {
    dispatch(fetchAiUser({ userId }))
    return function cleanup() {
      dispatch(reset())
    }
  }, [dispatch, userId])

  return user ? (
    <View style={styles.root}>
      <View style={styles.title}>
        <IconRobot fill={neutral} />
        <Text style={styles.titleText}>{messages.title}</Text>
      </View>
      <Text style={styles.description}>
        {messages.description}
        <Text style={styles.userBadgeTitle}>{user.name}</Text>
        <UserBadges user={user} hideName style={styles.badges} badgeSize={12} />
      </Text>
      <Link url={AUDIUS_DOCS_LINK}>
        <Text style={styles.learnMore}>{messages.learnMore}</Text>
      </Link>
    </View>
  ) : null
}
