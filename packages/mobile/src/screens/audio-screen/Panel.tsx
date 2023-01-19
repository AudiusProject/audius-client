import type {
  ChallengeRewardsInfo,
  OptimisticUserChallenge
} from '@audius/common'
import { fillString, formatNumberCommas } from '@audius/common'
import { View, Image } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

import IconArrow from 'app/assets/images/iconArrow.svg'
import IconCheck from 'app/assets/images/iconCheck.svg'
import { Button, Text } from 'app/components/core'
import { ProgressBar } from 'app/components/progress-bar'
import { makeStyles } from 'app/styles'
import type { MobileChallengeConfig } from 'app/utils/challenges'
import { useThemeColors } from 'app/utils/theme'

const messages = {
  completeLabel: 'COMPLETE',
  claimReward: 'Claim Your Reward'
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  root: {
    marginVertical: spacing(2),
    borderRadius: spacing(2),
    borderColor: palette.neutralLight7,
    borderWidth: 2,
    paddingTop: spacing(10),
    paddingBottom: spacing(8),
    paddingHorizontal: spacing(5)
  },
  completed: {
    backgroundColor: palette.neutralLight10
  },
  header: {
    flexDirection: 'row',
    marginBottom: spacing(2)
  },
  headerImage: {
    width: 24,
    height: 24,
    marginRight: spacing(2),
    marginBottom: 6
  },
  title: {
    fontFamily: typography.fontByWeight.bold,
    fontSize: typography.fontSize.large,
    flex: 1
  },
  description: {
    fontFamily: typography.fontByWeight.demiBold,
    fontSize: typography.fontSize.small,
    color: palette.neutral,
    lineHeight: 17,
    marginBottom: spacing(6)
  },
  progress: {
    fontFamily: typography.fontByWeight.heavy,
    fontSize: typography.fontSize.medium,
    marginBottom: spacing(2),
    textTransform: 'uppercase',
    color: palette.neutralLight4
  },
  button: {
    marginTop: spacing(4)
  },
  progressLabel: {
    display: 'flex',
    flexDirection: 'row'
  },
  iconCheck: {
    marginBottom: spacing(2),
    marginRight: spacing(2)
  }
}))

type PanelProps = {
  onPress: () => void
  challenge?: OptimisticUserChallenge
} & ChallengeRewardsInfo &
  MobileChallengeConfig

export const Panel = ({
  onPress,
  icon,
  title,
  shortDescription,
  description,
  progressLabel,
  remainingLabel,
  challenge,
  panelButtonText
}: PanelProps) => {
  const styles = useStyles()
  const { neutralLight4 } = useThemeColors()

  const stepCount = challenge?.max_steps ?? 0
  const shouldShowCompleted =
    challenge?.state === 'completed' || challenge?.state === 'disbursed'
  const hasDisbursed = challenge?.state === 'disbursed'
  const needsDisbursement = challenge && challenge.claimableAmount > 0
  const shouldShowProgressBar =
    stepCount > 1 &&
    challenge?.challenge_type !== 'aggregate' &&
    challenge?.state !== 'disbursed'

  const shouldShowProgress = !!progressLabel
  let progressLabelFilled: string | null = null
  if (shouldShowProgress) {
    if (shouldShowCompleted) {
      progressLabelFilled = messages.completeLabel
    } else if (challenge?.challenge_type === 'aggregate') {
      // Count down
      progressLabelFilled = fillString(
        remainingLabel ?? '',
        (challenge?.max_steps - challenge?.current_step_count)?.toString() ??
          '',
        formatNumberCommas(stepCount.toString())
      )
    } else {
      // Count up
      progressLabelFilled = fillString(
        progressLabel,
        challenge?.current_step_count?.toString() ?? '',
        formatNumberCommas(stepCount.toString())
      )
    }
  }

  const buttonType =
    challenge?.state === 'completed'
      ? 'primary'
      : hasDisbursed
      ? 'commonAlt'
      : 'common'

  return (
    <TouchableOpacity
      style={[styles.root, hasDisbursed ? styles.completed : '']}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        {icon ? <Image style={styles.headerImage} source={icon} /> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.description}>
        {shortDescription || description(challenge)}
      </Text>
      {shouldShowProgress ? (
        <View style={styles.progressLabel}>
          <IconCheck
            style={styles.iconCheck}
            fill={neutralLight4}
            width={20}
            height={20}
          />
          <Text style={styles.progress}>{progressLabelFilled}</Text>
        </View>
      ) : null}
      {shouldShowProgressBar ? (
        <View>
          <ProgressBar
            progress={challenge?.current_step_count ?? 0}
            max={stepCount}
          />
        </View>
      ) : null}
      {
        <Button
          fullWidth
          title={needsDisbursement ? messages.claimReward : panelButtonText}
          variant={buttonType}
          iconPosition='right'
          size='medium'
          icon={IconArrow}
          onPress={onPress}
          style={[styles.button, hasDisbursed ? styles.completed : '']}
        />
      }
    </TouchableOpacity>
  )
}
