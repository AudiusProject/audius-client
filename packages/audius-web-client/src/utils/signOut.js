/* globals localStorage */
import { clearTheme } from './theme/theme'
import AudiusBackend from 'services/AudiusBackend'
import { ReloadMessage } from 'services/native-mobile-interface/linking'
import { removeHasRequestedBrowserPermission } from 'utils/browserNotifications'
import {
  clearAudiusAccount,
  clearAudiusAccountUser
} from 'services/LocalStorage'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE
const AUDIUS_EVENTS = 'events'
const AUDIUS_USE_METAMASK = 'useMetaMask'

export const signOut = () => {
  localStorage.removeItem(AUDIUS_EVENTS)
  localStorage.removeItem(AUDIUS_USE_METAMASK)
  clearAudiusAccount()
  clearAudiusAccountUser()
  removeHasRequestedBrowserPermission()
  AudiusBackend.signOut()
  clearTheme()

  if (NATIVE_MOBILE) {
    new ReloadMessage().send()
  } else {
    window.location.reload()
  }
}
