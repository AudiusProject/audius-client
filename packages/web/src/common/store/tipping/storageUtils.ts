import { LocalStorage, RecentTipsStorage } from '@audius/common'

export const RECENT_TIPS_KEY = 'recent-tips'

export const getRecentTipsStorage = async (
  localStorage: LocalStorage
): Promise<RecentTipsStorage | null> => {
  return await localStorage.getJSONValue(RECENT_TIPS_KEY)
}

export const updateTipsStorage = async (
  storage: RecentTipsStorage,
  localStorage: LocalStorage
) => {
  await localStorage.setJSONValue(RECENT_TIPS_KEY, storage)
}

export const dismissRecentTip = async (localStorage: LocalStorage) => {
  const storage = await getRecentTipsStorage(localStorage)
  if (!storage) {
    return
  }

  updateTipsStorage(
    {
      dismissed: true,
      lastDismissalTimestamp: Date.now()
    },
    localStorage
  )
}
