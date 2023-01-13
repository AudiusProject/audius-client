import { useCallback, useEffect, useRef, useState } from 'react'

import {
  Status,
  ShareSource,
  profilePageSelectors,
  profilePageActions,
  reachabilitySelectors,
  shareModalUIActions,
  encodeUrlName
} from '@audius/common'
import { PortalHost } from '@gorhom/portal'
import { Animated, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconShare from 'app/assets/images/iconShare.svg'
import { IconButton, Screen } from 'app/components/core'
import { OfflinePlaceholder } from 'app/components/offline-placeholder'
import { useAppTabScreen } from 'app/hooks/useAppTabScreen'
import { useRoute } from 'app/hooks/useRoute'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

import { ProfileHeader } from './ProfileHeader'
import { ProfileScreenSkeleton } from './ProfileScreenSkeleton'
import { ProfileTabNavigator } from './ProfileTabNavigator'
import { useSelectProfileRoot } from './selectors'
const { requestOpen: requestOpenShareModal } = shareModalUIActions
const { fetchProfile: fetchProfileAction } = profilePageActions
const { getProfileStatus } = profilePageSelectors
const { getIsReachable } = reachabilitySelectors

const useStyles = makeStyles(() => ({
  navigator: {
    height: '100%'
  }
}))

export const ProfileScreen = () => {
  useAppTabScreen()
  const styles = useStyles()
  const { params } = useRoute<'Profile'>()
  const { handle: userHandle, id } = params
  const profile = useSelectProfileRoot([
    'user_id',
    'handle',
    'does_current_user_follow'
  ])
  const handle =
    userHandle && userHandle !== 'accountUser' ? userHandle : profile?.handle
  const handleLower = handle?.toLowerCase() ?? ''
  const dispatch = useDispatch()
  const status = useSelector((state) => getProfileStatus(state, handleLower))
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { neutralLight4 } = useThemeColors()
  const isNotReachable = useSelector(getIsReachable) === false

  const fetchProfile = useCallback(() => {
    dispatch(fetchProfileAction(handleLower, id ?? null, false, false, false))
  }, [dispatch, handleLower, id])

  useEffect(() => {
    if (status === Status.IDLE) {
      fetchProfile()
    }
  }, [fetchProfile, status])

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
