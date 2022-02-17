import { IntKeys, StringKeys, DoubleKeys, BooleanKeys } from './types'

const ETH_PROVIDER_URLS = process.env.REACT_APP_ETH_PROVIDER_URL || ''

export const remoteConfigIntDefaults: { [key in IntKeys]: number | null } = {
  [IntKeys.IMAGE_QUICK_FETCH_TIMEOUT_MS]: 5000,
  [IntKeys.IMAGE_QUICK_FETCH_PERFORMANCE_BATCH_SIZE]: 20,
  [IntKeys.DISCOVERY_PROVIDER_SELECTION_TIMEOUT_MS]: 10 * 60 * 1000,
  [IntKeys.DISCOVERY_NODE_MAX_SLOT_DIFF_PLAYS]: null,
  [IntKeys.DISCOVERY_NODE_MAX_BLOCK_DIFF]: null,
  [IntKeys.DASHBOARD_WALLET_BALANCE_POLLING_FREQ_MS]: 5000,
  [IntKeys.NOTIFICATION_POLLING_FREQ_MS]: 60 * 1000,
  [IntKeys.SERVICE_MONITOR_HEALTH_CHECK_SAMPLE_RATE]: 0,
  [IntKeys.SERVICE_MONITOR_REQUEST_SAMPLE_RATE]: 0,
  [IntKeys.INSTAGRAM_HANDLE_CHECK_TIMEOUT]: 4000,
  [IntKeys.AUTOPLAY_LIMIT]: 10,
  [IntKeys.DISCOVERY_NODE_SELECTION_REQUEST_TIMEOUT]: 30000,
  [IntKeys.DISCOVERY_NODE_SELECTION_REQUEST_RETRIES]: 5,
  [IntKeys.ATTESTATION_QUORUM_SIZE]: 0,
  [IntKeys.MIN_AUDIO_SEND_AMOUNT]: 5,
  [IntKeys.CHALLENGE_REFRESH_INTERVAL_MS]: 15000,
  [IntKeys.CHALLENGE_REFRESH_INTERVAL_AUDIO_PAGE_MS]: 5000,
  [IntKeys.MANUAL_CLAIM_PROMPT_DELAY_MS]: 15000,
  [IntKeys.MAX_CLAIM_RETRIES]: 5,
  [IntKeys.CLIENT_ATTESTATION_PARALLELIZATION]: 20,
  [IntKeys.CHALLENGE_CLAIM_COMPLETION_POLL_FREQUENCY_MS]: 1000,
  [IntKeys.CHALLENGE_CLAIM_COMPLETION_POLL_TIMEOUT_MS]: 10000
}

export const remoteConfigStringDefaults: {
  [key in StringKeys]: string | null
} = {
  [StringKeys.AUDIUS_LOGO_VARIANT]: null,
  [StringKeys.AUDIUS_LOGO_VARIANT_CLICK_TARGET]: null,
  [StringKeys.APP_WIDE_NOTICE_TEXT]: null,
  [StringKeys.ETH_PROVIDER_URLS]: ETH_PROVIDER_URLS,
  [StringKeys.CONTENT_BLOCK_LIST]: null,
  [StringKeys.CONTENT_NODE_BLOCK_LIST]: null,
  [StringKeys.DISCOVERY_NODE_BLOCK_LIST]: null,
  [StringKeys.INSTAGRAM_API_PROFILE_URL]:
    'https://instagram.com/$USERNAME$/?__a=1',
  // Audius user id
  [StringKeys.TRENDING_PLAYLIST_OMITTED_USER_IDS]: '51',
  [StringKeys.TRENDING_REWARD_IDS]:
    'trending-track,trending-playlist,trending-underground,top-api',
  [StringKeys.CHALLENGE_REWARD_IDS]:
    'track-upload,invite-friends,mobile-app,connect-verified,listen-streak,profile-completion',
  [StringKeys.REWARDS_TWEET_ID_TRACKS]: '1374856377651187713',
  [StringKeys.REWARDS_TWEET_ID_PLAYLISTS]: '1374856377651187713',
  [StringKeys.REWARDS_TWEET_ID_UNDERGROUND]: '1374856377651187713',
  [StringKeys.FORCE_MP3_STREAM_TRACK_IDS]: null,
  [StringKeys.TF]: null,
  [StringKeys.TPF]: null,
  [StringKeys.UTF]: null,
  [StringKeys.TRENDING_EXPERIMENT]: null,
  [StringKeys.PLAYLIST_TRENDING_EXPERIMENT]: null,
  [StringKeys.UNDERGROUND_TRENDING_EXPERIMENT]: null,
  [StringKeys.ORACLE_ETH_ADDRESS]: null,
  [StringKeys.ORACLE_ENDPOINT]: null,
  [StringKeys.REWARDS_ATTESTATION_ENDPOINTS]: null
}
export const remoteConfigDoubleDefaults: {
  [key in DoubleKeys]: number | null
} = {
  [DoubleKeys.SHOW_ARTIST_RECOMMENDATIONS_FALLBACK_PERCENT]: 0.3333,
  [DoubleKeys.SHOW_ARTIST_RECOMMENDATIONS_PERCENT]: 1.0
}
export const remoteConfigBooleanDefaults: {
  [key in BooleanKeys]: boolean | null
} = {
  [BooleanKeys.DISPLAY_INSTAGRAM_VERIFICATION]: true,
  [BooleanKeys.DISPLAY_INSTAGRAM_VERIFICATION_WEB_AND_DESKTOP]: true,
  [BooleanKeys.DISPLAY_WEB3_PROVIDER_WALLET_CONNECT]: true,
  [BooleanKeys.DISPLAY_WEB3_PROVIDER_BITSKI]: true,
  [BooleanKeys.DISPLAY_WEB3_PROVIDER_WALLET_LINK]: true,
  [BooleanKeys.DISPLAY_SOLANA_WEB3_PROVIDER_PHANTOM]: true,
  [BooleanKeys.SKIP_ROLLOVER_NODES_SANITY_CHECK]: false,
  [BooleanKeys.USE_AMPLITUDE]: true
}
