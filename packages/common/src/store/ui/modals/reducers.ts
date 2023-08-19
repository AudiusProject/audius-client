import { Action, combineReducers, Reducer } from '@reduxjs/toolkit'

import { createChatModalReducer } from './create-chat-modal'
import { BaseModalState } from './createModal'
import { inboxUnavailableModalReducer } from './inbox-unavailable-modal'
import { leavingAudiusModalReducer } from './leaving-audius-modal'
import parentReducer, { initialState } from './parentSlice'
import { Modals, ModalsState } from './types'

/**
 * Create a bunch of reducers that do nothing, so that the state is maintained and not lost through the child reducers
 */
const noOpReducers = Object.keys(initialState).reduce((prev, curr) => {
  return {
    ...prev,
    [curr]: (s: BaseModalState = { isOpen: false }) => s
  }
}, {} as Record<Modals, Reducer<BaseModalState>>)

/**
 * Combine all the child reducers to build the entire parent slice state
 */
const combinedReducers = combineReducers({
  ...noOpReducers,
  CreateChatModal: createChatModalReducer,
  InboxUnavailableModal: inboxUnavailableModalReducer,
  LeavingAudiusModal: leavingAudiusModalReducer
})

/**
 * Return a reducer that processes child slices, then parent slice.
 * This maintains backwards compatibility between modals created without createModal
 */
export const rootModalReducer = (state: ModalsState, action: Action) => {
  const firstState = combinedReducers(state, action)
  return parentReducer(firstState, action)
}
