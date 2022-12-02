import { useState, useCallback, useEffect, KeyboardEvent } from 'react'

import {
  AccountImage,
  InstagramProfile,
  TwitterProfile,
  formatInstagramProfile,
  formatTwitterProfile,
  formatTikTokProfile,
  TikTokProfile
} from '@audius/common'
import cn from 'classnames'

import BackButton from 'components/back-button/BackButton'
import { MAIN_CONTENT_ID } from 'pages/App'
import ProfileForm, {
  ProfileFormProps
} from 'pages/sign-on/components/ProfileForm'
import CompleteProfileWithSocial from 'pages/sign-on/components/desktop/CompleteProfileWithSocial'
import { resizeImage } from 'utils/imageProcessingUtil'

import styles from './ProfilePage.module.css'

const GENERAL_ADMISSION = process.env.REACT_APP_GENERAL_ADMISSION ?? ''

const messages = {
  header: 'Tell Us About Yourself So Others Can Find You'
}

type ProfilePageProps = {
  profileImage?: AccountImage
  twitterId: any
  isVerified: boolean
  onNextPage: () => void
  setTwitterProfile: (
    uuid: string,
    profile: TwitterProfile,
    profileImg?: AccountImage,
    coverBannerImg?: AccountImage,
    skipEdit?: boolean
  ) => void
  setInstagramProfile: (
    uuid: string,
    profile: InstagramProfile,
    profileImg?: AccountImage,
    skipEdit?: boolean
  ) => void
  setTikTokProfile: (
    uuid: string,
    profile: TikTokProfile,
    profileImg?: AccountImage,
    skipEdit?: boolean
  ) => void
  recordTwitterStart: () => void
  recordInstagramStart: () => void
  validateHandle: (
    handle: string,
    isOauthVerified: boolean,
    onValidate?: (error: boolean) => void
  ) => void
} & Pick<
  ProfileFormProps,
  'name' | 'handle' | 'onHandleChange' | 'onNameChange' | 'setProfileImage'
>

const ProfilePage = (props: ProfilePageProps) => {
  const {
    name,
    handle,
    isVerified,
    profileImage,
    setProfileImage,
    onHandleChange,
    onNameChange,
    onNextPage,
    twitterId,
    recordTwitterStart,
    recordInstagramStart,
    setTwitterProfile,
    setInstagramProfile,
    setTikTokProfile,
    validateHandle
  } = props

  // If the handle field is disabled, don't let the user social auth
  const [showCompleteProfileWithSocial, setShowCompleteProfileWithSocial] =
    useState(handle.status !== 'disabled')
  const [isInitial, setIsInitial] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const setLoading = useCallback(() => setIsLoading(true), [setIsLoading])
  const setFinishedLoading = useCallback(
    () => setIsLoading(false),
    [setIsLoading]
  )

  /**
   * The margin top causes a secondary scroll for mobile web causing the container to be larger than 100vh
   * This removes the margin top to make the container height 100vh
   */
  useEffect(() => {
    const mainContent = document.getElementById(MAIN_CONTENT_ID)
    if (mainContent) {
      mainContent.classList.add(styles.removeMarginTop)
      return () => {
        mainContent.classList.remove(styles.removeMarginTop)
      }
    }
  }, [])

  const onToggleCompleteProfileWithSocial = useCallback(() => {
    setShowCompleteProfileWithSocial((show) => !show)
    setIsInitial(false)
  }, [])

  const getProfileValid = useCallback(() => {
    return !!(
      name.value &&
      (handle.status === 'success' || handle.status === 'disabled')
    )
  }, [name, handle])

  const onContinue = useCallback(() => {
    if (getProfileValid()) onNextPage()
  }, [getProfileValid, onNextPage])

  const onTwitterLogin = async (twitterProfileRes: Body) => {
    const { uuid, profile: twitterProfile } = await twitterProfileRes.json()
    try {
      const { profile, profileImage, profileBanner, requiresUserReview } =
        await formatTwitterProfile(twitterProfile, resizeImage)

      validateHandle(
        profile.screen_name,
        profile.verified,
        (error: boolean) => {
          setTwitterProfile(
            uuid,
            profile,
            profileImage,
            profileBanner,
            !error && !requiresUserReview
          )
          setShowCompleteProfileWithSocial(false)
          setIsInitial(false)
          setIsLoading(false)
        }
      )
    } catch (err) {
      console.error(err)
      setShowCompleteProfileWithSocial(false)
      setIsInitial(false)
      setIsLoading(false)
    }
  }

  const onInstagramLogin = async (
    uuid: string,
    instagramProfile: InstagramProfile
  ) => {
    try {
      const { profile, profileImage, requiresUserReview } =
        await formatInstagramProfile(
          instagramProfile,
          GENERAL_ADMISSION,
          resizeImage
        )
      validateHandle(
        profile.username,
        profile.is_verified,
        (error: boolean) => {
          setInstagramProfile(
            uuid,
            profile,
            profileImage,
            !error && !requiresUserReview
          )
        }
      )
    } catch (err) {
      // Continue if error
    } finally {
      setShowCompleteProfileWithSocial(false)
      setIsInitial(false)
      setIsLoading(false)
    }
  }

  const onTikTokLogin = async (uuid: string, tikTokProfile: TikTokProfile) => {
    try {
      const { profile, profileImage, requiresUserReview } =
        await formatTikTokProfile(tikTokProfile, resizeImage)
      validateHandle(
        profile.username,
        profile.is_verified,
        (error: boolean) => {
          setTikTokProfile(
            uuid,
            profile,
            profileImage,
            !error && !requiresUserReview
          )
        }
      )
    } catch (err) {
      setShowCompleteProfileWithSocial(false)
      setIsInitial(false)
      setIsLoading(false)
    }
  }

  const onHandleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.keyCode === 13 /** enter */) {
        onContinue()
      }
    },
    [onContinue]
  )

  const canUpdateHandle = !(
    isVerified &&
    twitterId &&
    handle.status === 'success'
  )
  const profileValid = getProfileValid()

  return (
    <div className={cn(styles.container)}>
      {showCompleteProfileWithSocial ? (
        <CompleteProfileWithSocial
          isMobile={false}
          initial={isInitial}
          onClick={setLoading}
          onFailure={setFinishedLoading}
          onInstagramLogin={onInstagramLogin}
          onInstagramStart={recordInstagramStart}
          onTikTokLogin={onTikTokLogin}
          onToggleVisible={onToggleCompleteProfileWithSocial}
          onTwitterLogin={onTwitterLogin}
          onTwitterStart={recordTwitterStart}
          showCompleteProfileWithSocial={showCompleteProfileWithSocial}
        />
      ) : (
        <>
          <h2 className={styles.header}>{messages.header}</h2>
          <BackButton
            light
            onClickBack={onToggleCompleteProfileWithSocial}
            className={cn(styles.backButton, {
              [styles.hide]: showCompleteProfileWithSocial
            })}
          />
          <div className={styles.profileContentContainer}>
            <ProfileForm
              canUpdateHandle={canUpdateHandle}
              handle={handle}
              header={messages.header}
              name={name}
              onContinue={onContinue}
              onHandleChange={onHandleChange}
              onHandleKeyDown={onHandleKeyDown}
              onInstagramLogin={onInstagramLogin}
              onNameChange={onNameChange}
              onToggleTwitterOverlay={onToggleCompleteProfileWithSocial}
              onTwitterLogin={onTwitterLogin}
              profileImage={profileImage}
              profileValid={profileValid}
              setProfileImage={setProfileImage}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default ProfilePage
