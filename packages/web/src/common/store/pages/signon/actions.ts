import { ID, User } from '@audius/common'

import {
  AccountImage,
  InstagramProfile,
  TwitterProfile
} from 'common/store/account/reducer'

import { FollowArtistsCategory, Pages } from './types'

export const SET_FIELD = 'SIGN_ON/SET_FIELD'
export const SET_VALUE_FIELD = 'SIGN_ON/SET_VALUE_FIELD'
export const RESET_SIGN_ON = 'SIGN_ON/RESET_SIGN_ON'

export const VALIDATE_EMAIL = 'SIGN_ON/VALIDATE_EMAIL'
export const VALIDATE_EMAIL_IN_USE = 'SIGN_ON/VALIDATE_EMAIL_IN_USE'
export const VALIDATE_EMAIL_SUCCEEDED = 'SIGN_ON/VALIDATE_EMAIL_SUCCEEDED'
export const VALIDATE_EMAIL_FAILED = 'SIGN_ON/VALIDATE_EMAIL_FAILED'

export const VALIDATE_HANDLE = 'SIGN_ON/VALIDATE_HANDLE'
export const VALIDATE_HANDLE_SUCCEEDED = 'SIGN_ON/VALIDATE_HANDLE_SUCCEEDED'
export const VALIDATE_HANDLE_FAILED = 'SIGN_ON/VALIDATE_HANDLE_FAILED'

export const FOLLOW_ARTISTS = 'SIGN_ON/FOLLOW_ARTISTS'
export const SET_ACCOUNT_READY = 'SIGN_ON/SET_ACCOUNT_READY'

export const CHECK_EMAIL = 'SIGN_ON/CHECK_EMAIL'

export const SIGN_IN = 'SIGN_ON/SIGN_IN'
export const SIGN_IN_SUCCEEDED = 'SIGN_ON/SIGN_IN_SUCCEEDED'
export const SIGN_IN_FAILED = 'SIGN_ON/SIGN_IN_FAILED'

export const SIGN_UP = 'SIGN_ON/SIGN_UP'
export const SIGN_UP_SUCCEEDED = 'SIGN_ON/SIGN_UP_SUCCEEDED'
export const SIGN_UP_SUCCEEDED_WITH_ID = 'SIGN_ON/SIGN_UP_SUCCEEDED_WITH_ID'
export const SIGN_UP_FAILED = 'SIGN_ON/SIGN_UP_FAILED'
export const SIGN_UP_TIMEOUT = 'SIGN_ON/SIGN_UP_TIMEOUT'

export const SET_TWITTER_PROFILE = 'SIGN_ON/SET_TWITTER_PROFILE'
export const SET_TWITTER_PROFILE_ERROR = 'SIGN_ON/SET_TWITTER_PROFILE_ERROR'
export const SET_INSTAGRAM_PROFILE = 'SIGN_ON/SET_INSTAGRAM_PROFILE'
export const SET_INSTAGRAM_PROFILE_ERROR = 'SIGN_ON/SET_INSTAGRAM_PROFILE_ERROR'

export const SET_STATUS = 'SIGN_ON/SET_STATUS'
export const CONFIGURE_META_MASK = 'SIGN_ON/CONFIGURE_META_MASK'

export const OPEN_SIGN_ON = 'SIGN_ON/OPEN_SIGN_ON'

export const NEXT_PAGE = 'SIGN_ON/NEXT_PAGE'
export const PREVIOUS_PAGE = 'SIGN_ON/PREVIOUS_PAGE'
export const GO_TO_PAGE = 'SIGN_ON/GO_TO_PAGE'

export const SET_TOAST = 'SIGN_ON/SET_TOAST'
export const UPDATE_ROUTE_ON_COMPLETION = 'SIGN_ON/UPDATE_ROUTE_ON_COMPLETION'
export const UPDATE_ROUTE_ON_EXIT = 'SIGN_ON/UPDATE_ROUTE_ON_EXIT'

export const GET_USERS_TO_FOLLOW = 'SIGN_ON/GET_USERS_TO_FOLLOW'
export const SET_USERS_TO_FOLLOW = 'SIGN_ON/SET_USERS'
export const FETCH_ALL_FOLLOW_ARTISTS = 'SIGN_ON/FETCH_ALL_FOLLOW_ARTISTS'
export const FETCH_FOLLOW_ARTISTS_SUCCEEDED =
  'SIGN_ON/FETCH_FOLLOW_ARTISTS_SUCCEEDED'
