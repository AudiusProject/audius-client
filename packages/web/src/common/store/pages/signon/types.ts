import { ID, User } from '@audius/common'

export enum EditingStatus {
  EDITING = 'editing',
  LOADING = 'loading',
  SUCCESS = 'success',
  FAILURE = 'failure'
}

export interface EditableField {
  value: string
  error: string
  status: EditingStatus
}

export enum FollowArtistsCategory {
  FEATURED = 'Featured',
  ALL_GENRES = 'All Genres',
  ELECTRONIC = 'Electronic',
  HIP_HOP_RAP = 'Hip-Hop/Rap',
  ALTERNATIVE = 'Alternative',
  POP = 'Pop'
}

// Order list fo the enum above
export const artistCategories = [
  FollowArtistsCategory.FEATURED,
  FollowArtistsCategory.ALL_GENRES,
  FollowArtistsCategory.ELECTRONIC,
  FollowArtistsCategory.HIP_HOP_RAP,
  FollowArtistsCategory.ALTERNATIVE,
  FollowArtistsCategory.POP
]

export type FollowArtists = {
  selectedCategory: FollowArtistsCategory
  categories: {
    [key in keyof typeof FollowArtistsCategory]?: ID[]
  }
  selectedUserIds: ID[]
}

export default interface SignOnPageState {
  email: EditableField
  name: EditableField
  password: EditableField
  handle: EditableField
  verified: boolean
  useMetaMask: boolean
  accountReady: boolean
  twitterId: string
  twitterScreenName: string
  profileImage: { file: File; url: string }
  coverPhoto: { file: File; url: string }
  suggestedFollowIds: ID[]
  suggestedFollowEntries: User[]
  followIds: ID[]
  status: EditingStatus
  toastText: string | null
  followArtists: FollowArtists
}

export type { SignOnPageState }

export type SignOnPageReducer = (
  state: SignOnPageState,
  action: unknown
) => SignOnPageState

export enum Pages {
  SIGNIN = 'SIGNIN',
  EMAIL = 'EMAIL',
  PASSWORD = 'PASSWORD',
  PROFILE = 'PROFILE',
  FOLLOW = 'FOLLOW',
  LOADING = 'LOADING',
  START = 'START',
  NOTIFICATION_SETTINGS = 'NOTIFICATION_SETTINGS',
  APP_CTA = 'APP_CTA'
}
