import { MouseEvent, ReactNode } from 'react'

import {
  ID,
  UID,
  PlaybackSource,
  Favorite,
  CoverArtSizes,
  Repost,
  FieldVisibility,
  LineupTrack,
  Remix
} from '@audius/common'

export enum TrackTileSize {
  LARGE = 'LARGE',
  SMALL = 'SMALL'
}

export type TileProps = {
  size?: TrackTileSize
  containerClassName?: string
  index: number
  repostCount: number
  followeeReposts: Repost[]
  followeeSaves: Favorite[]
  hasCurrentUserReposted: boolean
  hasCurrentUserSaved: boolean
  duration: number
  coverArtSizes: CoverArtSizes
  activityTimestamp?: string
  togglePlay: (uid: UID, trackId: ID, source?: PlaybackSource) => void
  trackTileStyles?: {}
  uid: UID
  id: ID
  userId: ID
  isActive: boolean
  isPlaying: boolean
  isLoading: boolean
  hasLoaded: (index: number) => void
  goToRoute: (route: string) => void
  isTrending: boolean
  showRankIcon: boolean
}

export type TrackTileProps = TileProps & {
  title: string
  showArtistPick?: boolean
  showListens?: boolean
  disableActions?: boolean
  showArtworkIcon?: boolean
  showSkeleton?: boolean
  userSignedIn?: boolean
  listenCount?: number
  saveCount: number
  fieldVisibility?: FieldVisibility
  artistName: string
  artistHandle: string
  artistIsVerified: boolean
  ordered?: boolean
  uploading?: boolean
  uploadPercent?: number
  uploadText?: string
  uploadError?: boolean
  isArtistPick?: boolean
  isUnlisted?: boolean
  coSign?: Remix | null
  onClickOverflow?: (trackId: ID) => void
}

export type PlaylistTileProps = TileProps & {
  playingUid?: UID | null
  playingTrackId?: ID | null
  isAlbum: boolean
  isPublic: boolean
  contentTitle: string
  playlistTitle: string
  artistName: string
  artistHandle: string
  artistIsVerified: boolean
  activeTrackUid: UID | null
  saveCount: number
  tracks: LineupTrack[]
  trackCount: number
  showArtworkIcon?: boolean
  showSkeleton?: boolean
  pauseTrack: () => void
  playTrack: (uid: UID) => void
  disableActions?: boolean
  ordered?: boolean
  uploading?: boolean
  uploadPercent?: number
  ownerId: ID
  // TODO: remove when making all playlist tiles functional components
  record?: (event: any) => void
  /** Number of rows to show when in loading state, if any */
  numLoadingSkeletonRows?: number
}

export type DesktopTrackTileProps = {
  /** Size of the track Tile Large or Small */
  size: TrackTileSize

  /** Prefix order number displayed on the left side of the tile */
  order?: number

  /** The number of plays for the track */
  listenCount?: number

  /** If there is nothing underneath, it's standalone */
  standalone?: boolean

  /** If the track is currently playing */
  isActive: boolean

  /** If the button actions should be clickable */
  isDisabled?: boolean

  /** If the track is unlisted/hidden */
  isUnlisted?: boolean

  /** If track metadata is loading in */
  isLoading?: boolean

  /** Number of rows to show when in loading state, if any */
  numLoadingSkeletonRows?: number

  /** If the artist selected this track as featured, displays a star and artst pick label */
  isArtistPick?: boolean

  /** If in dark mode for the bottom buttons to be colored */
  isDarkMode?: boolean

  /** Are we in matrix mode? */
  isMatrixMode: boolean

  /** The artwork for the track tile */
  artwork: ReactNode

  /** The upper most text in the tracktile */
  header?: ReactNode

  /** The beneath the header is the title, for the track's name */
  title: ReactNode

  /** The beneath the title is the username, for the track's creator */
  userName: ReactNode

  /** The beneath the username is the state, displays the favorite and repost counts */
  stats: ReactNode

  /** The fields which are visible on the track */
  fieldVisibility?: FieldVisibility

  /** Displayed on the bottom right is the kebab icon for menu options */
  rightActions?: ReactNode

  /** Optional bottom bar to be rendered in place of the favorite, repost and share icons */
  bottomBar?: ReactNode

  /** The track's duration in seconds displayed in the top right */
  duration?: number

  /** Class name to be added to the top level container of the tracktile */
  containerClassName?: string

  /** Incdates if the current user if the creator of the track tile */
  isOwner: boolean

  /** Incdates if the current user has favorited the track */
  isFavorited?: boolean

  /** Incdates if the current user has reposted the track */
  isReposted?: boolean

  /** Incdates if the repost, favorite, and share buttons should be rendered */
  showIconButtons?: boolean

  /** on click title */
  onClickTitle: (e: MouseEvent) => void

  /** on click repost icon */
  onClickRepost: (e?: MouseEvent) => void

  /** on click favorite icon */
  onClickFavorite: (e?: MouseEvent) => void

  /** on click share icon */
  onClickShare: (e?: MouseEvent) => void

  /** On click track tile that's does not trigger another action (ie. button or text) */
  onTogglePlay: (e?: MouseEvent) => void

  /** Are we in a trending lineup? Allows tiles to specialize their rendering */
  isTrending?: boolean

  /** Whether to show an icon indicating rank in lineup */
  showRankIcon: boolean
}

