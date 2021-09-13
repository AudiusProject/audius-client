import account from 'store/account/reducer'
import { AppState } from 'store/types'

// Ideally, these state slices will live in @audius/client-store
// but for now they live in the web client
export const clientStoreReducers = {
  account
}

export type ClientStoreState = Pick<AppState, keyof typeof clientStoreReducers>
