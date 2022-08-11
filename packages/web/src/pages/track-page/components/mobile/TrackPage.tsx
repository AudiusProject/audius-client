import { useEffect, useContext } from 'react'

import { CID, ID, LineupState, Track, User } from '@audius/common'

import { tracksActions } from 'common/store/pages/track/lineup/actions'
import { QueueItem } from 'common/store/queue/types'
import { OverflowAction } from 'common/store/ui/mobile-overflow-menu/types'
import { HeaderContext } from 'components/header/mobile/HeaderContextProvider'
import Lineup from 'components/lineup/Lineup'
import { LineupVariant } from 'components/lineup/types'
import MobilePageContainer from 'components/mobile-page-container/MobilePageContainer'
import NavContext, {
  LeftPreset,
  CenterPreset,
  RightPreset
} from 'components/nav/store/context'
import NetworkConnectivityMonitor from 'components/network-connectivity/NetworkConnectivityMonitor'
import SectionButton from 'components/section-button/SectionButton'
import { getTrackDefaults, emptyStringGuard } from 'pages/track-page/utils'

import Remixes from './Remixes'
import TrackPageHeader from './TrackHeader'
import styles from './TrackPage.module.css'

const messages = {
  moreBy: 'More By',
  originalTrack: 'Original Track',
  viewOtherRemixes: 'View Other Remixes'
}

export type OwnProps = {
  title: string
  description: string
  canonicalUrl: string
  hasValidRemixParent: boolean
  // Hero Track Props
  heroTrack: Track | null
  user: User | null
  heroPlaying: boolean
  userId: ID | null
  onHeroPlay: (isPlaying: boolean) => void
  onHeroShare: (trackId: ID) => void
  goToProfilePage: (handle: string) => void
  goToSearchResultsPage: (tag: string) => void
  goToAllRemixesPage: () => void
  goToParentRemixesPage: () => void
  onHeroRepost: (isReposted: boolean, trackId: number) => void
  onClickMobileOverflow: (
    trackId: ID,
    overflowActions: OverflowAction[]
  ) => void

  onSaveTrack: (isSaved: boolean, trackId: ID) => void
  onDownloadTrack: (
    trackId: ID,
    cid: CID,
    creatorNodeEndpoints: string,
    category?: string,
    parentTrackId?: ID
  ) => void
  // Tracks Lineup Props
  tracks: LineupState<{ id: ID }>
  currentQueueItem: QueueItem
  isPlaying: boolean
  isBuffering: boolean
  play: (uid?: string) => void
  pause: () => void
  goToFavoritesPage: (trackId: ID) => void
  goToRepostsPage: (trackId: ID) => void
}

