import { useCallback, useEffect, useRef, useState } from 'react'

import {
  Status,
  ShareSource,
  accountSelectors,
  profilePageSelectors,
  profilePageActions,
  reachabilitySelectors,
  shareModalUIActions,
  encodeUrlName
} from '@audius/common'
import { PortalHost } from '@gorhom/portal'
import { useFocusEffect } from '@react-navigation/native'
import { Animated, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconCrown from 'app/assets/images/iconCrown.svg'
import IconSettings from 'app/assets/images/iconSettings.svg'
import IconShare from 'app/assets/images/iconShare.svg'
import { IconButton, Screen } from 'app/components/core'
import { OfflinePlaceholder } from 'app/components/offline-placeholder'
import { useNavigation } from 'app/hooks/useNavigation'
import { usePopToTopOnDrawerOpen } from 'app/hooks/usePopToTopOnDrawerOpen'
import { useRoute } from 'app/hooks/useRoute'
import { TopBarIconButton } from 'app/screens/app-screen'
import { screen } from 'app/services/analytics'
import { makeStyles } from 'app/styles/makeStyles'
import { useThemeColors } from 'app/utils/theme'

import type { ProfileTabScreenParamList } from '../app-screen/ProfileTabScreen'

import { ProfileHeader } from './ProfileHeader'
import { ProfileScreenSkeleton } from './ProfileScreenSkeleton'
import { ProfileTabNavigator } from './ProfileTabNavigator'
import { useSelectProfileRoot } from './selectors'
const { requestOpen: requestOpenShareModal } = shareModalUIActions
const { fetchProfile: fetchProfileAction } = profilePageActions
const { getProfileStatus, getProfileEditStatus } = profilePageSelectors
const { getIsReachable } = reachabilitySelectors
const { getUserId } = accountSelectors

const useStyles = makeStyles(({ spacing }) => ({
  navigator: {
    height: '100%'
  },
  topBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing(-2)
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
  usePopToTopOnDrawerOpen()
  const styles = useStyles()
  const { params } = useRoute<'Profile'>()
  const profile = useSelectProfileRoot([
    'user_id',
    'handle',
    'does_current_user_follow'
  ])
  const handle =
    params.handle && params.handle !== 'accountUser'
      ? params.handle
      : profile?.handle
  const handleLower = handle?.toLowerCase()
  const accountId = useSelector(getUserId)
  const dispatch = useDispatch()
  const status = useSelector((state) => getProfileStatus(state, handleLower))
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { neutralLight4, accentOrange } = useThemeColors()
  const navigation = useNavigation<ProfileTabScreenParamList>()
  const isNotReachable = useSelector(getIsReachable) === false
  const editStatus = useSelector((state) =>
    getProfileEditStatus(state, handleLower)
  )
  const isOwner = profile?.user_id === accountId

  const fetchProfile = useCallback(() => {
    // When profile edited is being still confirmed, prevent fetch call so we
    // don't override the optimistic profile metadata.
    if (isOwner && editStatus === Status.LOADING) return
    dispatch(fetchProfileAction(handleLower, null, true, true, false))
  }, [dispatch, handleLower, isOwner, editStatus])

  useFocusEffect(fetchProfile)

  const handleRefresh = useCallback(() => {
    if (profile) {
      setIsRefreshing(true)
      fetchProfile()
    }
  }, [profile, fetchProfile])

  useEffect(() => {
    if (status === Status.SUCCESS) {
      setIsRefreshing(false)
    }
  }, [status])

  const handlePressSettings = useCallback(() => {
    navigation.push('SettingsScreen')
  }, [navigation])

  const handlePressAudio = useCallback(() => {
    navigation.push('AudioScreen')
  }, [navigation])

  const handlePressShare = useCallback(() => {
    if (profile) {
      dispatch(
        requestOpenShareModal({
          type: 'profile',
          profileId: profile.user_id,
          source: ShareSource.PAGE
        })
      )
    }
  }, [profile, dispatch])

  const topbarLeft = isOwner ? (
    <View style={styles.topBarIcons}>
      <TopBarIconButton
        icon={IconSettings}
        onPress={handlePressSettings}
        hitSlop={{ right: 2 }}
      />
      <TopBarIconButton
        styles={{ root: styles.iconCrownRoot, icon: styles.iconCrown }}
        fill={accentOrange}
        icon={IconCrown}
        onPress={handlePressAudio}
        hitSlop={{ left: 2 }}
      />
    </View>
  ) : undefined

  const topbarRight = (
    <IconButton
      fill={neutralLight4}
      icon={IconShare}
      onPress={handlePressShare}
    />
  )

  const scrollY = useRef(new Animated.Value(0)).current

  const renderHeader = useCallback(
    () => <ProfileHeader scrollY={scrollY} />,
    [scrollY]
  )

  return (
    <Screen
      topbarLeft={topbarLeft}
      topbarRight={topbarRight}
      url={handle && `/${encodeUrlName(handle)}`}
    >
      {!profile ? (
        <ProfileScreenSkeleton />
      ) : (
        <>
          <View style={styles.navigator}>
            {isNotReachable ? (
              <>
                {renderHeader()}
                <OfflinePlaceholder />
              </>
            ) : (
              <>
                <PortalHost name='PullToRefreshPortalHost' />
                <ProfileTabNavigator
                  renderHeader={renderHeader}
                  animatedValue={scrollY}
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              </>
            )}
          </View>
        </>
      )}
    </Screen>
  )
}
