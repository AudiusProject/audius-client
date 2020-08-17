import { IntKeys, StringKeys, DoubleKeys, BooleanKeys } from './RemoteConfig'

export const remoteConfigIntDefaults: { [key in IntKeys]: number | null } = {
  [IntKeys.IMAGE_QUICK_FETCH_TIMEOUT_MS]: 5000,
  [IntKeys.IMAGE_QUICK_FETCH_PERFORMANCE_BATCH_SIZE]: 20,
  [IntKeys.DISCOVERY_PROVIDER_SELECTION_TIMEOUT_MS]: null
}

export const remoteConfigStringDefaults: {
  [key in StringKeys]: string | null
} = {
  [StringKeys.AUDIUS_LOGO_VARIANT]: null,
  [StringKeys.AUDIUS_LOGO_VARIANT_CLICK_TARGET]: null
}
export const remoteConfigDoubleDefaults: {
  [key in DoubleKeys]: number | null
} = {}
export const remoteConfigBooleanDefaults: {
  [key in BooleanKeys]: boolean | null
} = {}