export const FETCH_FOLLOW_ARTISTS_FAILED = 'SIGN_ON/FETCH_FOLLOW_ARTISTS_FAILED'
export const SET_FOLLOW_ARTIST_CATEGORY = 'SIGN_ON/SET_FOLLOW_ARTIST_CATEGORY'
export const ADD_FOLLOW_ARTISTS = 'SIGN_ON/ADD_FOLLOW_ARTISTS'
export const REMOVE_FOLLOW_ARTISTS = 'SIGN_ON/REMOVE_FOLLOW_ARTISTS'

export const SEND_WELCOME_EMAIL = 'SIGN_ON/SEND_WELCOME_EMAIL'

export const FETCH_REFERRER = 'SIGN_ON/FETCH_REFERRER'
export const SET_REFERRER = 'SIGN_ON/SET_REFERRER'

/**
 * Sets the value for a field in the sign on state
 * @param field the field to be set
 * @param value the value to be set
 */
export function setValueField(field: string, value: string) {
  return { type: SET_VALUE_FIELD, field, value }
}

/**
 * Sets the value for a field in the sign on state
 * @param field the field to be set
 * @param value the value to be set
 */
export function setField(field: string, value: unknown) {
  return { type: SET_FIELD, field, value }
}

/**
 * Resets a field in the signin flow
 */
export function resetSignOn() {
  return { type: RESET_SIGN_ON }
}

export function checkEmail(email: string) {
  return { type: CHECK_EMAIL, email }
}

/**
 * Requests the backend to check if email is valid
 * @param email the email to check
 */
export function validateEmail(email: string) {
  return { type: VALIDATE_EMAIL, email }
}

export function validateEmailInUse(email: string) {
  return { type: VALIDATE_EMAIL_IN_USE, email }
}

export function validateEmailSucceeded(available?: boolean) {
  return { type: VALIDATE_EMAIL_SUCCEEDED, available }
}

/**
 * Email is not valid
 * @param error The reason the email is not vallid
 */
export function validateEmailFailed(error: string) {
  return { type: VALIDATE_EMAIL_FAILED, error }
}

/**
 * Requests the backend to check if handle is valid
 * @param handle the handle to check
 * @param isOauthVerified whether or not the user is verified via oauth
 * @param onValidate
 *  callback to fire on successful validation
 */
export function validateHandle(
  handle: string,
  isOauthVerified: boolean,
  onValidate?: (error: boolean) => void
) {
  return { type: VALIDATE_HANDLE, handle, isOauthVerified, onValidate }
}

export function validateHandleSucceeded() {
  return { type: VALIDATE_HANDLE_SUCCEEDED }
}

/**
 * handle is not valid
 * @param error The reason the handle is not valid
 */
export function validateHandleFailed(error: string) {
  return { type: VALIDATE_HANDLE_FAILED, error }
}

/**
 * sign up
 * takes params from store signon state
 */
export function signUp() {
  return { type: SIGN_UP }
}

export const signUpSucceeded = () => ({ type: SIGN_UP_SUCCEEDED })

export function signUpSucceededWithId(userId: ID) {
  return { type: SIGN_UP_SUCCEEDED_WITH_ID, userId }
}

type SignUpFailedParams = {
  error: string
  phase: string
  redirectRoute: string
  shouldReport: boolean
  shouldToast: boolean
  message?: string
}

export const signUpFailed = ({
  error,
  phase,
  redirectRoute,
  shouldReport,
  shouldToast,
  message
}: SignUpFailedParams) => ({
  type: SIGN_UP_FAILED,
  error,
  phase,
  redirectRoute,
  shouldReport,
  shouldToast,
  message
})

/**
 * Attemp sign-in to the account
 * @param email account email
 * @param password account password
 */
export function signIn(email: string, password: string) {
  return { type: SIGN_IN, email, password }
}

export const signInSucceeded = () => ({ type: SIGN_IN_SUCCEEDED })
export const signInFailed = (
  error: string,
  phase: string,
  shouldReport = true
) => ({
  type: SIGN_IN_FAILED,
  error,
  phase,
  shouldReport
})

/**
 * Requests all the follow artist metadata is fetched
 */
export function fetchAllFollowArtists() {
  return { type: FETCH_ALL_FOLLOW_ARTISTS }
}

/**
 * Requests all the users from which to pick suggested followed artists
 */
export function getUsersToFollow() {
  return { type: GET_USERS_TO_FOLLOW }
}

/**
 * Requests all the users from which to pick suggested followed artists
 */
export function setUsersToFollow(users: User[]) {
  return { type: SET_USERS_TO_FOLLOW, users }
}

/**
 * Set the user ids for the follow artists category
 * @param category The genre category to set the user ids for
 * @param userIds The top user ids for a category
 */
