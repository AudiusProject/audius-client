import { ID, UID } from 'models/common/Identifiers'
import { LineupState } from 'models/common/Lineup'
import User from 'models/User'
import { Status } from 'store/types'

export enum FollowType {
  FOLLOWERS = 'followers',
  FOLLOWEES = 'followees',
  FOLLOWEE_FOLLOWS = 'followeeFollows'
}

export enum CollectionSortMode {
  TIMESTAMP = 0,
  SAVE_COUNT = 1
}

export enum TracksSortMode {
  RECENT = 0,
  POPULAR = 1
}

type Follow = {
  userIds: Array<{ id: ID; uid: UID }>
  status: Status
}

export type ProfilePageState = {
  handle: string
  userId: number
  status: Status
  updating: boolean
  updateSuccess: boolean
  updateError: boolean
  collectionIds: number[]
  mustUsedTags: string[]
  collectionSortMode: CollectionSortMode
  profileMeterDismissed: boolean
  followers: Follow
  followees: Follow
  followeeFollows: Follow
  feed: LineupState<{ id: ID }>
  tracks: LineupState<{ id: ID }>
  isNotificationSubscribed: boolean
  error?: string
  mostUsedTags: string[]
}

export enum Tabs {
  TRACKS = 'TRACKS',
  ALBUMS = 'ALBUMS',
  PLAYLISTS = 'PLAYLISTS',
  REPOSTS = 'REPOSTS'
}

type FollowerGroup = {
  status: Status
  users: User[]
}

export interface ProfileUser extends User {
  followers: FollowerGroup
  followeeFollows: FollowerGroup
  followees: FollowerGroup
}
