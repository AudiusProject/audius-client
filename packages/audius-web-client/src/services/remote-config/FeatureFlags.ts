/* FeatureFlags must be lowercase snake case */
export enum FeatureFlags {
  TRENDING_UNDERGROUND = 'trending_underground',
  SOLANA_LISTEN_ENABLED = 'solana_listen_enabled',
  USE_TRACK_CONTENT_POLLING = 'use_track_content_polling',
  USE_RESUMABLE_TRACK_UPLOAD = 'use_resumable_track_upload',
  PLAYLIST_UPDATES_ENABLED = 'playlist_updates_enabled',
  CREATE_WAUDIO_USER_BANK_ON_SIGN_UP = 'create_waudio_user_bank_on_sign_up',
  SHARE_SOUND_TO_TIKTOK = 'share_sound_to_tiktok'
}

/**
 * If optimizely errors, these default values are used.
 */
export const flagDefaults: { [key in FeatureFlags]: boolean } = {
  [FeatureFlags.TRENDING_UNDERGROUND]: false,
  [FeatureFlags.USE_TRACK_CONTENT_POLLING]: false,
  [FeatureFlags.SOLANA_LISTEN_ENABLED]: false,
  [FeatureFlags.USE_RESUMABLE_TRACK_UPLOAD]: false,
  [FeatureFlags.PLAYLIST_UPDATES_ENABLED]: false,
  [FeatureFlags.CREATE_WAUDIO_USER_BANK_ON_SIGN_UP]: false,
  [FeatureFlags.SHARE_SOUND_TO_TIKTOK]: true
}

export enum FeatureFlagCohortType {
  /**
   * Segments feature experiments by a user's id. If userId is not present,
   * the feature is off.
   */
  USER_ID = 'user_id',
  /**
   * Segments feature experiments by a random uuid set in local storage defined by FEATURE_FLAG_LOCAL_STORAGE_SESSION_KEY.
   * There should always be a value for sessionId. This is managed in Provider.ts
   */
  SESSION_ID = 'session_id'
}

export const flagCohortType: {
  [key in FeatureFlags]: FeatureFlagCohortType
} = {
  [FeatureFlags.USE_TRACK_CONTENT_POLLING]: FeatureFlagCohortType.SESSION_ID,
  [FeatureFlags.SOLANA_LISTEN_ENABLED]: FeatureFlagCohortType.SESSION_ID,
  [FeatureFlags.USE_RESUMABLE_TRACK_UPLOAD]: FeatureFlagCohortType.SESSION_ID,
  [FeatureFlags.TRENDING_UNDERGROUND]: FeatureFlagCohortType.USER_ID,
  [FeatureFlags.PLAYLIST_UPDATES_ENABLED]: FeatureFlagCohortType.USER_ID,
  // Create wAudio user bank on sign up is a session id experiment because it only impacts
  // unauthenticated sessions during sign up
  [FeatureFlags.CREATE_WAUDIO_USER_BANK_ON_SIGN_UP]:
    FeatureFlagCohortType.SESSION_ID,
  [FeatureFlags.SHARE_SOUND_TO_TIKTOK]: FeatureFlagCohortType.USER_ID
}

export const FEATURE_FLAG_LOCAL_STORAGE_SESSION_KEY = 'featureFlagSessionId'
