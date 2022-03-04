import { useCallback } from 'react'

import {
  setModalState,
  setModalVisibility
} from 'audius-client/src/common/store/pages/token-dashboard/slice'
import { Dimensions, Image, Linking, View } from 'react-native'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import LinearGradient from 'react-native-linear-gradient'

import IconDiscord from 'app/assets/images/iconDiscord.svg'
import IconReceive from 'app/assets/images/iconReceive.svg'
import IconSend from 'app/assets/images/iconSend.svg'
import Bronze from 'app/assets/images/tokenBadgeBronze108.png'
import Gold from 'app/assets/images/tokenBadgeGold108.png'
import Platinum from 'app/assets/images/tokenBadgePlatinum108.png'
import Silver from 'app/assets/images/tokenBadgeSilver108.png'
import TokenStill from 'app/assets/images/tokenSpinStill.png'
import { Button, GradientText, Text, Tile } from 'app/components/core'
import { Header } from 'app/components/header'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

import { Tier } from './Tier'

const LEARN_MORE_LINK = 'https://blog.audius.co/posts/community-meet-audio'

const messages = {
  title: '$AUDIO & Rewards',
  audio: '$AUDIO',
  send: 'Send $AUDIO',
  receive: 'Receive $AUDIO',
  connect: 'Connect Other Wallets',
  rewards: '$AUDIO Rewards',
  rewardsBody1: 'Complete tasks to earn $AUDIO tokens!',
  rewardsBody2:
    'Opportunities to earn $AUDIO will change, so check back often for more chances to earn!',
  trending: 'Trending Competations',
  trendingBody1: 'Win contests to earn $AUDIO tokens!',
  vipTiers: '$AUDIO VIP Tiers',
  vipTiersBody1: 'Unlock $AUDIO VIP Tiers by simply holding more $AUDIO!',
  vipTiersBody2:
    'Advancing to a new tier will earn your profile a badge, visible throughout the app, and unlock various new features as they are released.',
  launchDiscord: 'Launch the VIP Discord',
  what: 'What is $AUDIO',
  whatBody1:
    'Audius is owned by people like you, not major corporations. Holding $AUDIO grants you partial ownership of the Audius platform and gives you access to special features as they are released.',
  learnMore: 'Learn More',
  whatBody2: `Still confused? Don't worry, more details coming soon!`
}

const screenHeight = Dimensions.get('window').height

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  root: {
    display: 'flex',
    height: screenHeight
  },
  tiles: {
    height: '100%'
  },
  tileRoot: {
    margin: spacing(3)
  },
  tile: {
    borderRadius: 6,
    paddingVertical: spacing(8),
    paddingHorizontal: spacing(4)
  },
  tileContent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  tileHeader: {
    fontFamiy: typography.fontByWeight.heavy,
    fontSize: typography.fontSize.xxxxl,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16
  },
  tileSubheader: {
    fontFamiy: typography.fontByWeight.regular,
    fontSize: typography.fontSize.xs,
    lineHeight: spacing(5),
    textAlign: 'center'
  },
  tileLink: {
    fontFamily: typography.fontByWeight.bold,
    fontSize: typography.fontSize.medium,
    color: palette.secondary,
    lineHeight: spacing(5),
    textAlign: 'center',
    marginVertical: spacing(4)
  },
  audioAmount: {
    marginTop: spacing(4),
    color: palette.staticWhite,
    fontSize: typography.fontSize.xxxxxl,
    fontFamily: typography.fontByWeight.heavy,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15
  },
  audioText: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontByWeight.bold,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.5)',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
    marginBottom: spacing(4)
  },
  buttonRoot: {
    marginTop: spacing(2),
    marginBottom: spacing(2),
    height: spacing(12),
    width: 260
  },
  button: {
    paddingHorizontal: spacing(2)
  },
  buttonText: {
    padding: 0,
    textTransform: 'uppercase'
  },
  token: {
    width: 200,
    height: 200,
    marginBottom: spacing(6)
  }
}))