export type DesktopPlaylistTileProps = {
  /** Size of the track Tile Large or Small */
  size: TrackTileSize

  /** Prefix order number displayed on the left side of the track tile */
  order?: number

  /** If the track is currently playing */
  isActive: boolean

  /** If the button actions should be clickable */
  isDisabled?: boolean

  /** If track metadata is loading in */
  isLoading?: boolean

  /** Number of rows to show when in loading state, if any */
  numLoadingSkeletonRows?: number

  /** If the artist selected this track as featured, displays a star and artst pick label */
  isArtistPick?: boolean

  /** If in dark mode for the bottom buttons to be colored */
  isDarkMode?: boolean

  /** Are we in matrix mode? */
  isMatrixMode: boolean

  /** The artwork for the track tile */
  artwork: ReactNode

  /** The upper most text in the tracktile */
  header?: ReactNode

  /** The beneath the header is the title, for the track's name */
  title: ReactNode

  /** The beneath the title is the username, for the track's creator */
  userName: ReactNode

  /** The beneath the username is the state, displays the favorite and repost counts */
  stats: ReactNode

  /** Displayed on the bottom right is the kebab icon for menu options */
  rightActions?: ReactNode

  /** Optional bottom bar to be rendered in place of the favorite, repost and share icons */
  bottomBar?: ReactNode

  /** The track's duration in seconds displayed in the top right */
  duration?: number

  /** Class name to be added to the top level container of the playlist tile */
  containerClassName?: string

  /** Class name to be added to the top level container of the tracktile */
  tileClassName?: string

  /** Class name to be added to the top level container of the tracklist */
  tracksContainerClassName?: string

  /** Incdates if the current user if the creator of the track tile */
  isOwner: boolean

  /** Incdates if the current user has favorited the track */
  isFavorited?: boolean

  /** Incdates if the current user has reposted the track */
  isReposted?: boolean

  /** Incdates if the repost, favorite, and share buttons should be rendered */
  showIconButtons?: boolean

  /** on click title */
  onClickTitle: (e: MouseEvent) => void

  /** on click repost icon */
  onClickRepost: (e?: MouseEvent) => void

  /** on click favorite icon */
  onClickFavorite: (e?: MouseEvent) => void

  /** on click share icon */
  onClickShare: (e?: MouseEvent) => void

  /** On click track tile that's does not trigger another action (ie. button or text) */
  onTogglePlay: (e?: MouseEvent) => void

  /** The list of tracks to be rendered under the tracktile  */
  trackList: ReactNode[]

  /** The full track count for the playlist (may include tracks not rendered) */
  trackCount: number

  /** The wrapper react compoenent for the track tile - can be used for drag and drop */
  TileTrackContainer?: any

  /** Are we in a trending lineup? Allows tiles to specialize their rendering */
  isTrending?: boolean

  /** Whether to show an icon indicating rank in lineup */
  showRankIcon: boolean
}

export type SkeletonTileProps = {
  index?: number
  key: number
  tileSize: TrackTileSize
  ordered?: boolean
}
