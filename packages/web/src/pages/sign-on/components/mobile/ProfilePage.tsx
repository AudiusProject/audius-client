import { useState, useCallback, useEffect, KeyboardEvent } from 'react'

import {
  AccountImage,
  InstagramProfile,
  TwitterProfile,
  formatInstagramProfile,
  formatTwitterProfile
} from '@audius/common'
import cn from 'classnames'

import { MAIN_CONTENT_ID } from 'pages/App'
import ProfileForm from 'pages/sign-on/components/ProfileForm'
import TwitterOverlay from 'pages/sign-on/components/mobile/TwitterOverlay'
import { resizeImage } from 'utils/imageProcessingUtil'

import styles from './ProfilePage.module.css'

const GENERAL_ADMISSION = process.env.REACT_APP_GENERAL_ADMISSION || ''

const messages = {
  header: 'Tell Us About Yourself So Others Can Find You'
}

type ProfilePageProps = {
  profileImage?: AccountImage
  twitterId: any
  isVerified: boolean
  name: { value: any; status: any; error: any }
  handle: { value: any; status: any; error: any }
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
  onHandleChange: (handle: string) => void
  onNameChange: (name: string) => void
  setProfileImage: (img: AccountImage) => void
  recordTwitterStart: () => void
  recordInstagramStart: () => void
  validateHandle: (
    handle: string,
    isOauthVerified: boolean,
    onValidate?: (error: boolean) => void
  ) => void
}

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
    validateHandle
  } = props

  // If the handle field is disabled, don't let the user twitter auth
  const [showTwitterOverlay, setShowTwitterOverlay] = useState(
    props.handle.status !== 'disabled'
  )
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

  const onToggleTwitterOverlay = useCallback(() => {
    setShowTwitterOverlay((show) => !show)
    setIsInitial(false)
  }, [])

  const getProfileValid = useCallback(() => {
    return (
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
          setShowTwitterOverlay(false)
          setIsInitial(false)
          setIsLoading(false)
        }
      )
    } catch (err) {
      console.error(err)
      setShowTwitterOverlay(false)
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
      setShowTwitterOverlay(false)
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
      <div
        className={cn(styles.profileContentContainer, {
          [styles.authOverlay]: showTwitterOverlay
        })}
      >
        <TwitterOverlay
          header={messages.header}
          isMobile
          initial={isInitial}
          onClick={setLoading}
          isLoading={isLoading}
          onFailure={setFinishedLoading}
          showTwitterOverlay={showTwitterOverlay}
          onTwitterStart={recordTwitterStart}
          onInstagramStart={recordInstagramStart}
          onTwitterLogin={onTwitterLogin}
          onInstagramLogin={onInstagramLogin}
          onToggleTwitterOverlay={onToggleTwitterOverlay}
        />
        <ProfileForm
          isMobile
          header={messages.header}
          profileImage={profileImage}
          name={name}
          onInstagramLogin={onInstagramLogin}
          onTwitterLogin={onTwitterLogin}
          onToggleTwitterOverlay={onToggleTwitterOverlay}
          canUpdateHandle={canUpdateHandle}
          handle={handle}
          setProfileImage={setProfileImage}
          profileValid={profileValid}
          onHandleKeyDown={onHandleKeyDown}
          onHandleChange={onHandleChange}
          onNameChange={onNameChange}
          onContinue={onContinue}
        />
      </div>
    </div>
  )
}

export default ProfilePage
