import {
  FeatureFlags,
  getContext,
  IntKeys,
  removeNullable
} from '@audius/common'
import { partition } from 'lodash'
import { call } from 'typed-redux-saga'

type FetchNotificationsParams = {
  limit: number
  timeOffset?: number // unix timestamp
  groupIdOffset?: string
}

export function* fetchNotifications(config: FetchNotificationsParams) {
  const {
    limit,
    timeOffset = Math.round(new Date().getTime() / 1000), // current unix timestamp (sec)
    groupIdOffset
  } = config
  const getFeatureEnabled = yield* getContext('getFeatureEnabled')
  const remoteConfig = yield* getContext('remoteConfigInstance')

  const useDiscoveryNotifications = yield* call(
    getFeatureEnabled,
    FeatureFlags.DISCOVERY_NOTIFICATIONS
  )

  const discoveryNotificationsGenesisUnixTimestamp = remoteConfig.getRemoteVar(
    IntKeys.DISCOVERY_NOTIFICATIONS_GENESIS_UNIX_TIMESTAMP
  )

  const shouldFetchNotificationFromDiscovery =
    useDiscoveryNotifications &&
    discoveryNotificationsGenesisUnixTimestamp &&
    timeOffset > discoveryNotificationsGenesisUnixTimestamp

  if (shouldFetchNotificationFromDiscovery) {
    return yield* call(fetchDiscoveryNotifications, {
      limit,
      timeOffset,
      groupIdOffset
    })
  }

  return yield* call(fetchIdentityNotifications, limit, timeOffset)
}

function* fetchIdentityNotifications(limit: number, timeOffset: number) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const getFeatureEnabled = yield* getContext('getFeatureEnabled')

  const withDethroned = yield* call(
    getFeatureEnabled,
    FeatureFlags.SUPPORTER_DETHRONED_ENABLED
  )

  return yield* call(audiusBackendInstance.getNotifications, {
    limit,
    timeOffset,
    withDethroned
  })
}

function* fetchDiscoveryNotifications(params: FetchNotificationsParams) {
  const { timeOffset, groupIdOffset, limit } = params
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const getFeatureEnabled = yield* getContext('getFeatureEnabled')
  const remoteConfig = yield* getContext('remoteConfigInstance')

  const isRepostOfRepostEnabled = yield* call(
    getFeatureEnabled,
    FeatureFlags.REPOST_OF_REPOST_NOTIFICATIONS
  )
  const isSaveOfRepostEnabled = yield* call(
    getFeatureEnabled,
    FeatureFlags.SAVE_OF_REPOST_NOTIFICATIONS
  )
  const isTrendingPlaylistEnabled = yield* call(
    getFeatureEnabled,
    FeatureFlags.SAVE_OF_REPOST_NOTIFICATIONS
  )
  const isTrendingUndergroundEnabled = yield* call(
    getFeatureEnabled,
    FeatureFlags.SAVE_OF_REPOST_NOTIFICATIONS
  )

  const validTypes = [
    isRepostOfRepostEnabled ? 'repost_of_repost' : null,
    isSaveOfRepostEnabled ? 'save_of_repost' : null,
    isTrendingPlaylistEnabled ? 'trending_playlist' : null,
    isTrendingUndergroundEnabled ? 'trending_underground' : null
  ].filter(removeNullable)

  const discoveryNotifications = yield* call(
    audiusBackendInstance.getDiscoveryNotifications,
    {
      timestamp: timeOffset,
      groupIdOffset,
      limit,
      validTypes
    }
  )

  if ('error' in discoveryNotifications) return discoveryNotifications

  const { notifications, totalUnviewed } = discoveryNotifications

  const discoveryNotificationsGenesisUnixTimestamp = remoteConfig.getRemoteVar(
    IntKeys.DISCOVERY_NOTIFICATIONS_GENESIS_UNIX_TIMESTAMP
  )

  // discovery notifications created after the genesis timestamp are valid,
  // while notifications created before should be discarded
  const [validNotifications, invalidNotifications] = partition(
    notifications,
    ({ timestamp }) =>
      discoveryNotificationsGenesisUnixTimestamp &&
      timestamp > discoveryNotificationsGenesisUnixTimestamp
  )

  if (invalidNotifications.length === 0) {
    return { notifications: validNotifications, totalUnviewed }
  }

  // We have reached the end of valid discovery notifications, fetch identity
  // notifications for remaining

  const newLimit = limit - validNotifications.length
  const newTimestamp =
    validNotifications[validNotifications.length - 1]?.timestamp ?? timeOffset

  const identityNotifications = yield* call(
    fetchIdentityNotifications,
    newLimit,
    newTimestamp
  )

  if ('error' in identityNotifications) {
    return { notifications: validNotifications, totalUnviewed }
  } else {
    return {
      notifications: validNotifications.concat(
        identityNotifications.notifications
      ),
      totalUnviewed
    }
  }
}
