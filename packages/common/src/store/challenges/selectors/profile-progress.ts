import { getAccountUser } from 'store/account/selectors'
import { getProfileUserHandle } from 'store/pages/profile/selectors'

import { Status } from '../../../models/Status'
import { CommonState } from '../../commonStore'

export const getProfileDescriptionExists = (state: CommonState) => {
  const curUser = getAccountUser(state)
  if (!curUser) return false
  return curUser.bio !== null && curUser.bio !== undefined
}

export const getHasFavoritedItem = (state: CommonState) => {
  const curUser = getAccountUser(state)
  if (!curUser) return false
  const hasSavedTrack = (curUser.track_save_count || 0) > 0
  const hasSavedCollection = Object.keys(state.account.collections).length > 0
  return hasSavedTrack || hasSavedCollection
}

export const getHasReposted = (state: CommonState) => {
  const curUser = getAccountUser(state)
  if (!curUser) return false
  return curUser.repost_count > 0
}

export const getNumFollowedAccounts = (state: CommonState) => {
  const curUser = getAccountUser(state)
  if (!curUser) return 0
  return curUser.followee_count
}

export const getNameExists = (state: CommonState) => {
  const curUser = getAccountUser(state)
  if (!curUser) return false
  return !!curUser.name
}

export const getHandleExists = (state: CommonState) => {
  const curUser = getAccountUser(state)
  if (!curUser) return false
  return !!curUser.handle
}

export const getProfilePictureExists = (state: CommonState) => {
  const curUser = getAccountUser(state)
  if (!curUser) return false
  // If the user sets the profile picture this session,
  // we set the updatedProfilePicture field to an object (otherwise it's undefined).
  // If the profile picture was set in a previous session, we just have to check
  // if the profile_picture field is non-null.
  return (
    !!curUser.updatedProfilePicture ||
    !!curUser.profile_picture ||
    !!curUser.profile_picture_sizes
  )
}

export const getCoverPhotoExists = (state: CommonState) => {
  const curUser = getAccountUser(state)
  if (!curUser) return false

  // Same logic as getProfilePictureExists
  return (
    !!curUser.updatedCoverPhoto ||
    !!curUser.cover_photo ||
    !!curUser.cover_photo_sizes
  )
}

export const getCompletionStages = (state: CommonState) => ({
  hasProfileDescription: getProfileDescriptionExists(state),
  hasFavoritedItem: getHasFavoritedItem(state),
  hasReposted: getHasReposted(state),
  hasFollowedAccounts: getNumFollowedAccounts(state) >= 5,
  hasNameAndHandle: getNameExists(state) && getHandleExists(state),
  hasProfilePicture: getProfilePictureExists(state),
  hasCoverPhoto: getCoverPhotoExists(state)
})

export const getOrderedCompletionStages = (state: CommonState) => {
  const strings = {
    profileDescription: 'Profile Description',
    favorited: 'Favorite A Track/Playlist',
    reposted: 'Repost A Track/Playlist',
    followed: 'Follow Five Accounts',
    nameAndHandle: 'Name & Handle',
    profilePicture: 'Profile Picture',
    coverPhoto: 'Cover Photo'
  }

  const stages = getCompletionStages(state)
  return [
    {
      title: strings.profileDescription,
      isCompleted: stages.hasProfileDescription
    },
    {
      title: strings.favorited,
      isCompleted: stages.hasFavoritedItem
    },
    {
      title: strings.reposted,
      isCompleted: stages.hasReposted
    },
    {
      title: strings.followed,
      isCompleted: stages.hasFollowedAccounts
    },
    {
      title: strings.nameAndHandle,
      isCompleted: stages.hasNameAndHandle
    },
    {
      title: strings.profilePicture,
      isCompleted: stages.hasProfilePicture
    },
    {
      title: strings.coverPhoto,
      isCompleted: stages.hasCoverPhoto
    }
  ]
}

export const getProfilePageMeterDismissed = (state: CommonState) => {
  const profileHandle = getProfileUserHandle(state)
  if (!profileHandle) return false
  return state.pages.profile.entries[profileHandle]?.profileMeterDismissed
}

export const getIsAccountLoaded = (state: CommonState) =>
  state.account.status === Status.SUCCESS
