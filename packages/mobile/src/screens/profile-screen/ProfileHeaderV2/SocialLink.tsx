import { StyleProp, ViewStyle } from 'react-native'

import IconInstagram from 'app/assets/images/iconInstagram.svg'
import IconTikTok from 'app/assets/images/iconTikTokInverted.svg'
import IconTwitterBird from 'app/assets/images/iconTwitterBird.svg'
import {
  Text,
  LinkProps,
  Link,
  IconButtonProps,
  Hyperlink
} from 'app/components/core'
import Skeleton from 'app/components/skeleton'
import { makeStyles } from 'app/styles'
import { EventNames } from 'app/types/analytics'
import { make } from 'app/utils/analytics'
import { useThemeColors } from 'app/utils/theme'

import { useSelectProfile } from '../selectors'
import { squashNewLines } from '../utils'

const useStyles = makeStyles(({ palette, spacing }) => ({
  icon: {
    height: 28,
    width: 28,
    fill: palette.neutral
  },
  skeleton: {
    height: 28,
    width: 28
  },
  withText: { flexDirection: 'row', alignItems: 'center' },
  text: { marginLeft: spacing(2), marginBottom: 0 },
  hyperlink: {
    color: palette.neutral
  }
}))

export type SocialLinkProps = LinkProps &
  Pick<IconButtonProps, 'icon'> & {
    style?: StyleProp<ViewStyle>
    text?: string
    showText?: boolean
    hyperlink?: boolean
  }

export const SocialLink = (props: SocialLinkProps) => {
  const { text, showText, url, icon: Icon, hyperlink, style, ...other } = props
  const styles = useStyles()
  const { neutral } = useThemeColors()

  if (text === undefined) {
    return <Skeleton style={styles.skeleton} />
  }

  if (text === null) {
    return null
  }

  const iconButtonElement = <Icon height={28} width={28} fill={neutral} />

  if (showText)
    return (
      <Link url={url} style={[styles.withText, style]} {...other}>
        {iconButtonElement}
        {hyperlink ? (
          <Hyperlink
            source='profile page'
            text={squashNewLines(text)}
            style={[styles.text, styles.hyperlink]}
          />
        ) : (
          <Text numberOfLines={1} style={styles.text}>
            {text}
          </Text>
        )}
      </Link>
    )

  return (
    <Link url={url} style={style}>
      {iconButtonElement}
    </Link>
  )
}

type TwitterSocialLinkProps = Partial<SocialLinkProps>

export const TwitterSocialLink = (props: TwitterSocialLinkProps) => {
  const { handle, twitter_handle } = useSelectProfile([
    'handle',
    'twitter_handle'
  ])

  const sanitizedHandle = handle.replace('@', '')

  return (
    <SocialLink
      url={`https://twitter.com/${twitter_handle}`}
      text={twitter_handle ? `@${twitter_handle}` : twitter_handle}
      icon={IconTwitterBird}
      analytics={make({
        eventName: EventNames.PROFILE_PAGE_CLICK_TWITTER,
        handle: sanitizedHandle,
        twitterHandle: twitter_handle as string
      })}
      {...props}
    />
  )
}

type InstagramSocialLinkProps = Partial<SocialLinkProps>

export const InstagramSocialLink = (props: InstagramSocialLinkProps) => {
  const { handle, instagram_handle } = useSelectProfile([
    'handle',
    'instagram_handle'
  ])

  const sanitizedHandle = handle.replace('@', '')

  return (
    <SocialLink
      url={`https://instagram.com/${instagram_handle}`}
      text={instagram_handle ? `@${instagram_handle}` : instagram_handle}
      icon={IconInstagram}
      analytics={make({
        eventName: EventNames.PROFILE_PAGE_CLICK_INSTAGRAM,
        handle: sanitizedHandle,
        instagramHandle: instagram_handle as string
      })}
      {...props}
    />
  )
}

type TikTokSocialLinkProps = Partial<SocialLinkProps>

export const TikTokSocialLink = (props: TikTokSocialLinkProps) => {
  const { handle, tiktok_handle } = useSelectProfile([
    'handle',
    'tiktok_handle'
  ])

  const sanitizedHandle = handle.replace('@', '')

  return (
    <SocialLink
      url={`https://tiktok.com/@${tiktok_handle}`}
      text={tiktok_handle ? `@${tiktok_handle}` : tiktok_handle}
      icon={IconTikTok}
      analytics={make({
        eventName: EventNames.PROFILE_PAGE_CLICK_TIKTOK,
        handle: sanitizedHandle,
        tikTokHandle: tiktok_handle as string
      })}
      {...props}
    />
  )
}
