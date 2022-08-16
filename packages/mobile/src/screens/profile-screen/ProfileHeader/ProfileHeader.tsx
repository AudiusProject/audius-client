import { useCallback, useEffect, useState } from 'react'

import { getUserId } from 'audius-client/src/common/store/account/selectors'
import type { Animated } from 'react-native'
import { LayoutAnimation, View } from 'react-native'
import { useToggle } from 'react-use'

import { Divider } from 'app/components/core'
import { useSelectTierInfo } from 'app/hooks/useSelectTierInfo'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'

import { ArtistRecommendations } from '../ArtistRecommendations'
import { CoverPhoto } from '../CoverPhoto'
import { ProfileInfo } from '../ProfileInfo'
import { ProfileMetrics } from '../ProfileMetrics'
import { ProfilePicture } from '../ProfilePicture'
import { TipAudioButton } from '../TipAudioButton'
import { UploadTrackButton } from '../UploadTrackButton'
import { useSelectProfile, useSelectProfileRoot } from '../selectors'

import { CollapsedSection } from './CollapsedSection'
import { ExpandHeaderToggleButton } from './ExpandHeaderToggleButton'
import { ExpandedSection } from './ExpandedSection'
import { TopSupporters } from './TopSupporters'

const useStyles = makeStyles(({ palette, spacing }) => ({
  header: {
    backgroundColor: palette.white,
    paddingTop: spacing(8),
    paddingHorizontal: spacing(3)
  },
  profilePicture: {
    position: 'absolute',
    top: 37,
    left: 11,
    zIndex: 100
  },
  divider: { marginHorizontal: -12, marginBottom: spacing(2) },
  bottomDivider: { marginTop: spacing(2), marginHorizontal: -12 }
}))

type ProfileHeaderProps = {
  scrollY: Animated.Value
}

export const ProfileHeader = (props: ProfileHeaderProps) => {
  const { scrollY } = props
  const styles = useStyles()
  const profile = useSelectProfileRoot([
    'user_id',
    'does_current_user_follow',
    'current_user_followee_follow_count'
  ])
  const accountId = useSelectorWeb(getUserId)
  const { tier = 'none' } = useSelectTierInfo(profile?.user_id ?? 0)
  const hasTier = tier !== 'none'
  const isOwner = profile?.user_id === accountId
  const hasMutuals =
    !isOwner && (profile?.current_user_followee_follow_count ?? 0) > 0
  const [hasUserFollowed, setHasUserFollowed] = useToggle(false)
  const {
    website,
    donation,
    twitter_handle: twitterHandle,
    instagram_handle: instagramHandle,
    tiktok_handle: tikTokHandle,
    supporting_count: supportingCount
  } = useSelectProfile([
    'website',
    'donation',
    'twitter_handle',
    'instagram_handle',
    'tiktok_handle',
    'supporting_count'
  ])
  const hasMultipleSocials =
    [website, donation, twitterHandle, instagramHandle, tikTokHandle].filter(
      Boolean
    ).length > 1
  const isSupporting = supportingCount > 0
  const [isExpanded, setIsExpanded] = useToggle(false)
  const [isExpansible, setIsExpansible] = useState(false)

  /**
   * Collapse the component by default if:
   * - profile has a badge tier
   * - profile has mutuals followed accounts with current user
   * - profile has more than one link
   * - profile is supporting (has tipped) other users
   *
   * Note: we also collapse if the profile bio is longer than 3 lines,
   * but that's handled in the Bio component.
   */
  useEffect(() => {
    if (
      !isExpansible &&
      (hasTier || hasMutuals || hasMultipleSocials || isSupporting)
    ) {
      setIsExpansible(true)
    }
  }, [
    isExpansible,
    setIsExpansible,
    hasTier,
    hasMutuals,
    hasMultipleSocials,
    isSupporting
  ])

  const handleFollow = useCallback(() => {
    if (!profile?.does_current_user_follow) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      setHasUserFollowed(true)
    }
  }, [setHasUserFollowed, profile])

  const handleCloseArtistRecs = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setHasUserFollowed(false)
  }, [setHasUserFollowed])

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded)
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }, [isExpanded, setIsExpanded])

  return (
    <>
      <CoverPhoto scrollY={scrollY} />
      <ProfilePicture style={styles.profilePicture} />
      <View pointerEvents='box-none' style={styles.header}>
        <ProfileInfo onFollow={handleFollow} />
        <ProfileMetrics />
        {isExpanded ? (
          <ExpandedSection />
        ) : (
          <CollapsedSection
            isExpansible={isExpansible}
            setIsExpansible={setIsExpansible}
          />
        )}
        {isExpansible ? (
          <ExpandHeaderToggleButton
            isExpanded={isExpanded}
            onPress={handleToggleExpand}
          />
        ) : null}
        <Divider style={styles.divider} />
        {!hasUserFollowed ? null : (
          <ArtistRecommendations onClose={handleCloseArtistRecs} />
        )}
        {isOwner ? <UploadTrackButton /> : <TipAudioButton />}
        <TopSupporters />
        <Divider style={styles.bottomDivider} />
      </View>
    </>
  )
}
