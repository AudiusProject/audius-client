/* FeatureFlags must be lowercase snake case */
export enum FeatureFlags {
  TRENDING_UNDERGROUND = 'trending_underground',
  SOLANA_LISTEN_ENABLED = 'solana_listen_enabled',
  USE_TRACK_CONTENT_POLLING = 'use_track_content_polling',
  USE_RESUMABLE_TRACK_UPLOAD = 'use_resumable_track_upload',
  PLAYLIST_UPDATES_ENABLED = 'playlist_updates_enabled'
}

export const flagDefaults: { [key in FeatureFlags]: boolean } = {
  [FeatureFlags.TRENDING_UNDERGROUND]: false,
  [FeatureFlags.USE_TRACK_CONTENT_POLLING]: true,
  [FeatureFlags.SOLANA_LISTEN_ENABLED]: false,
  [FeatureFlags.USE_RESUMABLE_TRACK_UPLOAD]: true,
  [FeatureFlags.PLAYLIST_UPDATES_ENABLED]: false
}

export enum FeatureFlagBucketType {
  USER_ID = 'user_id',
  SESSION_ID = 'session_id'
}

export const flagBucketType: {
  [key in FeatureFlags]: FeatureFlagBucketType
} = {
  [FeatureFlags.USE_TRACK_CONTENT_POLLING]: FeatureFlagBucketType.SESSION_ID,
  [FeatureFlags.SOLANA_LISTEN_ENABLED]: FeatureFlagBucketType.SESSION_ID,
  [FeatureFlags.USE_RESUMABLE_TRACK_UPLOAD]: FeatureFlagBucketType.SESSION_ID,
  [FeatureFlags.TRENDING_UNDERGROUND]: FeatureFlagBucketType.USER_ID,
  [FeatureFlags.PLAYLIST_UPDATES_ENABLED]: FeatureFlagBucketType.USER_ID
}

export const OPTIMIZELY_LOCAL_STORAGE_KEY = 'optimizelyKey'
