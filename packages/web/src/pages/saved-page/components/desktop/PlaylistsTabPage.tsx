import { useCallback, useMemo } from 'react'

import {
  accountSelectors,
  cacheCollectionsActions,
  CreatePlaylistSource,
  statusIsNotFinalized,
  useGetLibraryPlaylists,
  useAllPaginatedQuery,
  savedPageSelectors
} from '@audius/common'
import { IconPlus } from '@audius/stems'
import { useDispatch, useSelector } from 'react-redux'

import { InfiniteCardLineup } from 'components/lineup/InfiniteCardLineup'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import EmptyTable from 'components/tracks-table/EmptyTable'
import UploadChip from 'components/upload/UploadChip'

import { CollectionCard } from './CollectionCard'
import styles from './SavedPage.module.css'
const { createPlaylist } = cacheCollectionsActions
const { getUserId } = accountSelectors
const { getSelectedCategory } = savedPageSelectors

const messages = {
  emptyPlaylistsHeader: 'You haven’t created or favorited any playlists yet.',
  emptyPlaylistsBody: 'Once you have, this is where you’ll find them!',
  createPlaylist: 'Create Playlist',
  newPlaylist: 'New Playlist'
}

export const PlaylistsTabPage = () => {
  const dispatch = useDispatch()
  const currentUserId = useSelector(getUserId)
  const selectedCategory = useSelector(getSelectedCategory)

  const {
    data: fetchedPlaylists,
    status,
    hasMore,
    loadMore: fetchMore
  } = useAllPaginatedQuery(
    useGetLibraryPlaylists,
    {
      userId: currentUserId!,
      category: selectedCategory
    },
    {
      pageSize: 20,
      disabled: currentUserId == null
    }
  )

  const noFetchedResults =
    !statusIsNotFinalized(status) && fetchedPlaylists?.length === 0

  const handleCreatePlaylist = useCallback(() => {
    dispatch(
      createPlaylist(
        { playlist_name: messages.newPlaylist },
        CreatePlaylistSource.LIBRARY_PAGE
      )
    )
  }, [dispatch])

  const cards = useMemo(() => {
    const createPlaylistCard = (
      <UploadChip
        type='playlist'
        variant='card'
        onClick={handleCreatePlaylist}
      />
    )
    return [
      createPlaylistCard,
      ...fetchedPlaylists?.map(({ playlist_id: id }, i) => {
        return <CollectionCard index={i} key={id} albumId={id} />
      })
    ]
  }, [fetchedPlaylists, handleCreatePlaylist])

  if (statusIsNotFinalized(status)) {
    // TODO(nkang) - Confirm loading state UI
    return <LoadingSpinner className={styles.spinner} />
  }

  // TODO(nkang) - Add separate error state
  if (noFetchedResults || !fetchedPlaylists) {
    return (
      <EmptyTable
        primaryText={messages.emptyPlaylistsHeader}
        secondaryText={messages.emptyPlaylistsBody}
        buttonLabel={messages.createPlaylist}
        buttonIcon={<IconPlus />}
        onClick={handleCreatePlaylist}
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
