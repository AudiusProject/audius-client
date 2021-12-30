import { Message } from 'app/message'

import { Provider } from './reducer'
import { Credentials } from './types'

export const OPEN_POPUP = 'OAUTH/OPEN_POPUP'
export const REQUEST_NATIVE_OPEN_POPUP = 'OAUTH/REQUEST_NATIVE_OPEN_POPUP'
export const SET_CREDENTIALS = 'OAUTH/SET_CREDENTIALS'
export const NATIVE_OPEN_POPUP = 'OAUTH/NATIVE_OPEN_POPUP'
export const CLOSE_POPUP = 'OAUTH/CLOSE_POPUP'
export const SET_TWITTER_INFO = 'OAUTH/SET_TWITTER_INFO'
export const SET_TWITTER_ERROR = 'OAUTH/SET_TWITTER_ERROR'
export const SET_INSTAGRAM_INFO = 'OAUTH/SET_INSTAGRAM_INFO'
export const SET_INSTAGRAM_ERROR = 'OAUTH/SET_INSTAGRAM_ERROR'
export const RESET_OAUTH_STATE = 'OAUTH/RESET_OAUTH_STATE'

type OpenPopupAction = {
  type: typeof OPEN_POPUP
  message: Message
  provider: Provider
}
export type RequestNativeOpenPopupAction = {
  type: typeof REQUEST_NATIVE_OPEN_POPUP
  resolve: (c: Credentials | PromiseLike<Credentials>) => void
  reject: (e: Error) => void
  url: string
  provider: Provider
}
export type SetCredentialsAction = {
  type: typeof SET_CREDENTIALS
  credentials: Credentials
}
type NativeOpenPopupAction = {
  type: typeof NATIVE_OPEN_POPUP
  url: string
  provider: Provider
}
type ClosePopupAction = {
  type: typeof CLOSE_POPUP
}

type SetTwitterInfoAction = {
  type: typeof SET_TWITTER_INFO
  uuid: any
  profile: any
  profileImage: any
  profileBanner: any
  requiresUserReview: any
}
type SetTwitterErrorAction = {
  type: typeof SET_TWITTER_ERROR
  error: any
}

type SetInstagramInfoAction = {
  type: typeof SET_INSTAGRAM_INFO
  uuid: any
  profile: any
  profileImage: any
  requiresUserReview: any
}
type SetInstagramErrorAction = {
  type: typeof SET_INSTAGRAM_ERROR
  error: any
}

type ResetOAuthStateAction = {
  type: typeof RESET_OAUTH_STATE
}

export type OAuthActions =
  | OpenPopupAction
  | RequestNativeOpenPopupAction
  | SetCredentialsAction
  | NativeOpenPopupAction
  | ClosePopupAction
  | SetTwitterInfoAction
  | SetTwitterErrorAction
  | SetInstagramInfoAction
  | SetInstagramErrorAction
  | ResetOAuthStateAction

export const openPopup = (
  message: Message,
  provider: Provider
): OpenPopupAction => ({
  type: OPEN_POPUP,
  message,
  provider
})
export const requestNativeOpenPopup = (
  resolve: (c: Credentials | PromiseLike<Credentials>) => void,
  reject: (e: Error) => void,
  url: string,
  provider: Provider
): RequestNativeOpenPopupAction => ({
  type: REQUEST_NATIVE_OPEN_POPUP,
  resolve,
  reject,
  url,
  provider
})
export const setCredentials = (
  credentials: Credentials
): SetCredentialsAction => ({
  type: SET_CREDENTIALS,
  credentials
})
export const nativeOpenPopup = (
  url: string,
  provider: Provider
): NativeOpenPopupAction => ({
  type: NATIVE_OPEN_POPUP,
  url,
  provider
})
export const closePopup = (): ClosePopupAction => ({
  type: CLOSE_POPUP
})

export const setTwitterInfo = (
  uuid: string,
  profile: any,
  profileImage: { url: string; file: any },
  profileBanner: { url: string; file: any },
  requiresUserReview: boolean
): SetTwitterInfoAction => ({
  type: SET_TWITTER_INFO,
  uuid,
  profile,
  profileImage,
  profileBanner,
  requiresUserReview
})
export const setTwitterError = (error: any): SetTwitterErrorAction => ({
  type: SET_TWITTER_ERROR,
  error
})

export const setInstagramInfo = (
  uuid: string,
  profile: any,
  profileImage: { url: string; file: any },
  requiresUserReview: boolean
): SetInstagramInfoAction => ({
  type: SET_INSTAGRAM_INFO,
  uuid,
  profile,
  profileImage,
  requiresUserReview
})
export const setInstagramError = (error: any): SetInstagramErrorAction => ({
  type: SET_INSTAGRAM_ERROR,
  error
})

export const resetOAuthState = (): ResetOAuthStateAction => ({
  type: RESET_OAUTH_STATE
})
