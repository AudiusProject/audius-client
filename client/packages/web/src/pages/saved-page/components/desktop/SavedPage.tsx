import { useContext } from 'react'

import {
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
  savedPageSelectors
} from '@audius/common'
import { Button, ButtonType, IconPause, IconPlay } from '@audius/stems'
import { useSelector } from 'react-redux'

import { ReactComponent as IconAlbum } from 'assets/img/iconAlbum.svg'
import { ReactComponent as IconNote } from 'assets/img/iconNote.svg'
import { ReactComponent as IconPlaylists } from 'assets/img/iconPlaylists.svg'
import FilterInput from 'components/filter-input/FilterInput'
import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'
import { dateSorter } from 'components/table'
import { TracksTable, TracksTableColumn } from 'components/tracks-table'
import EmptyTable from 'components/tracks-table/EmptyTable'
import useTabs from 'hooks/useTabs/useTabs'
import { MainContentContext } from 'pages/MainContentContext'

import { AlbumsTabPage } from './AlbumsTabPage'
import { PlaylistsTabPage } from './PlaylistsTabPage'
import styles from './SavedPage.module.css'

const { getInitialFetchStatus } = savedPageSelectors

const messages = {
  filterPlaceholder: 'Filter Tracks',
  emptyTracksHeader: 'You haven’t favorited any tracks yet.',
  emptyTracksBody: 'Once you have, this is where you’ll find them!',
  goToTrending: 'Go to Trending'
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
  goToRoute: (route: string) => void
  play: (uid?: UID) => void
  pause: () => void
  repostTrack: (trackId: ID) => void
  undoRepostTrack: (trackId: ID) => void
  saveTrack: (trackId: ID) => void
  unsaveTrack: (trackId: ID) => void
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
  onClickRepost,
  onSortTracks
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
      },
      {
        icon: <IconPlaylists />,
        text: ProfileTabs.PLAYLISTS,
        label: ProfileTabs.PLAYLISTS
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
          onClickFavorite={onClickSave}
          onClickRepost={onClickRepost}
          onClickRow={onClickRow}
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
      <AlbumsTabPage key='albums' />,
      <PlaylistsTabPage key='playlists' />
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
