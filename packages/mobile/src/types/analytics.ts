import type {
  AllTrackingEvents as CommonTrackingEvents,
  ID
} from '@audius/common'
import { Name as CommonEventNames } from '@audius/common'

import type { DownloadQueueItem } from 'app/store/offline-downloads/slice'

enum MobileEventNames {
  NOTIFICATIONS_OPEN_PUSH_NOTIFICATION = 'Notifications: Open Push Notification',
  APP_ERROR = 'App Unexpected Error',
  SHARE_TO_IG_STORY = 'Share to Instagram story - start',
  SHARE_TO_IG_STORY_CANCELLED = 'Share to Instagram story - cancelled',
  SHARE_TO_IG_STORY_ERROR = 'Share to Instagram story - error',
  SHARE_TO_IG_STORY_SUCCESS = 'Share to Instagram story - success',
  SHARE_TO_SNAPCHAT = 'Share to Snapchat - start',
  SHARE_TO_SNAPCHAT_CANCELLED = 'Share to Snapchat - cancelled',
  SHARE_TO_SNAPCHAT_ERROR = 'Share to Snapchat - error',
  SHARE_TO_SNAPCHAT_STORY_SUCCESS = 'Share to Snapchat - success',
  SHARE_TO_TIKTOK_VIDEO = 'Share to TikTok (video) - start',
  SHARE_TO_TIKTOK_VIDEO_CANCELLED = 'Share to TikTok (video) - cancelled',
  SHARE_TO_TIKTOK_VIDEO_ERROR = 'Share to TikTok (video) - error',
  SHARE_TO_TIKTOK_VIDEO_SUCCESS = 'Share to TikTok (video) - success',

  // Offline Mode
  OFFLINE_MODE_DOWNLOAD_ALL_TOGGLE_ON = 'Offline Mode: Download All Toggle On',
  OFFLINE_MODE_DOWNLOAD_ALL_TOGGLE_OFF = 'Offline Mode: Download All Toggle Off',
  OFFLINE_MODE_DOWNLOAD_COLLECTION_TOGGLE_ON = 'Offline Mode: Download Collection Toggle On',
  OFFLINE_MODE_DOWNLOAD_COLLECTION_TOGGLE_OFF = 'Offline Mode: Download Collection Toggle Off',
  OFFLINE_MODE_DOWNLOAD_REQUEST = 'Offline Mode: Download Item Request',
  OFFLINE_MODE_DOWNLOAD_SUCCESS = 'Offline Mode: Download Item Success',
  OFFLINE_MODE_DOWNLOAD_FAILURE = 'Offline Mode: Download Item Failure',
  OFFLINE_MODE_REMOVE_ITEM = 'Offline Mode: Remove Item',
  OFFLINE_MODE_PLAY = 'Offline Mode: Offline Play'
}

export const EventNames = { ...CommonEventNames, ...MobileEventNames }

type NotificationsOpenPushNotification = {
  eventName: MobileEventNames.NOTIFICATIONS_OPEN_PUSH_NOTIFICATION
  title?: string
  body?: string
}

type ShareToIGStory = {
  eventName:
    | MobileEventNames.SHARE_TO_IG_STORY
    | MobileEventNames.SHARE_TO_IG_STORY_CANCELLED
    | MobileEventNames.SHARE_TO_IG_STORY_SUCCESS
  title?: string
  artist?: string
}

type ShareToSnapchat = {
  eventName:
    | MobileEventNames.SHARE_TO_SNAPCHAT
    | MobileEventNames.SHARE_TO_SNAPCHAT_CANCELLED
    | MobileEventNames.SHARE_TO_SNAPCHAT_STORY_SUCCESS
  title?: string
  artist?: string
}

type ShareToTikTokVideo = {
  eventName:
    | MobileEventNames.SHARE_TO_TIKTOK_VIDEO
    | MobileEventNames.SHARE_TO_TIKTOK_VIDEO_CANCELLED
    | MobileEventNames.SHARE_TO_TIKTOK_VIDEO_SUCCESS
  title?: string
  artist?: string
}

type ShareToIGStoryError = {
  eventName: MobileEventNames.SHARE_TO_IG_STORY_ERROR
  title?: string
  artist?: string
  error: string
}

type ShareToSnapchatError = {
  eventName: MobileEventNames.SHARE_TO_SNAPCHAT_ERROR
  title?: string
  artist?: string
  error: string
}

type ShareToTikTokVideoError = {
  eventName: MobileEventNames.SHARE_TO_TIKTOK_VIDEO_ERROR
  title?: string
  artist?: string
  error: string
}

type AppError = {
  eventName: MobileEventNames.APP_ERROR
  message?: string
}

type OfflineModeDownloadAllToggleOn = {
  eventName: MobileEventNames.OFFLINE_MODE_DOWNLOAD_ALL_TOGGLE_ON
}

type OfflineModeDownloadAllToggleOff = {
  eventName: MobileEventNames.OFFLINE_MODE_DOWNLOAD_ALL_TOGGLE_OFF
}

type OfflineModeDownloadCollectionToggleOn = {
  eventName: MobileEventNames.OFFLINE_MODE_DOWNLOAD_COLLECTION_TOGGLE_ON
  collectionId: ID
}

type OfflineModeDownloadCollectionToggleOff = {
  eventName: MobileEventNames.OFFLINE_MODE_DOWNLOAD_COLLECTION_TOGGLE_OFF
  collectionId: ID
}

type OfflineModeDownloadRequest = DownloadQueueItem & {
  eventName: MobileEventNames.OFFLINE_MODE_DOWNLOAD_REQUEST
}

type OfflineModeDownloadSuccess = DownloadQueueItem & {
  eventName: MobileEventNames.OFFLINE_MODE_DOWNLOAD_SUCCESS
}

type OfflineModeDownloadFailure = DownloadQueueItem & {
  eventName: MobileEventNames.OFFLINE_MODE_DOWNLOAD_FAILURE
}

type OfflineModeRemoveItem = DownloadQueueItem & {
  eventName: MobileEventNames.OFFLINE_MODE_REMOVE_ITEM
}

type OfflineModePlay = {
  eventName: MobileEventNames.OFFLINE_MODE_PLAY
  trackId: ID
}

type MobileTrackingEvents =
  | NotificationsOpenPushNotification
  | AppError
  | ShareToIGStory
  | ShareToIGStoryError
  | ShareToSnapchat
  | ShareToSnapchatError
  | ShareToTikTokVideo
  | ShareToTikTokVideoError
  | OfflineModeDownloadAllToggleOn
  | OfflineModeDownloadAllToggleOff
  | OfflineModeDownloadCollectionToggleOn
  | OfflineModeDownloadCollectionToggleOff
  | OfflineModeDownloadFailure
  | OfflineModeDownloadRequest
  | OfflineModeDownloadSuccess
  | OfflineModeRemoveItem
  | OfflineModePlay

export type AllEvents = CommonTrackingEvents | MobileTrackingEvents

export type JsonMap = Record<string, unknown>

export type Track = {
  eventName: string
  properties?: JsonMap
}

export type Screen = {
  route: string
  properties?: JsonMap
}

export {
  PlaybackSource,
  ShareSource,
  RepostSource,
  FavoriteSource,
  FollowSource,
  CreatePlaylistSource
} from '@audius/common'
