import AsyncStorage from '@react-native-async-storage/async-storage'
import { RecentTipsStorage } from 'audius-client/src/common/models/Tipping'
import { RECENT_TIPS_KEY } from 'utils/constants'

export const getRecentTipsStorage = async () => {
  const value = await AsyncStorage.getItem(RECENT_TIPS_KEY)
  return value ? (JSON.parse(value) as RecentTipsStorage) : null
}

export const updateTipsStorage = async (storage: RecentTipsStorage) => {
  await AsyncStorage.setItem(RECENT_TIPS_KEY, JSON.stringify(storage))
}

export const getMinSlotForRecentTips = async () => {
  const storage = await getRecentTipsStorage()
  return storage ? storage.minSlot : null
}

export const dismissRecentTip = async () => {
  const storage = await getRecentTipsStorage()
  if (!storage) {
    return
  }

  const newStorage = {
    minSlot: storage.minSlot,
    dismissed: true,
    lastDismissalTimestamp: Date.now()
  }
  await updateTipsStorage(newStorage)
}
