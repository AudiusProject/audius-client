import { getProfileUser } from 'audius-client/src/common/store/pages/profile/selectors'
import { Text, TextStyle, View } from 'react-native'

import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'

import { AppDrawer } from '../drawer/AppDrawer'

import { IconAudioBadge } from './IconAudioBadge'
import { TierText } from './TierText'
import {
  audioTierRequirements,
  getAudioTierRank,
  getUserAudioTier
} from './audioTier'

import { AudioTierRequirement } from '.'

export const MODAL_NAME = 'TiersExplainer'

const messages = {
  tier: 'Tier',
  explainer1: 'Unlock $AUDIO VIP Tiers by simply holding more $AUDIO.',
  explainer2:
    'Advancing to a new tier will earn you a profile badge, visible throughout the app, and unlock various new features, as they are released.',
  learnMore: 'LEARN MORE'
}

const useStyles = makeStyles(({ spacing, typography, palette }) => ({
  top: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing(12)
  },
  tierTextGroup: { marginLeft: spacing(4) },
  tierRank: {
    ...typography.h2,
    marginBottom: 0,
    color: palette.neutralLight6,
    textTransform: 'uppercase',
    letterSpacing: 3
  },
  tierText: {
    fontSize: 28,
    textTransform: 'uppercase',
    marginTop: spacing(0.5),
    marginBottom: spacing(1)
  },
  minAudio: {
    ...typography.h3,
    marginBottom: 0,
    color: palette.secondary
  },
  explainerRoot: {
    marginTop: spacing(6),
    paddingHorizontal: spacing(12)
  },
  tierExplainer: {
    fontSize: 16,
    fontFamily: typography.fontByWeight.demiBold,
    color: palette.neutral,
    lineHeight: 25,
    marginBottom: spacing(7)
  }
}))

export const TiersExplainerDrawer = () => {
  const styles = useStyles()

  const profile = useSelectorWeb(getProfileUser)
  if (!profile) return null

  const tier = getUserAudioTier(profile)
  const tierRank = getAudioTierRank(tier)
  const { minAudio } = audioTierRequirements.find(
    tierReq => tierReq.tier === tier
  ) as AudioTierRequirement

  const minAudioText = minAudio.toString()

  return (
    <AppDrawer modalName={MODAL_NAME}>
      <View style={styles.top}>
        <IconAudioBadge tier={tier} height={108} width={108} />
        <View style={styles.tierTextGroup}>
          <Text style={styles.tierRank}>
            {messages.tier} {tierRank}
          </Text>
          <TierText style={styles.tierText} tier={tier}>
            {tier}
          </TierText>
          <Text
            accessibilityLabel={`${minAudioText} or more audio tokens`}
            style={styles.minAudio}
          >
            {minAudio.toString()}+ $AUDIO
          </Text>
        </View>
      </View>
      <View style={styles.explainerRoot}>
        <Text style={styles.tierExplainer}>{messages.explainer1}</Text>
        <Text style={styles.tierExplainer}>{messages.explainer2}</Text>
      </View>
    </AppDrawer>
  )
}
