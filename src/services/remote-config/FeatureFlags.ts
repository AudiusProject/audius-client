/* FeatureFlags must be lowercase snake case */
export enum FeatureFlags {
  TRENDING_UNDERGROUND = 'trending_underground',
  USE_TRACK_CONTENT_POLLING = 'use_track_content_polling'
}

export const flagDefaults: { [key in FeatureFlags]: boolean } = {
  [FeatureFlags.TRENDING_UNDERGROUND]: false,
  [FeatureFlags.USE_TRACK_CONTENT_POLLING]: false
}
