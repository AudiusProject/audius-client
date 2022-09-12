import { Fragment, useEffect, useMemo, useRef } from 'react'

import { useSelectTierInfo } from '@audius/common'
import { View, Animated } from 'react-native'

import { Divider } from 'app/components/core'
import { makeStyles } from 'app/styles/makeStyles'

import { useSelectProfile } from '../selectors'

import { ProfileTierTile } from './ProfileTierTile'
import {
  InstagramSocialLink,
  TikTokSocialLink,
  TwitterSocialLink
} from './SocialLink'

const useStyles = makeStyles(({ spacing }, { socialsCount }) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(3)
  },
  socials: {
    flexDirection: 'row',
    flex: 4,
    marginVertical: spacing(3)
  },
  divider: {
    marginVertical: spacing(1),
    marginHorizontal: spacing(socialsCount === 2 ? 6 : 4)
  }
}))

export const ProfileSocials = () => {
  const { user_id, twitter_handle, instagram_handle, tiktok_handle } =
    useSelectProfile([
      'user_id',
      'twitter_handle',
      'instagram_handle',
      'tiktok_handle'
    ])

  const socialLinks = useMemo(() => {
    const links = [
      [twitter_handle, TwitterSocialLink],
      [instagram_handle, InstagramSocialLink],
      [tiktok_handle, TikTokSocialLink]
    ] as const
    return links.filter(([handle]) => !(handle === null || handle === ''))
  }, [twitter_handle, instagram_handle, tiktok_handle])

  const socialsCount = socialLinks.length
  const stylesOptions = useMemo(() => ({ socialsCount }), [socialsCount])
  const styles = useStyles(stylesOptions)

  const { tier } = useSelectTierInfo(user_id)

  const opacity = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (socialsCount > 0) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start()
    }
  }, [opacity, socialsCount])

  return (
    <View pointerEvents='box-none' style={styles.root}>
      <ProfileTierTile interactive={false} />
      <Animated.View
        style={[
          styles.socials,
          tier !== 'none' && { justifyContent: 'center' },
          { opacity }
        ]}
      >
        {socialLinks.map(([, SocialLink], index) => {
          const link = <SocialLink key={index} showText={socialsCount === 1} />
          if (index === socialLinks.length - 1) return link
          return (
            <Fragment key={index}>
              {link}
              <Divider orientation='vertical' style={styles.divider} />
            </Fragment>
          )
        })}
      </Animated.View>
    </View>
  )
}
