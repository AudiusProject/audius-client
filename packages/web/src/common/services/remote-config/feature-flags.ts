/* FeatureFlags must be lowercase snake case */
export enum FeatureFlags {
  TRENDING_UNDERGROUND = 'trending_underground',
  SOLANA_LISTEN_ENABLED = 'solana_listen_enabled',
  PLAYLIST_UPDATES_ENABLED = 'playlist_updates_enabled',
  CHALLENGE_REWARDS_UI = 'challenge_rewards_ui',
  SOL_WALLET_AUDIO_ENABLED = 'sol_wallet_audio_enabled',
  SURFACE_AUDIO_ENABLED = 'surface_audio_enabled',
  PREFER_HIGHER_PATCH_FOR_PRIMARY = 'prefer_higher_patch_for_primary',
  PREFER_HIGHER_PATCH_FOR_SECONDARIES = 'prefer_higher_patch_for_secondaries',
  REWARDS_NOTIFICATIONS_ENABLED = 'rewards_notifications_enabled',
  ENABLE_SPL_AUDIO = 'enable_spl_audio',
  PLAYLIST_FOLDERS = 'playlist_folders',
  DISABLE_SIGN_UP_CONFIRMATION = 'disable_sign_up_confirmation'
}

/**
 * If optimizely errors, these default values are used.
 */
export const flagDefaults: { [key in FeatureFlags]: boolean } = {
  [FeatureFlags.TRENDING_UNDERGROUND]: false,
  [FeatureFlags.SOLANA_LISTEN_ENABLED]: false,
  [FeatureFlags.PLAYLIST_UPDATES_ENABLED]: false,
  [FeatureFlags.CHALLENGE_REWARDS_UI]: false,
  [FeatureFlags.SOL_WALLET_AUDIO_ENABLED]: false,
  [FeatureFlags.SURFACE_AUDIO_ENABLED]: false,
  [FeatureFlags.PREFER_HIGHER_PATCH_FOR_PRIMARY]: true,
  [FeatureFlags.PREFER_HIGHER_PATCH_FOR_SECONDARIES]: true,
  [FeatureFlags.REWARDS_NOTIFICATIONS_ENABLED]: false,
  [FeatureFlags.ENABLE_SPL_AUDIO]: false,
  [FeatureFlags.PLAYLIST_FOLDERS]: false,
  [FeatureFlags.DISABLE_SIGN_UP_CONFIRMATION]: false
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
  [FeatureFlags.SOLANA_LISTEN_ENABLED]: FeatureFlagCohortType.SESSION_ID,
  [FeatureFlags.TRENDING_UNDERGROUND]: FeatureFlagCohortType.USER_ID,
  [FeatureFlags.PLAYLIST_UPDATES_ENABLED]: FeatureFlagCohortType.USER_ID,
  [FeatureFlags.CHALLENGE_REWARDS_UI]: FeatureFlagCohortType.SESSION_ID,
  [FeatureFlags.SOL_WALLET_AUDIO_ENABLED]: FeatureFlagCohortType.USER_ID,
  [FeatureFlags.SURFACE_AUDIO_ENABLED]: FeatureFlagCohortType.USER_ID,
  [FeatureFlags.PREFER_HIGHER_PATCH_FOR_PRIMARY]:
    FeatureFlagCohortType.SESSION_ID,
  [FeatureFlags.PREFER_HIGHER_PATCH_FOR_SECONDARIES]:
    FeatureFlagCohortType.SESSION_ID,
  [FeatureFlags.REWARDS_NOTIFICATIONS_ENABLED]:
    FeatureFlagCohortType.SESSION_ID,
  [FeatureFlags.ENABLE_SPL_AUDIO]: FeatureFlagCohortType.SESSION_ID,
  [FeatureFlags.PLAYLIST_FOLDERS]: FeatureFlagCohortType.USER_ID,
  [FeatureFlags.DISABLE_SIGN_UP_CONFIRMATION]: FeatureFlagCohortType.SESSION_ID
}
