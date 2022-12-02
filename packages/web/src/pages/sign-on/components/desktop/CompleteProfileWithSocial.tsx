import { useCallback } from 'react'

import {
  BooleanKeys,
  FeatureFlags,
  TwitterProfile,
  InstagramProfile,
  TikTokProfile
} from '@audius/common'
import { IconImage, IconUser, IconVerified } from '@audius/stems'
import cn from 'classnames'
import { Transition } from 'react-spring/renderprops'

import InstagramButton from 'components/instagram-button/InstagramButton'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { TikTokButton } from 'components/tiktok-button/TikTokButton'
import TwitterAuthButton from 'components/twitter-auth/TwitterAuthButton'
import { useFlag, useRemoteVar } from 'hooks/useRemoteConfig'
import { useTikTokAuth } from 'hooks/useTikTokAuth'

import styles from './CompleteProfileWithSocial.module.css'

const messages = {
  instagramButton: 'Complete with Instagram',
  twitterButton: 'Complete with Twitter',
  tiktokButton: 'Complete with TikTok',
  header: 'Quickly Complete Your Account by Linking Your Other Socials',
  importTileHeader: 'We will import these details',
  importTileItemHandle: 'Handle & Display Name',
  importTileItemPicture: 'Profile Picture & Cover Photo',
  verifiedTileHeader: 'Verified?',
  verifiedTileContent:
    'If the linked account is verified, your Audius account will be verified to match!',
  manual: "I'd rather fill out my profile manually"
}

type TwitterOverlayProps = {
  initial: boolean
  isMobile: boolean
  onClick: () => void
  onFailure: () => void
  onInstagramLogin: (uuid: string, profile: InstagramProfile) => Promise<void>
  onInstagramStart: () => void
  onTikTokLogin: (uuid: string, profile: TikTokProfile) => void
  onToggleVisible: () => void
  onTwitterLogin: (res: Body) => Promise<void>
  onTwitterStart: () => void
  showCompleteProfileWithSocial: boolean
}

const CompleteProfileWithSocial = (props: TwitterOverlayProps) => {
  const {
    initial,
    isMobile,
    onClick,
    onFailure,
    onInstagramLogin,
    onInstagramStart,
    onTikTokLogin,
    onToggleVisible,
    onTwitterLogin,
    onTwitterStart,
    showCompleteProfileWithSocial
  } = props
  const { isEnabled: isTikTokEnabled } = useFlag(
    FeatureFlags.COMPLETE_PROFILE_WITH_TIKTOK
  )
  const displayInstagram = useRemoteVar(
    BooleanKeys.DISPLAY_INSTAGRAM_VERIFICATION_WEB_AND_DESKTOP
  )

  const withTikTokAuth = useTikTokAuth({
    onError: onFailure
  })

  const onClickTwitter = () => {
    onTwitterStart()
    onClick()
  }

  const onClickInstagram = () => {
    onInstagramStart()
    onClick()
  }

  const handleTikTokLogin = useCallback(() => {
    withTikTokAuth(async (accessToken: string) => {
      try {
        // Using TikTok v1 api because v2 does not have CORS headers set
        const result = await fetch(
          `https://open-api.tiktok.com/user/info/?access_token=${accessToken}`,
          {
            method: 'POST',
            body: JSON.stringify({
              fields: [
                'display_name',
                'avatar_url',
                'avatar_large_url',
                'profile_deep_link',
                'is_verified'
              ]
            })
          }
        )
        const resultJson = await result.json()
        console.log(resultJson)
        const tikTokProfile = resultJson.data.user
        onTikTokLogin(tikTokProfile.open_id, tikTokProfile)
      } catch (e) {
        console.log(e)
      }
    })
  }, [withTikTokAuth, onTikTokLogin])

  // TODO: doesn't need to be abs positioned anymore
  return (
    <Transition
      items={showCompleteProfileWithSocial}
      from={{ opacity: initial ? 1 : 0 }}
      enter={{ opacity: 1 }}
      leave={{ opacity: 0 }}
      config={{ duration: 100 }}
    >
      {(show) =>
        show &&
        ((transitionProps) => (
          <div
            style={{
              ...transitionProps,
              zIndex: 10,
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          >
            {!showCompleteProfileWithSocial ? (
              <div className={styles.loadingContainer}>
                <LoadingSpinner className={styles.loadingSpinner} />
              </div>
            ) : (
              <div
                className={cn(styles.twitterOverlayContainer, {
                  [styles.isMobile]: isMobile
                })}
              >
                <h2 className={styles.header}>{messages.header}</h2>
                <div className={styles.tile}>
                  <div className={styles.tileHeader}>
                    {messages.importTileHeader}
                  </div>
                  <ul>
                    <li className={styles.tileListItem}>
                      <div
                        className={cn(
                          styles.tileListItemIcon,
                          styles.tileListItemIconCircle
                        )}
                      >
                        <IconUser />
                      </div>
                      <span>{messages.importTileItemHandle}</span>
                    </li>
                    <li className={styles.tileListItem}>
                      <div
                        className={cn(
                          styles.tileListItemIcon,
                          styles.tileListItemIconCircle
                        )}
                      >
                        <IconImage />
                      </div>
                      <span>{messages.importTileItemPicture}</span>
                    </li>
                  </ul>
                </div>
                <div className={styles.buttonContainer}>
                  <TwitterAuthButton
                    className={styles.socialButton}
                    textLabel={messages.twitterButton}
                    textClassName={styles.btnText}
                    iconClassName={styles.btnIcon}
                    onClick={onClickTwitter}
                    onSuccess={onTwitterLogin}
                    onFailure={onFailure}
                  />
                  {displayInstagram && (
                    <InstagramButton
                      className={styles.socialButton}
                      textClassName={styles.btnText}
                      iconClassName={styles.btnIcon}
                      onClick={onClickInstagram}
                      onSuccess={onInstagramLogin}
                      text={messages.instagramButton}
                      onFailure={onFailure}
                    />
                  )}
                  {isTikTokEnabled || true ? (
                    <TikTokButton
                      className={styles.socialButton}
                      textClassName={styles.btnText}
                      iconClassName={styles.btnIcon}
                      text={messages.tiktokButton}
                      onClick={handleTikTokLogin}
                    />
                  ) : null}
                </div>
                <div className={styles.tile}>
                  <div className={styles.tileHeader}>
                    {messages.verifiedTileHeader}
                  </div>
                  <ul>
                    <li className={styles.tileListItem}>
                      <IconVerified
                        height={24}
                        width={24}
                        className={styles.tileListItemIcon}
                      />
                      <span>{messages.verifiedTileContent}</span>
                    </li>
                  </ul>
                </div>
                <button className={styles.manualText} onClick={onToggleVisible}>
                  {messages.manual}
                </button>
              </div>
            )}
          </div>
        ))
      }
    </Transition>
  )
}
export default CompleteProfileWithSocial
