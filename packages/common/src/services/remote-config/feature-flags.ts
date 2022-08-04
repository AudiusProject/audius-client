/* FeatureFlags must be lowercase snake case */
export enum FeatureFlags {
  SOLANA_LISTEN_ENABLED = 'solana_listen_enabled',
  PLAYLIST_UPDATES_ENABLED = 'playlist_updates_enabled',
  SHARE_SOUND_TO_TIKTOK = 'share_sound_to_tiktok',
  CHALLENGE_REWARDS_UI = 'challenge_rewards_ui',
  SOL_WALLET_AUDIO_ENABLED = 'sol_wallet_audio_enabled',
  SURFACE_AUDIO_ENABLED = 'surface_audio_enabled',
  PREFER_HIGHER_PATCH_FOR_PRIMARY = 'prefer_higher_patch_for_primary',
  PREFER_HIGHER_PATCH_FOR_SECONDARIES = 'prefer_higher_patch_for_secondaries',
  ENABLE_SPL_AUDIO = 'enable_spl_audio',
  PLAYLIST_FOLDERS = 'playlist_folders',
  DISABLE_SIGN_UP_CONFIRMATION = 'disable_sign_up_confirmation',
  TIPPING_ENABLED = 'tipping_enabled',
  WRITE_QUORUM_ENABLED = 'write_quorum_enabled',
  EARLY_ACCESS = 'early_access'
}

/**
 * If optimizely errors, these default values are used.
 */
export const flagDefaults: { [key in FeatureFlags]: boolean } = {
  [FeatureFlags.SOLANA_LISTEN_ENABLED]: false,
  [FeatureFlags.PLAYLIST_UPDATES_ENABLED]: false,
  [FeatureFlags.SHARE_SOUND_TO_TIKTOK]: false,
  [FeatureFlags.CHALLENGE_REWARDS_UI]: false,
  [FeatureFlags.SOL_WALLET_AUDIO_ENABLED]: false,
  [FeatureFlags.SURFACE_AUDIO_ENABLED]: false,
  [FeatureFlags.PREFER_HIGHER_PATCH_FOR_PRIMARY]: true,
  [FeatureFlags.PREFER_HIGHER_PATCH_FOR_SECONDARIES]: true,
  [FeatureFlags.ENABLE_SPL_AUDIO]: false,
  [FeatureFlags.PLAYLIST_FOLDERS]: false,
  [FeatureFlags.DISABLE_SIGN_UP_CONFIRMATION]: false,
  [FeatureFlags.TIPPING_ENABLED]: false,
  [FeatureFlags.WRITE_QUORUM_ENABLED]: false,
  [FeatureFlags.EARLY_ACCESS]: false
}
