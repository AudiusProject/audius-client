import type { AppState } from 'app/store'

const getBaseState = (state: AppState) => state.web

export const getIsEnabled = (state: AppState) => getBaseState(state).isEnabled
export const getMessageId = (state: AppState) => getBaseState(state).messageId
