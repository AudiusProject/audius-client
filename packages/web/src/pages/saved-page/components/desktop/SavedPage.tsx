import { useCallback, useContext } from 'react'

import {
  CollectionWithOwner,
  ID,
  Lineup,
  SavedPageTabs as ProfileTabs,
  QueueItem,
  SavedPageCollection,
  SavedPageTrack,
  Status,
  TrackRecord,
  UID,
  User,
  savedPageSelectors,
  statusIsNotFinalized,
  useSavedAlbumsDetails
} from '@audius/common'
import { Button, ButtonType, IconPause, IconPlay } from '@audius/stems'
import { useSelector } from 'react-redux'

import { ReactComponent as IconAlbum } from 'assets/img/iconAlbum.svg'
import { ReactComponent as IconNote } from 'assets/img/iconNote.svg'
import Card, { CardProps } from 'components/card/desktop/Card'
import FilterInput from 'components/filter-input/FilterInput'
import Header from 'components/header/desktop/Header'
import InfiniteCardLineup from 'components/lineup/InfiniteCardLineup'
import Page from 'components/page/Page'
import { dateSorter } from 'components/table'
import { TracksTable, TracksTableColumn } from 'components/tracks-table'
import EmptyTable from 'components/tracks-table/EmptyTable'
import { useGoToRoute } from 'hooks/useGoToRoute'
import { useOrderedLoad } from 'hooks/useOrderedLoad'
import useTabs from 'hooks/useTabs/useTabs'
import { MainContentContext } from 'pages/MainContentContext'
import { albumPage } from 'utils/route'

import { formatCardSecondaryText } from '../utils'

import styles from './SavedPage.module.css'

const { getInitialFetchStatus } = savedPageSelectors

const messages = {
  filterPlaceholder: 'Filter Tracks',
  emptyAlbumsHeader: 'You haven’t favorited any albums yet.',
  emptyAlbumsBody: 'Once you have, this is where you’ll find them!',
  emptyTracksHeader: 'You haven’t favorited any tracks yet.',
  emptyTracksBody: 'Once you have, this is where you’ll find them!',
  goToTrending: 'Go to Trending'
}

type AlbumCardProps = Pick<CardProps, 'index' | 'isLoading' | 'setDidLoad'> & {
  album: CollectionWithOwner
}

const AlbumCard = ({ album, index, isLoading, setDidLoad }: AlbumCardProps) => {
  const goToRoute = useGoToRoute()

  const handleClick = useCallback(() => {
    if (album.ownerHandle) {
      goToRoute(
        albumPage(album.ownerHandle, album.playlist_name, album.playlist_id)
      )
    }
  }, [album.playlist_name, album.playlist_id, album.ownerHandle, goToRoute])

  return (
    <Card
      index={index}
      isLoading={isLoading}
      setDidLoad={setDidLoad}
      key={album.playlist_id}
      id={album.playlist_id}
      userId={album.playlist_owner_id}
      imageSize={album._cover_art_sizes}
      size='medium'
      playlistName={album.playlist_name}
      playlistId={album.playlist_id}
      isPlaylist={false}
      isPublic={!album.is_private}
      handle={album.ownerHandle}
      primaryText={album.playlist_name}
      secondaryText={formatCardSecondaryText(
        album.save_count,
        album.playlist_contents.track_ids.length
      )}
      isReposted={album.has_current_user_reposted}
      isSaved={album.has_current_user_saved}
      cardCoverImageSizes={album._cover_art_sizes}
      onClick={handleClick}
    />
  )
}

const AlbumsTabContent = () => {
  const goToRoute = useGoToRoute()

  const {
    data: albums,
    status,
    hasMore,
    fetchMore
  } = useSavedAlbumsDetails({ pageSize: 20 })
  const { isLoading: isAlbumLoading, setDidLoad } = useOrderedLoad(
    albums.length
  )
  const cards = albums.map((album, i) => {
    return (
      <AlbumCard
        index={i}
        isLoading={isAlbumLoading(i)}
        setDidLoad={setDidLoad}
        key={album.playlist_id}
        album={album}
      />
    )
  })

  if (!statusIsNotFinalized(status) && cards.length === 0) {
    return (
      <EmptyTable
        primaryText={messages.emptyAlbumsHeader}
        secondaryText={messages.emptyAlbumsBody}
        buttonLabel={messages.goToTrending}
        onClick={() => goToRoute('/trending')}
      />
    )
  }

  return (
    <InfiniteCardLineup
      hasMore={hasMore}
      loadMore={fetchMore}
      cards={cards}
      cardsClassName={styles.cardsContainer}
    />
  )
}

const tableColumns: TracksTableColumn[] = [
  'playButton',
  'trackName',
  'artistName',
  'releaseDate',
  'savedDate',
  'length',
  'plays',
  'reposts',
  'overflowActions'
]

