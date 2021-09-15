import accountReducer from 'store/account/reducer'
import accountSagas from 'store/account/sagas'
import * as accountSelectors from 'store/account/selectors'
import { AppState } from 'store/types'

// In the future, these state slices will live in @audius/client-store.
// For now they live in the web client. As features get migrated to RN
// relevant state slices should be added here. Eventually they will be pulled into
// @audius/client-store and the mobile client will no longer be dependent on the web client

export const reducers = {
  account: accountReducer
}

export const selectors = {
  account: accountSelectors
}

export const sagas = {
  account: accountSagas
}

export type State = Pick<AppState, keyof typeof reducers>