export function fetchFollowArtistsSucceeded(
  category: FollowArtistsCategory,
  userIds: ID[]
) {
  return { type: FETCH_FOLLOW_ARTISTS_SUCCEEDED, category, userIds }
}

/**
 * Sets the Follow artist category
 * @param category The genre category to display to the user
 */
export function setFollowAristsCategory(category: FollowArtistsCategory) {
  return { type: SET_FOLLOW_ARTIST_CATEGORY, category }
}

/**
 * error response
 * @param error The error for fetch follow artists
 */
export function fetchFollowArtistsFailed(error: string) {
  return { type: FETCH_FOLLOW_ARTISTS_FAILED, error }
}

export function setTwitterProfile(
  twitterId: string,
  profile: TwitterProfile,
  profileImage?: AccountImage,
  coverPhoto?: AccountImage
) {
  return {
    type: SET_TWITTER_PROFILE,
    twitterId,
    profile,
    profileImage,
    coverPhoto
  }
}

export function setTwitterProfileError(error: string) {
  return { type: SET_TWITTER_PROFILE_ERROR, error }
}

export function setInstagramProfile(
  instagramId: string,
  profile: InstagramProfile,
  profileImage?: AccountImage
) {
  return {
    type: SET_INSTAGRAM_PROFILE,
    instagramId,
    profile,
    profileImage
  }
}

export function setInstagramProfileError(error: string) {
  return { type: SET_INSTAGRAM_PROFILE_ERROR, error }
}

/**
 * Follows users in signup flow after user is created
 * @param userIds array of userIds to follow
 */
export function followArtists(userIds: ID[]) {
  return { type: FOLLOW_ARTISTS, userIds }
}

/**
 * Sets the status of the signon flow 'loading' or 'editing'
 * @param status Status: 'loading' or 'editing'
 */
export function setStatus(status: 'loading' | 'editing') {
  return { type: SET_STATUS, status }
}

export function configureMetaMask() {
  return { type: CONFIGURE_META_MASK }
}

/**
 * Sets the accout status as ready, when the account is created and the followers are confirmed
 */
export function setAccountReady() {
  return { type: SET_ACCOUNT_READY }
}

/**
 * Adds the user ids to be followed on account completion
 * @param userIds The user ids to add as selected and follow
 */
export function addFollowArtists(userIds: ID[]) {
  return { type: ADD_FOLLOW_ARTISTS, userIds }
}

/**
 * Removes the user ids from the selected userIds array
 * @param userIds The user ids to remove from selected
 */
export function removeFollowArtists(userIds: ID[]) {
  return { type: REMOVE_FOLLOW_ARTISTS, userIds }
}

/**
 * Sets a toast appearing over signon
 */
export const showToast = (text: string) => ({
  type: SET_TOAST,
  text
})

/**
 * Clears a toast appearing over signon
 */
export const clearToast = () => ({
  type: SET_TOAST,
  text: null
})

export const showRequiresAccountModal = () => ({
  type: SET_TOAST,
  text: 'Oops, it looks like you need an account to do that!'
})

/**
 * Opens the signin/up modal in mobile and routes to the page on desktop
 * @param signIn Determines if the SignIn or SignUp flow is displayed
 * @param page optional page to open sign on to
 * @param fields optional fields to set in the sign in state when opening
 */
export const openSignOn = (
  signIn = false,
  page: string | null = null,
  fields: Record<string, unknown> = {}
) => {
  return { type: OPEN_SIGN_ON, signIn, page, fields }
}

export const nextPage = (isMobile: boolean) => ({ type: NEXT_PAGE, isMobile })
export const previousPage = () => ({ type: PREVIOUS_PAGE })
export const goToPage = (page: Pages) => ({ type: GO_TO_PAGE, page })

export const signUpTimeout = () => ({ type: SIGN_UP_TIMEOUT })
export const updateRouteOnCompletion = (route: string) => ({
  type: UPDATE_ROUTE_ON_COMPLETION,
  route
})
export const updateRouteOnExit = (route: string) => ({
  type: UPDATE_ROUTE_ON_EXIT,
  route
})

export const sendWelcomeEmail = (name: string) => ({
  type: SEND_WELCOME_EMAIL,
  name
})

/**
 * Fetches the referring user given their handle
 * @param handle the handle captured by the ?ref=<handle> search param
 */
export const fetchReferrer = (handle: string) => ({
  type: FETCH_REFERRER,
  handle
})

/**
 * Sets the user id of the referrer who invited this user signing up
 */
export const setReferrer = (userId: ID) => ({
  type: SET_REFERRER,
  userId
})