export type SavedPageProps = {
  title: string
  description: string
  onFilterChange: (e: any) => void
  onSortChange: (method: string, direction: string) => void
  isQueued: boolean
  playingUid: UID | null
  getFilteredData: (
    trackMetadatas: SavedPageTrack[]
  ) => [SavedPageTrack[], number]
  fetchMoreTracks: (offset?: number, limit?: number) => void
  onClickRow: (record: TrackRecord) => void
  onClickSave: (record: TrackRecord) => void
  onClickTrackName: (record: TrackRecord) => void
  onClickArtistName: (record: TrackRecord) => void
  onClickRepost: (record: TrackRecord) => void
  onPlay: () => void
  onSortTracks: (sorters: any) => void
  onChangeTab: (tab: ProfileTabs) => void
  allTracksFetched: boolean
  filterText: string
  initialOrder: UID[] | null
  currentTab: ProfileTabs
  account: (User & { albums: SavedPageCollection[] }) | undefined
  tracks: Lineup<SavedPageTrack>
  currentQueueItem: QueueItem
  playing: boolean
  buffering: boolean
  fetchSavedTracks: () => void
  resetSavedTracks: () => void
  updateLineupOrder: (updatedOrderIndices: UID[]) => void
  fetchSavedAlbums: () => void
  goToRoute: (route: string) => void
  play: (uid?: UID) => void
  pause: () => void
  repostTrack: (trackId: ID) => void
  undoRepostTrack: (trackId: ID) => void
  saveTrack: (trackId: ID) => void
  unsaveTrack: (trackId: ID) => void
  onClickRemove: any
  onReorderTracks: any
}

const SavedPage = ({
  title,
  description,
  account,
  tracks: { status, entries },
  goToRoute,
  playing,
  currentTab,
  isQueued,
  fetchMoreTracks,
  getFilteredData,
  onPlay,
  onFilterChange,
  onSortChange,
  allTracksFetched,
  filterText,
  onChangeTab,
  onClickRow,
  onClickSave,
  onClickTrackName,
  onClickArtistName,
  onClickRepost,
  onClickRemove,
  onSortTracks,
  onReorderTracks
}: SavedPageProps) => {
  const { mainContentRef } = useContext(MainContentContext)
  const initFetch = useSelector(getInitialFetchStatus)
  const [dataSource, playingIndex] =
    status === Status.SUCCESS || entries.length
      ? getFilteredData(entries)
      : [[], -1]

  const isEmpty =
    entries.length === 0 ||
    !entries.some((entry: SavedPageTrack) => Boolean(entry.track_id))
  const tracksLoading =
    (status === Status.IDLE || status === Status.LOADING) && isEmpty
  const queuedAndPlaying = playing && isQueued

  // Setup play button
  const playButtonActive = currentTab === ProfileTabs.TRACKS && !tracksLoading
  const playAllButton = (
    <div
      className={styles.playButtonContainer}
      style={{
        opacity: playButtonActive ? 1 : 0,
        pointerEvents: playButtonActive ? 'auto' : 'none'
      }}
    >
      <Button
        className={styles.playAllButton}
        iconClassName={styles.playAllButtonIcon}
        textClassName={styles.playAllButtonText}
        type={ButtonType.PRIMARY_ALT}
        text={queuedAndPlaying ? 'PAUSE' : 'PLAY'}
        leftIcon={queuedAndPlaying ? <IconPause /> : <IconPlay />}
        onClick={onPlay}
      />
    </div>
  )

  // Setup filter
  const filterActive = currentTab === ProfileTabs.TRACKS
  const filter = (
    <div
      className={styles.filterContainer}
      style={{
        opacity: filterActive ? 1 : 0,
        pointerEvents: filterActive ? 'auto' : 'none'
      }}
    >
      <FilterInput
        placeholder={messages.filterPlaceholder}
        onChange={onFilterChange}
        value={filterText}
      />
    </div>
  )

  const { tabs, body } = useTabs({
    isMobile: false,
    didChangeTabsFrom: (_, to) => {
      onChangeTab(to as ProfileTabs)
    },
    bodyClassName: styles.tabBody,
    elementClassName: styles.tabElement,
    tabs: [
      {
        icon: <IconNote />,
        text: ProfileTabs.TRACKS,
        label: ProfileTabs.TRACKS
      },
      {
        icon: <IconAlbum />,
        text: ProfileTabs.ALBUMS,
        label: ProfileTabs.ALBUMS
      }
    ],
    elements: [
      isEmpty && !tracksLoading ? (
        <EmptyTable
          primaryText={messages.emptyTracksHeader}
          secondaryText={messages.emptyTracksBody}
          buttonLabel={messages.goToTrending}
          onClick={() => goToRoute('/trending')}
        />
      ) : (
        <TracksTable
          columns={tableColumns}
          data={dataSource}
          defaultSorter={dateSorter('dateSaved')}
          fetchMoreTracks={fetchMoreTracks}
          isVirtualized
          key='favorites'
          loading={tracksLoading || initFetch}
          onClickArtistName={onClickArtistName}
          onClickFavorite={onClickSave}
          onClickRepost={onClickRepost}
          onClickRow={onClickRow}
          onClickTrackName={onClickTrackName}
          onSortTracks={allTracksFetched ? onSortTracks : onSortChange}
          playing={queuedAndPlaying}
          playingIndex={playingIndex}
          scrollRef={mainContentRef}
          useLocalSort={allTracksFetched}
          totalRowCount={Math.min(
            dataSource.length,
            account?.track_save_count ?? Infinity
          )}
          userId={account ? account.user_id : 0}
        />
      ),
      <div className={styles.albumsWrapper} key='albums'>
        <AlbumsTabContent />
      </div>
    ]
  })

  const header = (
    <Header
      primary='Favorites'
      secondary={isEmpty ? null : playAllButton}
      rightDecorator={filter}
      containerStyles={styles.savedPageHeader}
      bottomBar={tabs}
    />
  )

  return (
    <Page
      title={title}
      description={description}
      contentClassName={styles.savedPageWrapper}
      header={header}
    >
      <div className={styles.bodyWrapper}>{body}</div>
    </Page>
  )
}

export default SavedPage
