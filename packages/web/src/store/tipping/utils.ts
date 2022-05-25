import { ID } from 'common/models/Identifiers'
import { UserTip } from 'common/models/Tipping'
import { Nullable } from 'common/utils/typeUtils'
import { FEED_TIP_DISMISSAL_TIME_LIMIT } from 'utils/constants'

const RECENT_TIPS_KEY = 'recent-tips'

type RecentTipsStorage = {
  dismissed: boolean
  minSlot: number
  lastDismissalTimestamp: Nullable<number>
}

const getRecentTipsStorage = () => {
  if (!window.localStorage) {
    return null
  }

  const value = window.localStorage.getItem(RECENT_TIPS_KEY)
  if (!value) {
    return null
  }

  return JSON.parse(value) as RecentTipsStorage
}

export const getMinSlotForRecentTips = () => {
  const storage = getRecentTipsStorage()
  return storage ? storage.minSlot : null
}

export const getDismissedSlotForRecentTips = () => {
  const storage = getRecentTipsStorage()
  return storage ? storage.dismissed : null
}

export const checkTipToDisplay = ({
  userId,
  recentTips
}: {
  userId: ID
  recentTips: UserTip[]
}) => {
  if (recentTips.length === 0) {
    return null
  }

  /**
   * The list only comprises of recent tips.
   * Sort them tips by least recent to parse through oldest tips first.
   */
  const sortedTips = recentTips.sort((tip1, tip2) => tip1.slot - tip2.slot)

  /** Return oldest of the recent tips if no local storage */
  if (!window.localStorage) {
    return sortedTips[0]
  }

  const storage = getRecentTipsStorage()
  /**
   * Return oldest of the recent tips if nothing in local storage.
   * Also set local storage values.
   */
  if (!storage) {
    const oldestValidTip = sortedTips[0]
    const newStorage = {
      minSlot: oldestValidTip.slot,
      dismissed: false,
      lastDismissalTimestamp: null
    }
    window.localStorage.setItem(RECENT_TIPS_KEY, JSON.stringify(newStorage))
    return oldestValidTip
  }

  let ownTip = sortedTips.find(
    tip => tip.sender_id === userId && tip.slot > storage.minSlot
  )
  if (ownTip) {
    const newStorage = {
      minSlot: ownTip.slot,
      dismissed: false,
      lastDismissalTimestamp: null
    }
    window.localStorage.setItem(RECENT_TIPS_KEY, JSON.stringify(newStorage))
    return ownTip
  }

  let oldestValidTip = sortedTips.find(tip => tip.slot > storage.minSlot)
  if (oldestValidTip) {
    const newStorage = {
      minSlot: oldestValidTip.slot,
      dismissed: false,
      lastDismissalTimestamp: null
    }
    window.localStorage.setItem(RECENT_TIPS_KEY, JSON.stringify(newStorage))
    return oldestValidTip
  }

  if (storage.dismissed) {
    if (
      storage.lastDismissalTimestamp &&
      Date.now() - storage.lastDismissalTimestamp >
        FEED_TIP_DISMISSAL_TIME_LIMIT
    ) {
      ownTip = sortedTips.find(
        tip => tip.sender_id === userId && tip.slot === storage.minSlot
      )
      if (ownTip) {
        const newStorage = {
          minSlot: ownTip.slot,
          dismissed: false,
          lastDismissalTimestamp: null
        }
        window.localStorage.setItem(RECENT_TIPS_KEY, JSON.stringify(newStorage))
        return ownTip
      }

      oldestValidTip = sortedTips.find(tip => tip.slot === storage.minSlot)
      if (oldestValidTip) {
        const newStorage = {
          minSlot: oldestValidTip.slot,
          dismissed: false,
          lastDismissalTimestamp: null
        }
        window.localStorage.setItem(RECENT_TIPS_KEY, JSON.stringify(newStorage))
        return oldestValidTip
      }

      /**
       * Should never reach here because that would mean that
       * there was previously a tip at some slot, and somehow later
       * there were no tips at an equal or more recent slot
       */
      return null
    }

    return null
  }

  ownTip = sortedTips.find(
    tip => tip.sender_id === userId && tip.slot === storage.minSlot
  )
  if (ownTip) {
    const newStorage = {
      minSlot: ownTip.slot,
      dismissed: false,
      lastDismissalTimestamp: null
    }
    window.localStorage.setItem(RECENT_TIPS_KEY, JSON.stringify(newStorage))
    return ownTip
  }

  oldestValidTip = sortedTips.find(tip => tip.slot === storage.minSlot)
  if (oldestValidTip) {
    const newStorage = {
      minSlot: oldestValidTip.slot,
      dismissed: false,
      lastDismissalTimestamp: null
    }
    window.localStorage.setItem(RECENT_TIPS_KEY, JSON.stringify(newStorage))
    return oldestValidTip
  }

  /**
   * Should never reach here because that would mean that
   * there was previously a tip at some slot, and somehow later
   * there were no tips at an equal or more recent slot
   */
  return null
}

export const dismissRecentTip = () => {
  if (!window.localStorage) {
    return
  }

  const storage = getRecentTipsStorage()
  if (!storage) {
    return
  }

  const newStorage = {
    minSlot: storage.minSlot,
    dismissed: true,
    lastDismissalTimestamp: Date.now()
  }
  window.localStorage.setItem(RECENT_TIPS_KEY, JSON.stringify(newStorage))
}
