import { reachabilityActions } from '@audius/common'
import type { NetInfoState } from '@react-native-community/netinfo'
import NetInfo from '@react-native-community/netinfo'
import { debounce } from 'lodash'
import { AppState } from 'react-native'

import { env } from 'app/services/env'
import { dispatch } from 'app/store'

const REACHABILITY_URL = env.REACHABILITY_URL

export const checkConnectivity = (netInfo: NetInfoState | null) => {
  if (!netInfo) return true

  const { isInternetReachable } = netInfo
  return !!isInternetReachable
}

// Latest connectivity value
export const Connectivity: { netInfo: NetInfoState | null } = { netInfo: null }
// Check that a response from REACHABILITY_URL is valid
const isResponseValid = (response: Response | undefined) =>
  response && response.ok

const ping = async () => {
  // If there's no reachability url available, consider ourselves reachable
  if (!REACHABILITY_URL) {
    console.warn('No reachability url provided')
    return true
  }

  try {
    const response = await fetch(REACHABILITY_URL, { method: 'GET' })

    if (isResponseValid(response)) {
      console.debug('Reachability call succeeded')
      return true
    }
    console.debug('Reachability call failed')
    return false
  } catch {
    console.debug('Reachability call failed')
    return false
  }
}

const updateConnectivity = async (state: NetInfoState) => {
  Connectivity.netInfo = state
  if (AppState.currentState !== 'active') return
  const newValue = checkConnectivity(state)
  if (!newValue) {
    // Perform our own reachability test to be extra sure we're offline
    const reachable = await ping()
    if (!reachable) {
      dispatch(reachabilityActions.setUnreachable())
    }
  } else {
    dispatch(reachabilityActions.setReachable())
  }
}

export const refreshConnectivity = async () => {
  NetInfo.refresh()
  const currentState = await NetInfo.fetch()
  updateConnectivity(currentState)
}

export const subscribeToNetworkStatusUpdates = () => {
  NetInfo.addEventListener(
    debounce(updateConnectivity, 2500, {
      maxWait: 5000
    })
  )
}
