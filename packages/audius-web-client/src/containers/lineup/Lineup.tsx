import React from 'react'
import { connect } from 'react-redux'

import { isMobile } from 'utils/clientUtil'
import { AppState, Status } from 'store/types'
import LineupProvider, { LineupProviderProps } from './LineupProvider'
import { LineupVariant } from './types'

import DesktopPlaylistTile from 'components/track/desktop/ConnectedPlaylistTile'
import MobilePlaylistTile from 'components/track/mobile/ConnectedPlaylistTile'
import DesktopTrackTile from 'components/track/desktop/ConnectedTrackTile'
import MobileTrackTile from 'components/track/mobile/ConnectedTrackTile'

export type LineupWithoutTile = Omit<
  LineupProviderProps,
  'trackTile' | 'skeletonTile' | 'playlistTile'
>
type LineupProps = LineupWithoutTile & ReturnType<typeof mapStateToProps>

/** A lineup renders a LineupProvider, injecting different tiles
 * depending on the client state.
 */
const Lineup = (props: LineupProps) => {
  const mobile = props.isMobile
  const trackTile = mobile ? MobileTrackTile : DesktopTrackTile
  const playlistTile = mobile ? MobilePlaylistTile : DesktopPlaylistTile

  return (
    <LineupProvider
      {...props}
      trackTile={trackTile}
      playlistTile={playlistTile}
    />
  )
}

Lineup.defaultProps = {
  lineup: {
    entries: [] as any[],
    order: {},
    total: 0,
    deleted: 0,
    status: Status.LOADING,
    hasMore: true,
    inView: true,
    prefix: '',
    page: 0,
    isMetadataLoading: false
  },
  start: 0,
  playingUid: '',
  playing: false,
  variant: LineupVariant.MAIN,
  selfLoad: true,
  delineate: false,
  loadMore: () => {},
  ordered: false,
  setInView: undefined
}

function mapStateToProps(state: AppState) {
  return {
    isMobile: isMobile()
  }
}

export default connect(mapStateToProps)(Lineup)
