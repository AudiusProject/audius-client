import { useCallback, useMemo } from 'react'

import {
  cacheCollectionsActions,
  CommonState,
  CreatePlaylistSource,
  LibraryCategory,
  savedPageSelectors,
  statusIsNotFinalized
} from '@audius/common'
import { IconPlus } from '@audius/stems'
import { useDispatch, useSelector } from 'react-redux'

import { InfiniteCardLineup } from 'components/lineup/InfiniteCardLineup'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import EmptyTable from 'components/tracks-table/EmptyTable'
import UploadChip from 'components/upload/UploadChip'
import { useCollectionsData } from 'pages/saved-page/hooks/useCollectionsData'

import { emptyStateMessages } from '../emptyStateMessages'

import { CollectionCard } from './CollectionCard'
import styles from './SavedPage.module.css'

const { createPlaylist } = cacheCollectionsActions
const { getSelectedCategory } = savedPageSelectors

const messages = {
  emptyPlaylistsBody: 'Once you have, this is where you’ll find them!',
  createPlaylist: 'Create Playlist',
  newPlaylist: 'New Playlist'
}

export const PlaylistsTabPage = () => {
  const dispatch = useDispatch()
  const { status, hasMore, fetchMore, collections } =
    useCollectionsData('playlist')
  const emptyPlaylistsHeader = useSelector((state: CommonState) => {
    const selectedCategory = getSelectedCategory(state)
    if (selectedCategory === LibraryCategory.All) {
      return emptyStateMessages.emptyPlaylistAllHeader
    } else if (selectedCategory === LibraryCategory.Favorite) {
      return emptyStateMessages.emptyPlaylistFavoritesHeader
    } else {
      return emptyStateMessages.emptyPlaylistRepostsHeader
    }
  })

  const noResults = !statusIsNotFinalized(status) && collections?.length === 0

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
      ...collections?.map(({ playlist_id: id }, i) => {
        return <CollectionCard index={i} key={id} albumId={id} />
      })
    ]
  }, [collections, handleCreatePlaylist])

  if (statusIsNotFinalized(status)) {
    // TODO(nkang) - Confirm loading state UI
    return <LoadingSpinner className={styles.spinner} />
  }

  // TODO(nkang) - Add separate error state
  if (noResults || !collections) {
    return (
      <EmptyTable
        primaryText={emptyPlaylistsHeader}
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
