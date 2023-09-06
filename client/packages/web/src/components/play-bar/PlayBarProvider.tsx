import { modalsSelectors, playerSelectors } from '@audius/common'
import cn from 'classnames'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router-dom'

import NowPlayingDrawer from 'components/now-playing/NowPlayingDrawer'
import { AppState } from 'store/types'
import { isMobile } from 'utils/clientUtil'

import styles from './PlayBarProvider.module.css'
import DesktopPlayBar from './desktop/PlayBar'
const { getCollectible, getUid: getPlayingUid } = playerSelectors
const { getModalVisibility } = modalsSelectors

type OwnProps = {
  isMobile: boolean
}

type PlayBarProviderProps = OwnProps &
  ReturnType<typeof mapStateToProps> &
  RouteComponentProps

const PlayBarProvider = ({
  isMobile,
  playingUid,
  collectible,
  addToPlaylistOpen
}: PlayBarProviderProps) => {
  return (
    <div
      className={cn(styles.playBarWrapper, {
        [styles.isMobile]: isMobile
      })}
    >
      {isMobile ? (
        <NowPlayingDrawer
          isPlaying={!!playingUid || !!collectible}
          shouldClose={addToPlaylistOpen === true}
        />
      ) : (
        <>
          <div className={styles.customHr} />
          <DesktopPlayBar />
        </>
      )}
    </div>
  )
}

function mapStateToProps(state: AppState) {
  return {
    playingUid: getPlayingUid(state),
    collectible: getCollectible(state),
    isMobile: isMobile(),
    addToPlaylistOpen: getModalVisibility(state, 'AddToPlaylist')
  }
}

export default withRouter(connect(mapStateToProps)(PlayBarProvider))
