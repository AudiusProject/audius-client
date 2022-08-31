import type { User } from '@audius/common'

import type { LifecycleActions } from './actions'

export type LifecycleState = {
  signedIn: boolean | null
  account: User | null
  location: any
  onSignUp: boolean
}

const initialState = {
  signedIn: null,
  account: null,
  location: null,
  onSignUp: false
}

const reducer = (
  state: LifecycleState = initialState,
  action: LifecycleActions
) => {
  switch (action.type) {
    default:
      return state
  }
}

export default reducer
