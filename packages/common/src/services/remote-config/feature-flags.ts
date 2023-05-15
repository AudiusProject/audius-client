import { Environment } from '../env'

/* FeatureFlags must be lowercase snake case */
export enum FeatureFlags {
  SOLANA_LISTEN_ENABLED = 'solana_listen_enabled',
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
  GATED_CONTENT_ENABLED = 'gated_content_enabled',
  ANDROID_GATED_CONTENT_ENABLED = 'android_gated_content_enabled_2',
  IOS_GATED_CONTENT_ENABLED = 'ios_gated_content_enabled_2',
  COLLECTIBLE_GATED_ENABLED = 'collectible_gated_enabled',
  SPECIAL_ACCESS_ENABLED = 'special_access_enabled',
  VERIFY_HANDLE_WITH_TIKTOK = 'verify_handle_with_tiktok',
  AUDIO_TRANSACTIONS_HISTORY = 'audio_transactions_history',
  RATE_CTA_ENABLED = 'rate_cta_enabled_v2',
  CHAT_ENABLED = 'chat_enabled',
  FAST_CACHE = 'fast_cache',
  SAFE_FAST_CACHE = 'safe_fast_cache',
  ENTITY_MANAGER_VIEW_NOTIFICATIONS_ENABLED = 'entity_manager_view_notifications_enabled',
  PODCAST_CONTROL_UPDATES_ENABLED = 'podcast_control_updates_enabled',
  PODCAST_CONTROL_UPDATES_ENABLED_FALLBACK = 'podcast_control_updates_enabled_fallback',
  LAZY_USERBANK_CREATION_ENABLED = 'lazy_userbank_creation_enabled',
  DISCOVERY_NOTIFICATIONS = 'discovery_notifications',
  REPOST_OF_REPOST_NOTIFICATIONS = 'repost_of_repost_notifications',
  SAVE_OF_REPOST_NOTIFICATIONS = 'save_of_repost_notifications',
  TRENDING_PLAYLIST_NOTIFICATIONS = 'trending_playlist_notifications',
  TRENDING_UNDERGROUND_NOTIFICATIONS = 'trending_underground_notifications',
  TASTEMAKER_NOTIFICATIONS = 'tastemaker_notifications',
  SDK_DISCOVERY_NODE_SELECTOR = 'sdk_discovery_node_selector',
  GET_METADATA_FROM_DISCOVERY_ENABLED = 'get_metadata_from_discovery_enabled',
  RELATED_ARTISTS_ON_PROFILE_ENABLED = 'related_artists_on_profile_enabled',
  PROXY_WORMHOLE = 'proxy_wormhole',
  STORAGE_V2_TRACK_UPLOAD = 'storage_v2_track_upload',
  STORAGE_V2_SIGNUP = 'storage_v2_signup',
  PLAYLIST_UPDATES_PRE_QA = 'playlist_updates_pre_qa',
  PLAYLIST_UPDATES_POST_QA = 'playlist_updates_post_qa',
  AI_ATTRIBUTION = 'ai_attribution',
  WRITE_METADATA_THROUGH_CHAIN = 'write_metadata_through_chain'
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
  [FeatureFlags.GATED_CONTENT_ENABLED]: false,
  [FeatureFlags.ANDROID_GATED_CONTENT_ENABLED]: false,
  [FeatureFlags.IOS_GATED_CONTENT_ENABLED]: false,
  [FeatureFlags.COLLECTIBLE_GATED_ENABLED]: false,
  [FeatureFlags.SPECIAL_ACCESS_ENABLED]: false,
  [FeatureFlags.VERIFY_HANDLE_WITH_TIKTOK]: false,
  [FeatureFlags.AUDIO_TRANSACTIONS_HISTORY]: false,
  [FeatureFlags.RATE_CTA_ENABLED]: false,
  [FeatureFlags.CHAT_ENABLED]: false,
  [FeatureFlags.FAST_CACHE]: false,
  [FeatureFlags.SAFE_FAST_CACHE]: false,
  [FeatureFlags.ENTITY_MANAGER_VIEW_NOTIFICATIONS_ENABLED]: false,
  [FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED]: false,
  [FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED_FALLBACK]: false,
  [FeatureFlags.LAZY_USERBANK_CREATION_ENABLED]: false,
  [FeatureFlags.DISCOVERY_NOTIFICATIONS]: false,
  [FeatureFlags.REPOST_OF_REPOST_NOTIFICATIONS]: false,
  [FeatureFlags.SAVE_OF_REPOST_NOTIFICATIONS]: false,
  [FeatureFlags.TRENDING_PLAYLIST_NOTIFICATIONS]: false,
  [FeatureFlags.TRENDING_UNDERGROUND_NOTIFICATIONS]: false,
  [FeatureFlags.TASTEMAKER_NOTIFICATIONS]: false,
  [FeatureFlags.SDK_DISCOVERY_NODE_SELECTOR]: false,
  [FeatureFlags.GET_METADATA_FROM_DISCOVERY_ENABLED]: false,
  [FeatureFlags.RELATED_ARTISTS_ON_PROFILE_ENABLED]: false,
  [FeatureFlags.PROXY_WORMHOLE]: false,
  [FeatureFlags.STORAGE_V2_TRACK_UPLOAD]: false,
  [FeatureFlags.STORAGE_V2_SIGNUP]: false,
  [FeatureFlags.PLAYLIST_UPDATES_PRE_QA]: false,
  [FeatureFlags.PLAYLIST_UPDATES_POST_QA]: false,
  [FeatureFlags.AI_ATTRIBUTION]: false,
  [FeatureFlags.WRITE_METADATA_THROUGH_CHAIN]: false
}
