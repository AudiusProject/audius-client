import React, { useState } from 'react'
import cn from 'classnames'
import PropTypes from 'prop-types'
import { Spring } from 'react-spring/renderprops'
import TwitterLogin from 'react-twitter-auth'
import { Button, ButtonType, IconArrow } from '@audius/stems'

import styles from './ProfileForm.module.css'
import Input from 'components/data-entry/Input'
import ProfilePicture from 'components/general/ProfilePicture'
import { resizeImage } from 'utils/imageProcessingUtil'

import profilePicEmpty from 'assets/img/imageProfilePicEmpty2X.png'
import StatusMessage from 'components/general/StatusMessage'
import InstagramAuth from 'components/general/InstagramAuth'
import { IDENTITY_SERVICE } from 'services/AudiusBackend'

const messages = {
  manual: 'I’d rather fill out my profile manually',
  uploadProfilePicture: 'Upload a profile picture',
  errors: {
    characters: 'Only use A-Z, 0-9, and underscores',
    inUse: 'That handle has already been taken',
    twitterReserved: 'This verified Twitter handle is reserved.',
    instagramReserved: 'This verified Instagram handle is reserved.'
  },
  completeWithTwitter: 'Complete with Twitter to claim',
  completeWithInstagram: 'Complete with Instagram to claim'
}

const ProfileForm = props => {
  const [focus, onChangeFocus] = useState(false)
  const { profileValid, name, handle, profileImage, onContinue } = props

  const onDropArtwork = async selectedFiles => {
    try {
      let file = selectedFiles[0]
      file = await resizeImage(file)
      const url = URL.createObjectURL(file)
      props.setProfileImage({ file, url })
    } catch (err) {
      props.setProfileImage({ ...profileImage, error: err.message })
    }
  }

  const suggestTwitterLogin = handle.error === 'twitterReserved'
  const suggestInstagramLogin = handle.error === 'instagramReserved'

  return (
    <div
      className={cn(styles.profileFormContainer, {
        [styles.isMobile]: props.isMobile,
        [styles.blur]: props.showTwitterOverlay,
        [styles.moveFormUp]: suggestTwitterLogin || suggestInstagramLogin
      })}
    >
      {props.isMobile ? (
        <div className={styles.header}>{props.header}</div>
      ) : null}
      <div className={styles.profilePic}>
        <ProfilePicture
          showEdit={!profileImage}
          isMobile={props.isMobile}
          includePopup={false}
          updatedProfilePicture={
            profileImage ? profileImage.url : profilePicEmpty
          }
          error={profileImage ? profileImage.error : false}
          hasProfilePicture={!!profileImage}
          onDrop={onDropArtwork}
        />
      </div>
      <div
        className={cn(styles.inputContainer, {
          [styles.hide]: props.showTwitterOverlay,
          [styles.errorInput]: handle.error
        })}
      >
        <Input
          placeholder='Display Name'
          name='name'
          autoComplete='off'
          size='medium'
          variant={props.isMobile ? 'normal' : 'elevatedPlaceholder'}
          value={name.value}
          characterLimit={32}
          showCharacterLimit={name.value.length === 32}
          warning={name.value.length === 32}
          onChange={props.onNameChange}
          className={cn(styles.profileInput, styles.nameInput, {
            [styles.placeholder]: props.name.value === ''
          })}
        />
        <div className={styles.handleContainer}>
          <Input
            placeholder='Handle'
            size='medium'
            name='nickname'
            autoComplete='off'
            value={handle.value}
            disabled={!props.canUpdateHandle || handle.status === 'disabled'}
            onChange={props.onHandleChange}
            characterLimit={16}
            showCharacterLimit={handle.value.length === 16}
            warning={handle.value.length === 16}
            onKeyDown={props.onHandleKeyDown}
            variant={props.isMobile ? 'normal' : 'elevatedPlaceholder'}
            onFocus={() => {
              onChangeFocus(true)
            }}
            onBlur={() => {
              onChangeFocus(false)
            }}
            className={cn(styles.profileInput, styles.handleInput, {
              [styles.placeholder]: props.handle.value === ''
            })}
            error={!!handle.error}
          />
          <span
            className={cn(styles.atHandle, {
              [styles.atHandleFocus]: focus || props.handle.value
            })}
          >
            {'@'}
          </span>
        </div>
        {handle.error ? (
          <Spring
            from={{ opacity: 0 }}
            to={{ opacity: 1 }}
            leave={{ opacity: 0 }}
            config={{ duration: 200 }}
          >
            {animProps => (
              <StatusMessage
                status='error'
                containerStyle={animProps}
                containerClassName={styles.errorMessage}
                label={messages.errors[handle.error]}
              />
            )}
          </Spring>
        ) : null}
        {suggestTwitterLogin ? (
          <Spring
            from={{ opacity: 0 }}
            to={{ opacity: 1 }}
            leave={{ opacity: 0 }}
            config={{ duration: 200 }}
          >
            {animProps => (
              <div style={animProps} className={styles.suggestTwitter}>
                <TwitterLogin
                  onFailure={(...args) => console.log(args)}
                  onSuccess={props.onTwitterLogin}
                  className={styles.hideTwitterButton}
                  requestTokenUrl={`${IDENTITY_SERVICE}/twitter`}
                  loginUrl={`${IDENTITY_SERVICE}/twitter/callback`}
                >
                  {messages.completeWithTwitter}
                </TwitterLogin>
              </div>
            )}
          </Spring>
        ) : null}
        {suggestInstagramLogin ? (
          <Spring
            from={{ opacity: 0 }}
            to={{ opacity: 1 }}
            leave={{ opacity: 0 }}
            config={{ duration: 200 }}
          >
            {animProps => (
              <div style={animProps} className={styles.suggestTwitter}>
                <InstagramAuth
                  onFailure={(...args) => console.log(args)}
                  onSuccess={props.onInstagramLogin}
                  className={styles.hideTwitterButton}
                  setProfileUrl={`${IDENTITY_SERVICE}/instagram/profile`}
                  getUserUrl={`${IDENTITY_SERVICE}/instagram`}
                >
                  {messages.completeWithInstagram}
                </InstagramAuth>
              </div>
            )}
          </Spring>
        ) : null}
      </div>
      <Button
        text='Continue'
        name='continue'
        rightIcon={<IconArrow />}
        type={profileValid ? ButtonType.PRIMARY_ALT : ButtonType.DISABLED}
        onClick={onContinue}
        textClassName={styles.continueButtonText}
        className={cn(styles.continueButton, {
          [styles.hide]: props.showTwitterOverlay
        })}
      />
    </div>
  )
}

const field = PropTypes.shape({
  value: PropTypes.string,
  error: PropTypes.string,
  status: PropTypes.string
})

ProfileForm.propTypes = {
  header: PropTypes.string,
  isMobile: PropTypes.bool,
  showTwitterOverlay: PropTypes.bool,
  profileImage: PropTypes.any,
  name: field,
  onTwitterLogin: PropTypes.func,
  onToggleTwitterOverlay: PropTypes.func,
  profileValid: PropTypes.bool,
  canUpdateHandle: PropTypes.bool,
  handle: field,
  setProfileImage: PropTypes.func,
  onHandleKeyDown: PropTypes.func,
  onHandleChange: PropTypes.func,
  onNameChange: PropTypes.func,
  onContinue: PropTypes.func
}

ProfileForm.defaultProps = {}

export default ProfileForm