const TrackPage = ({
  title,
  description,
  canonicalUrl,
  hasValidRemixParent,
  // Hero Track Props
  heroTrack,
  user,
  heroPlaying,
  userId,
  onHeroPlay,
  onHeroShare,
  goToProfilePage,
  goToSearchResultsPage,
  goToAllRemixesPage,
  goToParentRemixesPage,
  onSaveTrack,
  onDownloadTrack,
  onHeroRepost,
  onClickMobileOverflow,

  // Tracks Lineup Props
  tracks,
  currentQueueItem,
  isPlaying,
  isBuffering,
  play,
  pause,
  goToFavoritesPage,
  goToRepostsPage
}: OwnProps) => {
  const { setLeft, setCenter, setRight } = useContext(NavContext)!
  useEffect(() => {
    setLeft(LeftPreset.BACK)
    setCenter(CenterPreset.LOGO)
    setRight(RightPreset.SEARCH)
  }, [setLeft, setCenter, setRight])

  const { setHeader } = useContext(HeaderContext)
  useEffect(() => {
    setHeader(null)
  }, [setHeader])

  const { entries } = tracks
  const isOwner = heroTrack ? heroTrack.owner_id === userId : false
  const isSaved = heroTrack ? heroTrack.has_current_user_saved : false
  const isReposted = heroTrack ? heroTrack.has_current_user_reposted : false
  const isFollowing = user ? user.does_current_user_follow : false

  const loading = !heroTrack

  const onPlay = () => onHeroPlay(heroPlaying)
  const onSave = isOwner
    ? () => {}
    : () => heroTrack && onSaveTrack(isSaved, heroTrack.track_id)
  const onRepost = isOwner
    ? () => {}
    : () => heroTrack && onHeroRepost(isReposted, heroTrack.track_id)
  const onClickArtistName = () => goToProfilePage(user ? user.handle : '')
  const onShare = () => {
    heroTrack && onHeroShare(heroTrack.track_id)
  }

  const onClickTag = (tag: string) => goToSearchResultsPage(`#${tag}`)

  const defaults = getTrackDefaults(heroTrack)

  const renderOriginalTrackTitle = () => (
    <div className={styles.lineupHeader}>{messages.originalTrack}</div>
  )

  const onDownload = (
    trackId: ID,
    cid: CID,
    category?: string,
    parentTrackId?: ID
  ) => {
    if (!user) return
    const { creator_node_endpoint } = user
    if (!creator_node_endpoint) return
    onDownloadTrack(
      trackId,
      cid,
      creator_node_endpoint,
      category,
      parentTrackId
    )
  }

  const renderMoreByTitle = () =>
    (defaults.remixParentTrackId && entries.length > 2) ||
    (!defaults.remixParentTrackId && entries.length > 1) ? (
      <div
        className={styles.lineupHeader}
      >{`${messages.moreBy} ${user?.name}`}</div>
    ) : null

  return (
    <NetworkConnectivityMonitor pageDidLoad={!loading}>
      <MobilePageContainer
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
      >
        <div className={styles.trackContent}>
          <TrackPageHeader
            isLoading={loading}
            isPlaying={heroPlaying}
            isReposted={isReposted}
            isFollowing={isFollowing}
            title={defaults.title}
            trackId={defaults.trackId}
            userId={heroTrack?.owner_id ?? 0}
            artistName={emptyStringGuard(user?.name)}
            artistVerified={user?.is_verified ?? false}
            coverArtSizes={defaults.coverArtSizes}
            tags={defaults.tags}
            description={defaults.description}
            listenCount={defaults.playCount}
            repostCount={defaults.repostCount}
            duration={defaults.duration}
            released={defaults.released}
            credits={defaults.credits}
            genre={defaults.genre}
            mood={defaults.mood}
            saveCount={defaults.saveCount}
            isOwner={isOwner}
            isSaved={isSaved}
            coSign={defaults.coSign}
            // Actions (Wire up once we add backend integrations)
            onClickArtistName={onClickArtistName}
            onClickMobileOverflow={onClickMobileOverflow}
            onClickTag={onClickTag}
            onPlay={onPlay}
            onSave={onSave}
            onShare={onShare}
            onRepost={onRepost}
            onDownload={onDownload}
            isUnlisted={defaults.isUnlisted}
            isRemix={!!defaults.remixParentTrackId}
            fieldVisibility={defaults.fieldVisibility}
            goToFavoritesPage={goToFavoritesPage}
            goToRepostsPage={goToRepostsPage}
          />
          {defaults.fieldVisibility.remixes &&
            defaults.remixTrackIds &&
            defaults.remixTrackIds.length > 0 && (
              <div className={styles.remixes}>
                <Remixes
                  trackIds={defaults.remixTrackIds}
                  goToAllRemixes={goToAllRemixesPage}
                  count={defaults.remixesCount}
                />
              </div>
            )}
          <div className={styles.tracksContainer}>
            {!hasValidRemixParent && renderMoreByTitle()}
            {hasValidRemixParent && renderOriginalTrackTitle()}
            <Lineup
              lineup={tracks}
              // Styles for leading element (original track if remix).
              leadingElementId={defaults.remixParentTrackId}
              leadingElementDelineator={
                <div className={styles.originalTrackDelineator}>
                  <SectionButton
                    isMobile
                    text={messages.viewOtherRemixes}
                    onClick={goToParentRemixesPage}
                  />
                  {renderMoreByTitle()}
                </div>
              }
              leadingElementClassName={styles.originalTrack}
              showLeadingElementArtistPick={false}
              // Don't render the first tile in the lineup.
              start={1}
              // Show max 5 loading tiles
              count={6}
              // Managed from the parent rather than allowing the lineup to fetch content itself.
              selfLoad={false}
              variant={LineupVariant.CONDENSED}
              playingUid={currentQueueItem.uid}
              playingSource={currentQueueItem.source}
              playingTrackId={
                currentQueueItem.track && currentQueueItem.track.track_id
              }
              playing={isPlaying}
              buffering={isBuffering}
              playTrack={play}
              pauseTrack={pause}
              actions={tracksActions}
            />
          </div>
        </div>
      </MobilePageContainer>
    </NetworkConnectivityMonitor>
  )
}

export default TrackPage
