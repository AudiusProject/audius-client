export const OPEN = 'NOTIFICATIONS/OPEN'
export const CLOSE = 'NOTIFICATIONS/CLOSE'
export const MARK_AS_VIEWED = 'NOTIFICATIONS/MARK_AS_VIEWED'

type OpenAction = {
  type: typeof OPEN
}

type CloseAction = {
  type: typeof CLOSE
}

type MarkAsViewedAction = {
  type: typeof MARK_AS_VIEWED
}

export type NotificationsActions = OpenAction | CloseAction | MarkAsViewedAction

export const open = (): OpenAction => ({
  type: OPEN
})

export const close = (): CloseAction => ({
  type: CLOSE
})

export const markAsViewed = (): MarkAsViewedAction => ({
  type: MARK_AS_VIEWED
})
