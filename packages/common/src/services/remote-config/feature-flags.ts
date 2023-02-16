import { Environment } from '../env'

/* FeatureFlags must be lowercase snake case */
export enum FeatureFlags {
  SOLANA_LISTEN_ENABLED = 'solana_listen_enabled',
  PLAYLIST_UPDATES_ENABLED = 'playlist_updates_enabled',
  SHARE_SOUND_TO_TIKTOK = 'share_sound_to_tiktok',
  CHALLENGE_REWARDS_UI = 'challenge_rewards_ui',
  SURFACE_AUDIO_ENABLED = 'surface_audio_enabled',
  PREFER_HIGHER_PATCH_FOR_PRIMARY = 'prefer_higher_patch_for_primary',
  PREFER_HIGHER_PATCH_FOR_SECONDARIES = 'prefer_higher_patch_for_secondaries',
  ENABLE_SPL_AUDIO = 'enable_spl_audio',
  DISABLE_SIGN_UP_CONFIRMATION = 'disable_sign_up_confirmation',
  TIPPING_ENABLED = 'tipping_enabled',
  WRITE_QUORUM_ENABLED = 'write_quorum_enabled',
  EARLY_ACCESS = 'early_access',
  SUPPORTER_DETHRONED_ENABLED = 'supporter_dethroned_enabled',
  NEW_ARTIST_DASHBOARD_TABLE = 'new_artist_dashboard_table',
  BUY_AUDIO_COINBASE_ENABLED = 'buy_audio_coinbase_enabled',
  BUY_AUDIO_STRIPE_ENABLED = 'buy_audio_stripe_enabled',
  OFFLINE_MODE_RELEASE = 'offline_mode_release',
  PREMIUM_CONTENT_ENABLED = 'premium_content_enabled',
  ANDROID_PREMIUM_CONTENT_ENABLED = 'android_premium_content_enabled',
  IOS_PREMIUM_CONTENT_ENABLED = 'ios_premium_content_enabled',
  NFT_GATE_ENABLED = 'nft_gate_enabled',
  SPECIAL_ACCESS_GATE_ENABLED = 'special_access_gate_enabled',
  AUTO_SUBSCRIBE_ON_FOLLOW = 'auto_subscribe_on_follow',
  STREAM_MP3 = 'stream_mp3',
  SHARE_TO_STORY = 'share_to_story_2',
  READ_SUBSCRIBERS_FROM_DISCOVERY_ENABLED = 'read_subscribers_from_discovery_enabled',
  MOBILE_WALLET_CONNECT = 'mobile_wallet_connect_final',
  COMPLETE_PROFILE_WITH_TIKTOK = 'complete_profile_with_tiktok',
  VERIFY_HANDLE_WITH_TIKTOK = 'verify_handle_with_tiktok',
  SOLANA_PHONE_WALLET_CONNECT = 'solana_phone_wallet_connect',
  AUDIO_TRANSACTIONS_HISTORY = 'audio_transactions_history',
  RATE_CTA_ENABLED = 'rate_cta_enabled_v2',
  SHARE_TO_SNAPCHAT = 'share_to_snapchat',
  CHAT_ENABLED = 'chat_enabled',
  FAST_CACHE = 'fast_cache',
  SAFE_FAST_CACHE = 'safe_fast_cache',
  ENTITY_MANAGER_VIEW_PLAYLIST_ENABLED = 'entity_manager_view_playlist_enabled',
  ENTITY_MANAGER_VIEW_NOTIFICATIONS_ENABLED = 'entity_manager_view_notifications_enabled',
  SHARE_VIDEO_TO_TIKTOK = 'share_video_to_tiktok',
  PODCAST_CONTROL_UPDATES_ENABLED = 'podcast_control_updates_enabled'
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
  [FeatureFlags.SURFACE_AUDIO_ENABLED]: false,
  [FeatureFlags.PREFER_HIGHER_PATCH_FOR_PRIMARY]: true,
  [FeatureFlags.PREFER_HIGHER_PATCH_FOR_SECONDARIES]: true,
  [FeatureFlags.ENABLE_SPL_AUDIO]: false,
  [FeatureFlags.DISABLE_SIGN_UP_CONFIRMATION]: false,
  [FeatureFlags.TIPPING_ENABLED]: false,
  [FeatureFlags.WRITE_QUORUM_ENABLED]: false,
  [FeatureFlags.EARLY_ACCESS]: false,
  [FeatureFlags.SUPPORTER_DETHRONED_ENABLED]: false,
  [FeatureFlags.NEW_ARTIST_DASHBOARD_TABLE]: false,
  [FeatureFlags.BUY_AUDIO_COINBASE_ENABLED]: false,
  [FeatureFlags.BUY_AUDIO_STRIPE_ENABLED]: false,
  [FeatureFlags.OFFLINE_MODE_RELEASE]: true,
  [FeatureFlags.PREMIUM_CONTENT_ENABLED]: false,
  [FeatureFlags.ANDROID_PREMIUM_CONTENT_ENABLED]: false,
  [FeatureFlags.IOS_PREMIUM_CONTENT_ENABLED]: false,
  [FeatureFlags.NFT_GATE_ENABLED]: false,
  [FeatureFlags.SPECIAL_ACCESS_GATE_ENABLED]: false,
  [FeatureFlags.AUTO_SUBSCRIBE_ON_FOLLOW]: false,
  [FeatureFlags.STREAM_MP3]: false,
  [FeatureFlags.SHARE_TO_STORY]: false,
  [FeatureFlags.READ_SUBSCRIBERS_FROM_DISCOVERY_ENABLED]: false,
  [FeatureFlags.MOBILE_WALLET_CONNECT]: false,
  [FeatureFlags.COMPLETE_PROFILE_WITH_TIKTOK]: false,
  [FeatureFlags.VERIFY_HANDLE_WITH_TIKTOK]: false,
  [FeatureFlags.SOLANA_PHONE_WALLET_CONNECT]: false,
  [FeatureFlags.AUDIO_TRANSACTIONS_HISTORY]: false,
  [FeatureFlags.RATE_CTA_ENABLED]: false,
  [FeatureFlags.SHARE_TO_SNAPCHAT]: false,
  [FeatureFlags.CHAT_ENABLED]: false,
  [FeatureFlags.FAST_CACHE]: false,
  [FeatureFlags.SAFE_FAST_CACHE]: false,
  [FeatureFlags.ENTITY_MANAGER_VIEW_PLAYLIST_ENABLED]: false,
  [FeatureFlags.ENTITY_MANAGER_VIEW_NOTIFICATIONS_ENABLED]: false,
  [FeatureFlags.SHARE_VIDEO_TO_TIKTOK]: false,
  [FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED]: false
}
