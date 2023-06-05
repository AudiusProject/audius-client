import type { ReactNode } from 'react'

import type {
  ID,
  UID,
  PlaybackSource,
  Collection,
  FavoriteType,
  Track,
  LineupTrack,
  User,
  RepostType
} from '@audius/common'
import type { StyleProp, ViewStyle } from 'react-native'

import type { GestureResponderHandler } from 'app/types/gesture'

import type { TileProps } from '../core'
import type { ImageProps } from '../image/FastImage'

export type LineupItemProps = {
  /** Index of tile in lineup */
  index: number

  /** Are we in a trending lineup? Allows tiles to specialize their rendering */
  isTrending?: boolean

  /** Is this item unlisted (hidden)? */
  isUnlisted?: boolean

  /** Whether or not to show the artist pick indicators */
  showArtistPick?: boolean

  /** Whether to show an icon indicating rank in lineup */
  showRankIcon?: boolean

  /** Function that will toggle play of a track */
  togglePlay: (args: { uid: UID; id: ID; source: PlaybackSource }) => void

  /** Uid of the item */
  uid: UID

  /** Whether user is in chat screen */
  isChat?: boolean

  /** Optionally passed in collection to override  */
  collection?: Collection

  /** Optionally passed in tracks to override  */
  tracks?: LineupTrack[]

  /** Passed in styles */
  styles?: StyleProp<ViewStyle>
}

export type LineupTileProps = Omit<LineupItemProps, 'togglePlay'> & {
  children?: ReactNode

  /** Cosign information */
  coSign?: Track['_co_sign']

  /** Duration of the tile's tracks */
  duration?: number

  /** Favorite type used for the favorited user list */
  favoriteType: FavoriteType

  /** Hide the play count */
  hidePlays?: boolean

  /** Hide the share button */
  hideShare?: boolean

  /** ID of the item */
  id: ID

  /** Render function for the image */
  renderImage: (props: ImageProps) => ReactNode

  /** The item (track or collection) */
  item: Track | Collection

  /** Function to call when tile is pressed */
  onPress?: () => void

  /** Function to call when the overflow menu button is pressed */
  onPressOverflow?: GestureResponderHandler

  /** Function to call when repost is pressed */
  onPressRepost?: GestureResponderHandler

  /** Function to call when save is pressed */
  onPressSave?: GestureResponderHandler

  /** Function to call when share is pressed */
  onPressShare?: GestureResponderHandler

  /** Function to call when the title is pressed */
  onPressTitle?: GestureResponderHandler

  /** Amount of plays on this item */
  playCount?: number

  /** Repost type used for the reposted user list */
  repostType: RepostType

  /** Title of the item */
  title: string

  /** User associated with the item */
  user: User

  /** Does the tile uid match the playing uid */
  isPlayingUid: boolean

  TileProps?: Partial<TileProps>
}
