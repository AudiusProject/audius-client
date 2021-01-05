/* globals fetch, File */
import React, { useState, useCallback } from 'react'
import cn from 'classnames'

import styles from './ProfilePage.module.css'
import { resizeImage } from 'utils/imageProcessingUtil'
import TwitterOverlay from 'containers/sign-on/components/mobile/TwitterOverlay'
import ProfileForm from 'containers/sign-on/components/ProfileForm'
import { InstagramProfile } from 'store/account/reducer'

const messages = {
  header: 'Tell Us About Yourself So Others Can Find You'
}

type ProfilePageProps = {
  profileImage?: { file: any; url: string }
  twitterId: any
  isVerified: boolean
  name: { value: any; status: any; error: any }
  handle: { value: any; status: any; error: any }
  onNextPage: () => void
  setTwitterProfile: (
    uuid: string,
    profile: any,
    profileImg?: { url: string; file: any },
    coverBannerImg?: { url: string; file: any }
  ) => void
  setInstagramProfile: (
    uuid: string,
    profile: InstagramProfile,
    profileImg?: { url: string; file: any }
  ) => void
  onHandleChange: (handle: string) => void
  onNameChange: (name: string) => void
  setProfileImage: (img: { url: string; file: any }) => void
}

type TwitterProfile = any

const ProfilePage = (props: ProfilePageProps) => {
  // If the handle field is disabled, don't let the user twitter auth
  const [showTwitterOverlay, setShowTwitterOverlay] = useState(
    props.handle.status !== 'disabled'
  )
  const [isInitial, setIsInitial] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const setLoading = useCallback(() => setIsLoading(true), [setIsLoading])
  const setFinishedLoading = useCallback(() => setIsLoading(false), [
    setIsLoading
  ])

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
    setTwitterProfile,
    setInstagramProfile
  } = props

  const onToggleTwitterOverlay = useCallback(() => {
    setShowTwitterOverlay(show => !show)
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

  const onTwitterLogin = async (twitterProfile: TwitterProfile) => {
    try {
      const { uuid, profile } = await twitterProfile.json()
      const profileUrl = profile.profile_image_url_https.replace(
        /_(normal|bigger|mini)/g,
        ''
      )
      const imageBlob = await fetch(profileUrl).then(r => r.blob())
      const artworkFile = new File([imageBlob], 'Artwork', {
        type: 'image/jpeg'
      })
      const file = await resizeImage(artworkFile)
      const url = URL.createObjectURL(file)

      if (profile.profile_banner_url) {
        const bannerImageBlob = await fetch(
          profile.profile_banner_url
        ).then(r => r.blob())
        const bannerArtworkFile = new File([bannerImageBlob], 'Artwork', {
          type: 'image/webp'
        })
        const bannerFile = await resizeImage(
          bannerArtworkFile,
          2000,
          /* square= */ false
        )
        const bannerUrl = URL.createObjectURL(bannerFile)
        setTwitterProfile(
          uuid,
          profile,
          { url, file },
          { url: bannerUrl, file: bannerFile }
        )
      } else {
        setTwitterProfile(uuid, profile, { url, file })
      }
    } catch (err) {
      // TODO: Log error
    } finally {
      setShowTwitterOverlay(false)
      setIsInitial(false)
      setIsLoading(false)
    }
  }

  const onInstagramLogin = async (uuid: string, profile: InstagramProfile) => {
    try {
      if (profile.profile_pic_url_hd) {
        const profileUrl = profile.profile_pic_url_hd
        const imageBlob = await fetch(profileUrl).then(r => r.blob())
        const artworkFile = new File([imageBlob], 'Artwork', {
          type: 'image/jpeg'
        })
        const file = await resizeImage(artworkFile)
        const url = URL.createObjectURL(file)
        setInstagramProfile(uuid, profile, { url, file })
      } else {
        setInstagramProfile(uuid, profile)
      }
    } catch (err) {
      // Continue if error
    } finally {
      setShowTwitterOverlay(false)
      setIsInitial(false)
      setIsLoading(false)
    }
  }

  const onHandleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
      <div className={styles.profileContentContainer}>
        <TwitterOverlay
          header={messages.header}
          isMobile
          initial={isInitial}
          onClick={setLoading}
          isLoading={isLoading}
          onFailure={setFinishedLoading}
          showTwitterOverlay={showTwitterOverlay}
          onTwitterLogin={onTwitterLogin}
          onInstagramLogin={onInstagramLogin}
          onToggleTwitterOverlay={onToggleTwitterOverlay}
        />
        <ProfileForm
          isMobile
          header={messages.header}
          showTwitterOverlay={showTwitterOverlay}
          profileImage={profileImage}
          name={name}
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
