import { ReactNode } from 'react'

import { Collection } from 'audius-client/src/common/models/Collection'
import { FavoriteType } from 'audius-client/src/common/models/Favorite'
import { ID, UID } from 'audius-client/src/common/models/Identifiers'
import { Track } from 'audius-client/src/common/models/Track'
import { User } from 'audius-client/src/common/models/User'
import { RepostType } from 'audius-client/src/common/store/user-list/reposts/types'

import { GestureResponderHandler } from 'app/types/gesture'

export type DetailsTileParentProps = {
  /** Uid of the item */
  uid: UID
}

export type DetailsTileDetail = {
  icon?: ReactNode
  isHidden?: boolean
  label: string
  value: ReactNode
}

export type DetailsTileProps = {
  /** Cosign information */
  coSign?: Track['_co_sign']

  /** Source for the analytics call when an external link in the description is pressed */
  descriptionLinkPressSource: 'track page' | 'collection page'

  /** Information about the item such as genre, duration, etc */
  details: DetailsTileDetail[]

  /** Favorite type used for the favorited user list */
  favoriteType: FavoriteType

  /** Label to be displayed at the top of the tile */
  headerText: string

  /** Hide the favorite button */
  hideFavorite?: boolean

  /** Hide the favorite count */
  hideFavoriteCount?: boolean

  /** Hide the listen count */
  hideListenCount?: boolean

  /** Hide the overflow menu button */
  hideOverflow?: boolean

  /** Hide the repost button */
  hideRepost?: boolean

  /** Hide the repost count */
  hideRepostCount?: boolean

  /** Hide the share button */
  hideShare?: boolean

  /** ID of the item */
  id: ID

  /** Url of the image */
  imageUrl: string

  /** The item (track or collection) */
  item: Track | Collection

  /** Function to call when the overflow menu button is pressed */
  onPressOverflow?: GestureResponderHandler

  /** Function to call when play button is pressed */
  onPressPlay: GestureResponderHandler

  /** Function to call when repost is pressed */
  onPressRepost?: GestureResponderHandler

  /** Function to call when save is pressed */
  onPressSave?: GestureResponderHandler

  /** Function to call when share is pressed */
  onPressShare?: GestureResponderHandler

  /** Render function for content below primary details */
  renderBottomContent?: () => ReactNode

  /** Render function for the header */
  renderHeader?: () => ReactNode

  /** Repost type used for the reposted user list */
  repostType: RepostType

  /** Amount of plays on this item */
  playCount?: number

  /** Title of the item */
  title: string

  /** User associated with the item */
  user: User
}
