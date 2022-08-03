import { useCallback } from 'react'

import { ID, Name, FeatureFlags } from '@audius/common'
import cn from 'classnames'
import { animated } from 'react-spring'

import { useSelector } from 'common/hooks/useSelector'
import { getAccountUser } from 'common/store/account/selectors'
import Input from 'components/data-entry/Input'
import TextArea from 'components/data-entry/TextArea'
import { SupportingList } from 'components/tipping/support/SupportingList'
import { TopSupporters } from 'components/tipping/support/TopSupporters'
import { TipAudioButton } from 'components/tipping/tip-audio/TipAudioButton'
import { OpacityTransition } from 'components/transition-container/OpacityTransition'
import UploadChip from 'components/upload/UploadChip'
import ProfilePageBadge from 'components/user-badges/ProfilePageBadge'
import { Type } from 'pages/profile-page/components/SocialLink'
import SocialLinkInput from 'pages/profile-page/components/SocialLinkInput'
import { ProfileTags } from 'pages/profile-page/components/desktop/ProfileTags'
import { getFeatureEnabled } from 'services/remote-config/featureFlagHelpers'
import { make, useRecord } from 'store/analytics/actions'
import { UPLOAD_PAGE } from 'utils/route'

import { ProfileBio } from './ProfileBio'
import { ProfileMutuals } from './ProfileMutuals'
import styles from './ProfilePage.module.css'

const messages = {
  aboutYou: 'About You',
  description: 'Description',
  location: 'Location',
  socialHandles: 'Social Handles',
  website: 'Website',
  donate: 'Donate'
}

type ProfileLeftNavProps = {
  userId: ID
  handle: string
  isArtist: boolean
  created: string
  editMode: boolean
  loading: boolean
  isDeactivated: boolean
  goToRoute: (route: string) => void
  twitterHandle: string
  onUpdateTwitterHandle: (handle: string) => void
  instagramHandle: string
  onUpdateInstagramHandle: (handle: string) => void
  tikTokHandle: string
  onUpdateTikTokHandle: (handle: string) => void
  website: string
  onUpdateWebsite: (website: string) => void
  location: string
  onUpdateLocation: (location: string) => void
  donation: string
  onUpdateDonation: (donation: string) => void
  bio: string
  onUpdateBio: (bio: string) => void
  twitterVerified: boolean
  instagramVerified: boolean
  tags: string[]
  isOwner: boolean
}

export const ProfileLeftNav = (props: ProfileLeftNavProps) => {
  const {
    userId,
    handle,
    isArtist,
    created,
    editMode,
    loading,
    isDeactivated,
    goToRoute,
    twitterHandle,
    onUpdateTwitterHandle,
    instagramHandle,
    onUpdateInstagramHandle,
    tikTokHandle,
    onUpdateTikTokHandle,
    website,
    onUpdateWebsite,
    location,
    onUpdateLocation,
    donation,
    onUpdateDonation,
    bio,
    onUpdateBio,
    twitterVerified,
    instagramVerified,
    tags,
    isOwner
  } = props

  const record = useRecord()
  const isTippingEnabled = getFeatureEnabled(FeatureFlags.TIPPING_ENABLED)
  const accountUser = useSelector(getAccountUser)

  const onClickUploadChip = useCallback(() => {
    goToRoute(UPLOAD_PAGE)
    record(make(Name.TRACK_UPLOAD_OPEN, { source: 'profile' }))
  }, [goToRoute, record])

  const renderTipAudioButton = (_: any, style: object) => (
    <animated.div className={styles.tipAudioButtonContainer} style={style}>
      <TipAudioButton />
    </animated.div>
  )

  if (editMode) {
    return (
      <div className={styles.edit}>
        <div className={styles.editLabel}>{messages.aboutYou}</div>
        <div className={styles.editField}>
          <TextArea
            className={styles.descriptionInput}
            size='small'
            grows
            placeholder={messages.description}
            defaultValue={bio || ''}
            onChange={onUpdateBio}
          />
        </div>
        <div className={styles.editField}>
          <Input
            className={styles.locationInput}
            characterLimit={30}
            size='small'
            placeholder={messages.location}
            defaultValue={location || ''}
            onChange={onUpdateLocation}
          />
        </div>
        <div className={cn(styles.editLabel, styles.section)}>
          {messages.socialHandles}
        </div>
        <div className={styles.editField}>
          <SocialLinkInput
            defaultValue={twitterHandle}
            isDisabled={!!twitterVerified}
            className={styles.twitterInput}
            type={Type.TWITTER}
            onChange={onUpdateTwitterHandle}
          />
        </div>
        <div className={styles.editField}>
          <SocialLinkInput
            defaultValue={instagramHandle}
            className={styles.instagramInput}
            isDisabled={!!instagramVerified}
            type={Type.INSTAGRAM}
            onChange={onUpdateInstagramHandle}
          />
        </div>
        <div className={styles.editField}>
          <SocialLinkInput
            defaultValue={tikTokHandle}
            className={styles.tikTokInput}
            type={Type.TIKTOK}
            onChange={onUpdateTikTokHandle}
          />
        </div>
        <div className={cn(styles.editLabel, styles.section)}>
          {messages.website}
        </div>
        <div className={styles.editField}>
          <SocialLinkInput
            defaultValue={website}
            className={styles.websiteInput}
            type={Type.WEBSITE}
            onChange={onUpdateWebsite}
          />
        </div>
        <div className={cn(styles.editLabel, styles.section)}>
          {messages.donate}
        </div>
        <div className={styles.editField}>
          <SocialLinkInput
            defaultValue={donation}
            className={styles.donationInput}
            type={Type.DONATION}
            onChange={onUpdateDonation}
            textLimitMinusLinks={32}
          />
        </div>
      </div>
    )
  } else if (!loading && !isDeactivated) {
    return (
      <div className={styles.about}>
        <ProfilePageBadge userId={userId} className={styles.badge} />
        <ProfileBio
          handle={handle}
          bio={bio}
          location={location}
          website={website}
          donation={donation}
          created={created}
          twitterHandle={twitterHandle}
          instagramHandle={instagramHandle}
          tikTokHandle={tikTokHandle}
        />
        {isTippingEnabled &&
        (!accountUser || accountUser.user_id !== userId) ? (
          <OpacityTransition render={renderTipAudioButton} />
        ) : null}
        {isTippingEnabled && <SupportingList />}
        {isTippingEnabled && <TopSupporters />}
        {isArtist ? <ProfileTags goToRoute={goToRoute} tags={tags} /> : null}
        <ProfileMutuals />
        {isOwner && !isArtist && (
          <UploadChip type='track' variant='nav' onClick={onClickUploadChip} />
        )}
      </div>
    )
  } else {
    return null
  }
}
