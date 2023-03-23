import { AppState } from 'store/types'

const getBaseState = (state: AppState) => state.application.ui.notifications

export const getNotificationPanelIsOpen = (state: AppState) =>
  getBaseState(state).panelIsOpen

export const getNotificationModalIsOpen = (state: AppState) =>
  getBaseState(state).modalIsOpen

export const getNotificationModalId = (state: AppState) =>
  getBaseState(state).modalNotificationId
