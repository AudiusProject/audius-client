import AsyncStorage from '@react-native-async-storage/async-storage'
import { RecentTipsStorage } from 'audius-client/src/common/models/Tipping'
import { RECENT_TIPS_KEY } from 'utils/constants'

export const getRecentTipsStorageStr = async () => {
  return AsyncStorage.getItem(RECENT_TIPS_KEY)
}

const getRecentTipsStorage = async () => {
  const value = await getRecentTipsStorageStr()
  return value ? (JSON.parse(value) as RecentTipsStorage) : null
}

export const updateTipsStorage = async (storageStr: string) => {
  await AsyncStorage.setItem(RECENT_TIPS_KEY, storageStr)
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
  await updateTipsStorage(JSON.stringify(newStorage))
}
