import { Dictionary, EntityState, PayloadAction } from '@reduxjs/toolkit'

import { ID } from 'models/Identifiers'
import { SquareSizes, WidthSizes } from 'models/ImageSizes'
import { User } from 'models/User'

export type AddUsersAction = PayloadAction<{
  users: User[]
}>

export type FetchUsersAction = PayloadAction<{
  userIds: ID[]
  requiredFields?: any
  forceRetrieveFromSource?: boolean
}>

export type FetchUserSocialsAction = PayloadAction<{
  handle: string
}>

export type FetchCoverPhotoAction = PayloadAction<{
  id: ID
  size: WidthSizes
}>

export type FetchProfilePictureAction = PayloadAction<{
  id: ID
  size: SquareSizes
}>

export type UsersState = EntityState<User> & {
  handles: Dictionary<ID>
  timestamps: Dictionary<number>
}
