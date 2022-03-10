import { useCallback, useEffect, useState } from 'react'

import Status from 'audius-client/src/common/models/Status'
import { fetchProfile } from 'audius-client/src/common/store/pages/profile/actions'
import { getProfileStatus } from 'audius-client/src/common/store/pages/profile/selectors'
import { LayoutAnimation, View } from 'react-native'
import { useToggle } from 'react-use'

import IconCrown from 'app/assets/images/iconCrown.svg'
import IconSettings from 'app/assets/images/iconSettings.svg'
import { TopBarIconButton } from 'app/components/app-navigator/TopBarIconButton'
import { ProfileStackParamList } from 'app/components/app-navigator/types'
import { Screen, VirtualizedScrollView } from 'app/components/core'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useNavigation } from 'app/hooks/useNavigation'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles/makeStyles'
import { useThemeColors } from 'app/utils/theme'

import { ArtistRecommendations } from './ArtistRecommendations/ArtistRecommendations'
import { CoverPhoto } from './CoverPhoto'
import { ExpandableBio } from './ExpandableBio'
import { ProfileInfo } from './ProfileInfo'
import { ProfileMetrics } from './ProfileMetrics'
import { ProfilePicture } from './ProfilePicture'
import { ProfileSocials } from './ProfileSocials'
import { ProfileTabNavigator } from './ProfileTabNavigator'
import { UploadTrackButton } from './UploadTrackButton'
import { getIsOwner, useSelectProfileRoot } from './selectors'

const useStyles = makeStyles(({ palette, spacing }) => ({
  header: {
    backgroundColor: palette.neutralLight10,
    paddingTop: spacing(8),
    paddingHorizontal: spacing(3),
    paddingBottom: spacing(3)
  },
  profilePicture: {
    position: 'absolute',
    top: 37,
    left: 11,
    zIndex: 100
  },
  navigator: {
    height: '100%'
  },
  topBarIcons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconCrownRoot: {
    marginLeft: spacing(1)
  },
  iconCrown: {
    height: 22,
    width: 22
  }
}))

export const ProfileScreen = () => {
  const styles = useStyles()
  const profile = useSelectProfileRoot(['does_current_user_follow'])
  const isOwner = useSelectorWeb(getIsOwner)
  const dispatchWeb = useDispatchWeb()
  const status = useSelectorWeb(getProfileStatus)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasUserFollowed, setHasUserFollowed] = useToggle(false)
  const { accentOrange } = useThemeColors()

  console.log('rerender profile')

  const navigation = useNavigation<ProfileStackParamList>()

  const handleNavigateSettings = useCallback(() => {
    navigation.push({
      native: { screen: 'SettingsScreen', params: undefined },
      web: { route: '/settings' }
    })
  }, [navigation])

  const handleNavigateAudio = useCallback(() => {
    navigation.push({
      native: { screen: 'AudioScreen', params: undefined },
      web: { route: '/audio ' }
    })
  }, [navigation])

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

  const handleRefresh = useCallback(() => {
    if (profile) {
      setIsRefreshing(true)
      const { handle, user_id } = profile
      dispatchWeb(fetchProfile(handle, user_id, true, true, true))
    }
  }, [profile, dispatchWeb])

  useEffect(() => {
    if (status === Status.SUCCESS) {
      setIsRefreshing(false)
    }
  }, [status])

  const topbarLeft = isOwner ? (
    <View style={styles.topBarIcons}>
      <TopBarIconButton icon={IconSettings} onPress={handleNavigateSettings} />
      <TopBarIconButton
        styles={{ root: styles.iconCrownRoot, icon: styles.iconCrown }}
        fill={accentOrange}
        icon={IconCrown}
        onPress={handleNavigateAudio}
      />
    </View>
  ) : undefined

  return (
    <Screen topbarLeft={topbarLeft}>
      {!profile ? null : (
        <VirtualizedScrollView
          listKey='profile-screen'
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
        >
          <CoverPhoto />
          <ProfilePicture style={styles.profilePicture} />
          <View style={styles.header}>
            <ProfileInfo onFollow={handleFollow} />
            <ProfileMetrics />
            <ProfileSocials />
            <ExpandableBio />
            {!hasUserFollowed ? null : (
              <ArtistRecommendations onClose={handleCloseArtistRecs} />
            )}
            {!isOwner ? null : <UploadTrackButton />}
          </View>
          <View style={styles.navigator}>
            <ProfileTabNavigator />
          </View>
        </VirtualizedScrollView>
      )}
    </Screen>
  )
}
