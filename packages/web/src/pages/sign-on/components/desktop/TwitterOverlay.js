import { BooleanKeys } from '@audius/common'
import cn from 'classnames'
import PropTypes from 'prop-types'
import { Transition } from 'react-spring/renderprops'

import { ReactComponent as IconVerified } from 'assets/img/iconVerified.svg'
import InstagramButton from 'components/instagram-button/InstagramButton'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { TikTokButton } from 'components/tiktok-button/TikTokButton'
import TwitterAuthButton from 'components/twitter-auth/TwitterAuthButton'
import { useRemoteVar } from 'hooks/useRemoteConfig'

import styles from './TwitterOverlay.module.css'

const messages = {
  instagramButton: 'Complete with Instagram',
  twitterButton: 'Complete with Twitter',
  tiktokButton: 'Complete with TikTok',
  header: 'Quickly Complete Your Account by Linking Your Other Socials',
  twitterChecks: [
    'Display Name',
    'Handle',
    'Profile Picture',
    'Cover Photo',
    <div key={'verify'}>
      <div>
        {'Verification'} <IconVerified className={styles.verified} />
      </div>
      <div className={styles.ifApplicable}>{'(if applicable)'}</div>
    </div>
  ],
  manual: "I'd rather fill out my profile manually"
}

const TwitterOverlay = (props) => {
  const displayInstagram = useRemoteVar(
    BooleanKeys.DISPLAY_INSTAGRAM_VERIFICATION_WEB_AND_DESKTOP
  )

  const onClickTwitter = () => {
    props.onTwitterStart()
    props.onClick()
  }

  const onClickInstagram = () => {
    props.onInstagramStart()
    props.onClick()
  }

  // TODO: doesn't need to be abs positioned anymore
  return (
    <Transition
      items={props.showTwitterOverlay}
      from={{ opacity: props.initial ? 1 : 0 }}
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
            {props.isLoading || !props.showTwitterOverlay ? (
              <div className={styles.loadingContainer}>
                <LoadingSpinner className={styles.loadingSpinner} />
              </div>
            ) : (
              <div
                className={cn(styles.twitterOverlayContainer, {
                  [styles.isMobile]: props.isMobile
                })}
              >
                <h2 className={styles.header}>{messages.header}</h2>
                {displayInstagram && (
                  <InstagramButton
                    className={styles.instagramButton}
                    textClassName={styles.btnText}
                    iconClassName={styles.btnIcon}
                    onClick={onClickInstagram}
                    onSuccess={props.onInstagramLogin}
                    onFailure={props.onFailure}
                    text={messages.instagramButton}
                  />
                )}
                <TwitterAuthButton
                  showIcon={false}
                  className={styles.twitterButton}
                  textLabel={messages.twitterButton}
                  textClassName={styles.btnText}
                  iconClassName={styles.btnIcon}
                  onClick={onClickTwitter}
                  onSuccess={props.onTwitterLogin}
                  onFailure={props.onFailure}
                />
                <TikTokButton
                  className={styles.instagramButton}
                  textClassName={styles.btnText}
                  iconClassName={styles.btnIcon}
                  text={messages.tiktokButton}
                />
                <button
                  className={styles.manualText}
                  onClick={props.onToggleTwitterOverlay}
                >
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

TwitterOverlay.propTypes = {
  showTwitterOverlay: PropTypes.bool,
  initial: PropTypes.bool,
  onClick: PropTypes.func,
  onTwitterStart: PropTypes.func,
  onInstagramStart: PropTypes.func,
  onTwitterLogin: PropTypes.func,
  onInstagramLogin: PropTypes.func,
  isMobile: PropTypes.bool
}

TwitterOverlay.defaultProps = {
  initial: false,
  isMobile: false
}

export default TwitterOverlay
