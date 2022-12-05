import { Environment } from '../env'

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
  DISABLE_SIGN_UP_CONFIRMATION = 'disable_sign_up_confirmation',
  TIPPING_ENABLED = 'tipping_enabled',
  WRITE_QUORUM_ENABLED = 'write_quorum_enabled',
  EARLY_ACCESS = 'early_access',
  SUPPORTER_DETHRONED_ENABLED = 'supporter_dethroned_enabled',
  PLAYLIST_ENTITY_MANAGER_ENABLED = 'playlist_entity_manager_enabled',
  SOCIAL_FEATURE_ENTITY_MANAGER_ENABLED = 'social_feature_entity_manager_enabled',
  TRACK_ENTITY_MANAGER_ENABLED = 'track_entity_manager_enabled',
  USER_ENTITY_MANAGER_ENABLED = 'user_entity_manager_enabled',
  NEW_ARTIST_DASHBOARD_TABLE = 'new_artist_dashboard_table',
  BUY_AUDIO_ENABLED = 'buy_audio_enabled',
  BUY_AUDIO_COINBASE_ENABLED = 'buy_audio_coinbase_enabled',
  BUY_AUDIO_STRIPE_ENABLED = 'buy_audio_stripe_enabled',
  OFFLINE_MODE_ENABLED = 'offline_mode_enabled',
  PREMIUM_CONTENT_ENABLED = 'premium_content_enabled',
  AUTO_SUBSCRIBE_ON_FOLLOW = 'auto_subscribe_on_follow',
  MOBILE_UPLOAD = 'mobile_upload_final_2',
  STREAM_MP3 = 'stream_mp3',
  READ_ARTIST_PICK_FROM_DISCOVERY = 'read_artist_pick_from_discovery',
  SHARE_TO_STORY = 'share_to_story',
  READ_SUBSCRIBERS_FROM_DISCOVERY_ENABLED = 'read_subscribers_from_discovery_enabled',
  MOBILE_WALLET_CONNECT = 'mobile_wallet_connect'
}

type FlagDefaults = Record<FeatureFlags, boolean>

export const environmentFlagDefaults: Record<
  Environment,
  Partial<FlagDefaults>
> = {
  development: {},
  staging: {},
  production: {}
}

/**
 * If optimizely errors, these default values are used.
 */
export const flagDefaults: FlagDefaults = {
  [FeatureFlags.SOLANA_LISTEN_ENABLED]: false,
  [FeatureFlags.PLAYLIST_UPDATES_ENABLED]: false,
  [FeatureFlags.SHARE_SOUND_TO_TIKTOK]: false,
  [FeatureFlags.CHALLENGE_REWARDS_UI]: false,
  [FeatureFlags.SOL_WALLET_AUDIO_ENABLED]: false,
  [FeatureFlags.SURFACE_AUDIO_ENABLED]: false,
  [FeatureFlags.PREFER_HIGHER_PATCH_FOR_PRIMARY]: true,
  [FeatureFlags.PREFER_HIGHER_PATCH_FOR_SECONDARIES]: true,
  [FeatureFlags.ENABLE_SPL_AUDIO]: false,
  [FeatureFlags.DISABLE_SIGN_UP_CONFIRMATION]: false,
  [FeatureFlags.TIPPING_ENABLED]: false,
  [FeatureFlags.WRITE_QUORUM_ENABLED]: false,
  [FeatureFlags.EARLY_ACCESS]: false,
  [FeatureFlags.SUPPORTER_DETHRONED_ENABLED]: false,
  [FeatureFlags.PLAYLIST_ENTITY_MANAGER_ENABLED]: false,
  [FeatureFlags.SOCIAL_FEATURE_ENTITY_MANAGER_ENABLED]: false,
  [FeatureFlags.TRACK_ENTITY_MANAGER_ENABLED]: false,
  [FeatureFlags.USER_ENTITY_MANAGER_ENABLED]: false,
  [FeatureFlags.NEW_ARTIST_DASHBOARD_TABLE]: false,
  [FeatureFlags.BUY_AUDIO_ENABLED]: false,
  [FeatureFlags.BUY_AUDIO_COINBASE_ENABLED]: false,
  [FeatureFlags.BUY_AUDIO_STRIPE_ENABLED]: false,
  [FeatureFlags.OFFLINE_MODE_ENABLED]: false,
  [FeatureFlags.PREMIUM_CONTENT_ENABLED]: false,
  [FeatureFlags.AUTO_SUBSCRIBE_ON_FOLLOW]: false,
  [FeatureFlags.MOBILE_UPLOAD]: false,
  [FeatureFlags.STREAM_MP3]: false,
  [FeatureFlags.READ_ARTIST_PICK_FROM_DISCOVERY]: false,
  [FeatureFlags.SHARE_TO_STORY]: false,
  [FeatureFlags.READ_SUBSCRIBERS_FROM_DISCOVERY_ENABLED]: false,
  [FeatureFlags.MOBILE_WALLET_CONNECT]: false
}
