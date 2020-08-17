import User from 'models/User'
import { CURRENT_USER_EXISTS_LOCAL_STORAGE_KEY } from '@audius/libs/src/constants'
import { DISCOVERY_PROVIDER_TIMESTAMP } from '@audius/libs/src/services/discoveryProvider/constants'

const AUDIUS_ACCOUNT_KEY = '@audius/account'
const AUDIUS_ACCOUNT_USER_KEY = '@audius/audius-user'

const getValue = (key: string) => {
  if (window && window.localStorage) {
    const val = window.localStorage.getItem(key)
    return val ?? null
  }
  return null
}

const getJSONValue = (key: string) => {
  const val = getValue(key)
  if (val) {
    try {
      const parsed = JSON.parse(val)
      return parsed
    } catch (e) {
      return null
    }
  }
  return null
}

const setValue = (key: string, value: string) => {
  if (window && window.localStorage) {
    window.localStorage.setItem(key, value)
  }
}

const setJSONValue = (key: string, value: object) => {
  const string = JSON.stringify(value)
  setValue(key, string)
}

const removeItem = (key: string) => {
  if (window && window.localStorage) {
    window.localStorage.removeItem(key)
  }
}

export const getAudiusAccount = () => getJSONValue(AUDIUS_ACCOUNT_KEY)
export const setAudiusAccount = (value: object) =>
  setJSONValue(AUDIUS_ACCOUNT_KEY, value)
export const clearAudiusAccount = () => removeItem(AUDIUS_ACCOUNT_KEY)

export const getAudiusAccountUser = () => getJSONValue(AUDIUS_ACCOUNT_USER_KEY)
export const setAudiusAccountUser = (value: User) =>
  setJSONValue(AUDIUS_ACCOUNT_USER_KEY, value)
export const clearAudiusAccountUser = () => removeItem(AUDIUS_ACCOUNT_USER_KEY)

export const getCurrentUserExists = () =>
  getValue(CURRENT_USER_EXISTS_LOCAL_STORAGE_KEY)

export const getCachedDiscoveryProvider = () =>
  getJSONValue(DISCOVERY_PROVIDER_TIMESTAMP)
