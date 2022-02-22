import { ReactNode } from 'react'

import { PlaybackSource } from 'audius-client/src/common/models/Analytics'
import { ID, UID } from 'audius-client/src/common/models/Identifiers'
import { Track } from 'audius-client/src/common/models/Track'

import { GestureResponderHandler } from 'app/types/gesture'

export type LineupTileProps = {
  children?: ReactNode

  /** Cosign information */
  coSign: Track['_co_sign']

  /** Duration of the tile's tracks */
  duration: number

  /** Hide the play count */
  hidePlays?: boolean

  /** Hide the share button */
  hideShare?: boolean

  /** Index of tile in lineup */
  index: number

  /** Are we in a trending lineup? Allows tiles to specialize their rendering */
  isTrending?: boolean

  /** Is this item unlisted (hidden)? */
  isUnlisted?: boolean

  /** Function to call when item & art has loaded */
  onLoad?: (index: number) => void

  /** Function to call when the title is pressed */
  onPressTitle?: GestureResponderHandler

  /** Amount of plays on this item */
  playCount?: number

  /** Whether or not to show the artist pick indicators */
  showArtistPick?: boolean

  /** Whether to show an icon indicating rank in lineup */
  showRankIcon?: boolean

  /** Title of the item */
  title: string

  /** Function to call when play is toggled */
  togglePlay: (uid: UID, trackId: ID, source?: PlaybackSource) => void

  /** Uid of the item */
  uid: UID
}
