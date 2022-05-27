import { ComponentType, Fragment, useMemo } from 'react'

import { View } from 'react-native'

import { Divider } from 'app/components/core'
import { useSelectTierInfo } from 'app/hooks/useSelectTierInfo'
import { makeStyles } from 'app/styles/makeStyles'

import { useSelectProfile } from '../selectors'

import { ProfileTierTile } from './ProfileTierTile'
import {
  InstagramSocialLink,
  SocialLinkProps,
  TikTokSocialLink,
  TwitterSocialLink
} from './SocialLink'

const useStyles = makeStyles(({ spacing }, { socialsCount }) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
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
  const {
    user_id,
    twitter_handle,
    instagram_handle,
    tiktok_handle
  } = useSelectProfile([
    'user_id',
    'twitter_handle',
    'instagram_handle',
    'tiktok_handle'
  ])

  const socialsCount = [twitter_handle, instagram_handle, tiktok_handle].filter(
    handle => handle
  ).length

  const stylesOptions = useMemo(() => ({ socialsCount }), [socialsCount])
  const styles = useStyles(stylesOptions)

  const { tier } = useSelectTierInfo(user_id)

  const socialLinks: [
    string | undefined,
    ComponentType<Partial<SocialLinkProps>>
  ][] = [
    [twitter_handle, TwitterSocialLink],
    [instagram_handle, InstagramSocialLink],
    [tiktok_handle, TikTokSocialLink]
  ]

  return (
    <View pointerEvents='box-none' style={styles.root}>
      <ProfileTierTile interactive={false} />
      <View
        style={[
          styles.socials,
          tier !== 'none' && { justifyContent: 'center' }
        ]}
      >
        {socialLinks.map(([handle, Link], index) => {
          const link = <Link showText={socialsCount === 1} />
          if (handle === null) return null
          if (socialsCount === 1) return link
          if (index === socialsCount - 1) return link
          return (
            <Fragment key={index}>
              {link}
              <Divider orientation='vertical' style={styles.divider} />
            </Fragment>
          )
        })}
      </View>
    </View>
  )
}