export const AudioScreen = () => {
  const styles = useStyles()
  const {
    pageHeaderGradientColor1,
    pageHeaderGradientColor2
  } = useThemeColors()
  const dispatchWeb = useDispatchWeb()

  const renderAudioTile = () => {
    return (
      <Tile
        as={LinearGradient}
        colors={[pageHeaderGradientColor1, pageHeaderGradientColor2]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
        styles={{
          root: styles.tileRoot,
          tile: styles.tile,
          content: styles.tileContent
        }}
      >
        <Text style={styles.audioAmount}>10,000</Text>
        <Text style={styles.audioText}>{messages.audio}</Text>
      </Tile>
    )
  }

  const renderWalletTile = () => {
    return (
      <Tile
        styles={{
          root: styles.tileRoot,
          tile: styles.tile,
          content: styles.tileContent
        }}
      >
        <Button
          title={messages.send}
          styles={{
            root: styles.buttonRoot,
            text: styles.buttonText,
            button: styles.button
          }}
          variant='commonAlt'
          iconPosition='left'
          size='medium'
          icon={IconSend}
        />
        <Button
          title={messages.receive}
          styles={{
            root: styles.buttonRoot,
            text: styles.buttonText,
            button: styles.button
          }}
          variant='commonAlt'
          iconPosition='left'
          size='medium'
          icon={IconReceive}
        />
        <Button
          title={messages.connect}
          styles={{
            root: styles.buttonRoot,
            text: styles.buttonText,
            button: styles.button
          }}
          variant='commonAlt'
          size='medium'
        />
      </Tile>
    )
  }

  const renderRewardsTile = () => {
    return (
      <Tile
        styles={{
          root: styles.tileRoot,
          tile: styles.tile,
          content: styles.tileContent
        }}
      >
        <GradientText style={styles.tileHeader}>
          {messages.rewards}
        </GradientText>
        <Text style={styles.tileSubheader}>{messages.rewardsBody1}</Text>
        <Text style={styles.tileSubheader}>{messages.rewardsBody2}</Text>
      </Tile>
    )
  }

  const renderTrendingTile = () => {
    return (
      <Tile
        styles={{
          root: styles.tileRoot,
          tile: styles.tile,
          content: styles.tileContent
        }}
      >
        <GradientText style={styles.tileHeader}>
          {messages.trending}
        </GradientText>
        <Text style={styles.tileSubheader}>{messages.trendingBody1}</Text>
      </Tile>
    )
  }

  const onPressLaunchDiscord = useCallback(() => {
    dispatchWeb(setModalState({ modalState: { stage: 'DISCORD_CODE' } }))
    dispatchWeb(setModalVisibility({ isVisible: true }))
  }, [dispatchWeb])

  const renderTierTile = () => {
    return (
      <Tile
        styles={{
          root: styles.tileRoot,
          tile: styles.tile,
          content: styles.tileContent
        }}
      >
        <GradientText style={styles.tileHeader}>
          {messages.vipTiers}
        </GradientText>
        <Text style={styles.tileSubheader}>{messages.vipTiersBody1}</Text>
        <Text style={styles.tileSubheader}>{messages.vipTiersBody2}</Text>
        <Tier
          tierNumber={1}
          title='bronze'
          colors={['rgba(141, 48, 8, 0.5)', 'rgb(182, 97, 11)']}
          minAmount={10}
          image={<Image source={Bronze} />}
          isCurrentTier={false}
        />
        <Tier
          tierNumber={2}
          title='silver'
          colors={['rgba(179, 182, 185, 0.5)', 'rgb(189, 189, 189)']}
          minAmount={100}
          image={<Image source={Silver} />}
          isCurrentTier={true}
        />
        <Tier
          tierNumber={3}
          title='gold'
          colors={['rgb(236, 173, 11)', 'rgb(236, 173, 11)']}
          minAmount={1000}
          image={<Image source={Gold} />}
          isCurrentTier={false}
        />
        <Tier
          tierNumber={4}
          title='bronze'
          colors={['rgb(179, 236, 249)', 'rgb(87, 194, 215)']}
          minAmount={10000}
          image={<Image source={Platinum} />}
          isCurrentTier={false}
        />
        <Button
          title={messages.learnMore}
          styles={{
            root: styles.buttonRoot,
            text: styles.buttonText,
            button: styles.button
          }}
          variant='commonAlt'
          size='medium'
          onPress={() => Linking.openURL(LEARN_MORE_LINK)}
        />
        <Button
          title={messages.launchDiscord}
          styles={{
            root: styles.buttonRoot,
            text: styles.buttonText,
            button: styles.button
          }}
          variant='commonAlt'
          size='medium'
          iconPosition='left'
          icon={IconDiscord}
          onPress={onPressLaunchDiscord}
        />
      </Tile>
    )
  }

  const renderWhatTile = () => {
    return (
      <Tile
        styles={{
          root: styles.tileRoot,
          tile: styles.tile,
          content: styles.tileContent
        }}
      >
        <Image style={styles.token} source={TokenStill} />
        <GradientText style={styles.tileHeader}>{messages.what}</GradientText>
        <Text style={styles.tileSubheader}>{messages.whatBody1}</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(LEARN_MORE_LINK)}
          activeOpacity={0.7}
        >
          <Text style={styles.tileLink}>{messages.learnMore}</Text>
        </TouchableOpacity>
        <Text style={styles.tileSubheader}>{messages.whatBody2}</Text>
      </Tile>
    )
  }

  return (
    <View style={styles.root}>
      <Header text={messages.title} />
      <ScrollView style={styles.tiles}>
        <View>
          {renderAudioTile()}
          {renderWalletTile()}
          {renderRewardsTile()}
          {renderTrendingTile()}
          {renderTierTile()}
          {renderWhatTile()}
        </View>
      </ScrollView>
    </View>
  )
}
