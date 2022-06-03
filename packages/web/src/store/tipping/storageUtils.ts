import { RecentTipsStorage } from 'common/models/Tipping'
import { RECENT_TIPS_KEY } from 'utils/constants'

export const getRecentTipsStorageStr = () => {
  return window.localStorage?.getItem(RECENT_TIPS_KEY) ?? null
}

const getRecentTipsStorage = () => {
  const value = getRecentTipsStorageStr()
  return value ? (JSON.parse(value) as RecentTipsStorage) : null
}

export const updateTipsStorage = (storageStr: string) => {
  window.localStorage?.setItem(RECENT_TIPS_KEY, storageStr)
}

export const getMinSlotForRecentTips = () => {
  const result = getRecentTipsStorage()
  return result ? result.minSlot : null
}

export const dismissRecentTip = () => {
  const storage = getRecentTipsStorage()
  if (!storage) {
    return
  }

  updateTipsStorage(
    JSON.stringify({
      minSlot: storage.minSlot,
      dismissed: true,
      lastDismissalTimestamp: Date.now()
    })
  )
}
