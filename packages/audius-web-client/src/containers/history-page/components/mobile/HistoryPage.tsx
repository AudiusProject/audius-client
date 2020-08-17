import React, { memo, useEffect, useCallback, useContext } from 'react'
import { Button, ButtonType } from '@audius/stems'

import TrackList from 'components/track/mobile/TrackList'
import { ID, UID } from 'models/common/Identifiers'
import NavContext, { LeftPreset } from 'containers/nav/store/context'
import MobilePageContainer from 'components/general/MobilePageContainer'
import { TrackItemAction } from 'components/track/mobile/TrackListItem'
import { TRENDING_PAGE } from 'utils/route'

import styles from './HistoryPage.module.css'
import Spin from 'antd/lib/spin'

const messages = {
  header: 'LISTENING HISTORY',
  empty: {
    primary: 'You haven’t listened to any tracks yet.',
    secondary: 'Once you have, this is where you’ll find them!',
    cta: 'Start Listening'
  }
}

export type HistoryPageProps = {
  title: string
  description: string
  userId: ID
  entries: any
  playing: boolean
  isEmpty: boolean
  loading: boolean
  onToggleSave: (isSaved: boolean, trackId: ID) => void
  onTogglePlay: (uid: UID, trackId: ID) => void
  currentQueueItem: any
  goToRoute: (route: string) => void
}

const HistoryPage = ({
  title,
  description,
  entries,
  playing,
  isEmpty,
  loading,
  goToRoute,
  onTogglePlay,
  onToggleSave,
  currentQueueItem
}: HistoryPageProps) => {
  // Set Header Nav
  const { setLeft, setCenter, setRight } = useContext(NavContext)!
  useEffect(() => {
    setLeft(LeftPreset.BACK)
    setCenter(messages.header)
    setRight(null)
  }, [setLeft, setCenter, setRight])

  const tracks = entries.map((track: any, index: number) => {
    const isActive = track.uid === currentQueueItem.uid
    return {
      isLoading: loading,
      isSaved: track.has_current_user_saved,
      isActive,
      isPlaying: isActive && playing,
      artistName: track.user.name,
      trackTitle: track.title,
      trackId: track.track_id,
      uid: track.uid,
      coverArtSizes: track._cover_art_sizes,
      isDeleted: track.is_delete
    }
  })

  const onClickEmtpy = useCallback(() => {
    goToRoute(TRENDING_PAGE)
  }, [goToRoute])

  return (
    <MobilePageContainer title={title} description={description}>
      {isEmpty && !loading ? (
        <div className={styles.emptyContainer}>
          <div className={styles.primary}>
            {messages.empty.primary}
            <i className='emoji face-with-monocle' />
          </div>
          <div className={styles.secondary}>{messages.empty.secondary}</div>
          <Button
            type={ButtonType.SECONDARY}
            className={styles.btn}
            textClassName={styles.btnText}
            onClick={onClickEmtpy}
            text={messages.empty.cta}
          />
        </div>
      ) : (
        <div className={styles.trackListContainer}>
          {loading && <Spin size='large' className={styles.spin} />}
          <TrackList
            containerClassName={styles.containerClassName}
            tracks={tracks}
            itemClassName={styles.itemClassNamew}
            showDivider
            showBorder
            onSave={onToggleSave}
            togglePlay={onTogglePlay}
            trackItemAction={TrackItemAction.Overflow}
          />
        </div>
      )}
    </MobilePageContainer>
  )
}

export default memo(HistoryPage)
