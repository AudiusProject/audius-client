import {
  accountSelectors,
  statusIsNotFinalized,
  useGetLibraryAlbums,
  useAllPaginatedQuery
} from '@audius/common'
import { useSelector } from 'react-redux'

import { InfiniteCardLineup } from 'components/lineup/InfiniteCardLineup'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import EmptyTable from 'components/tracks-table/EmptyTable'
import { useGoToRoute } from 'hooks/useGoToRoute'

import { CollectionCard } from './CollectionCard'
import styles from './SavedPage.module.css'

const { getUserId } = accountSelectors
const messages = {
  emptyAlbumsHeader: 'You haven’t favorited any albums yet.',
  emptyAlbumsBody: 'Once you have, this is where you’ll find them!',
  goToTrending: 'Go to Trending'
}

export const AlbumsTabPage = () => {
  const goToRoute = useGoToRoute()
  const currentUserId = useSelector(getUserId)

  const {
    data: fetchedAlbums,
    status,
    hasMore,
    loadMore: fetchMore
  } = useAllPaginatedQuery(
    useGetLibraryAlbums,
    {
      userId: currentUserId!
    },
    {
      pageSize: 20,
      disabled: currentUserId == null
    }
  )

  const noFetchedResults =
    !statusIsNotFinalized(status) && fetchedAlbums?.length === 0

  const cards = fetchedAlbums?.map(({ playlist_id }, i) => {
    return <CollectionCard index={i} key={playlist_id} albumId={playlist_id} />
  })

  if (statusIsNotFinalized(status)) {
    // TODO(nkang) - Confirm loading state UI
    return <LoadingSpinner className={styles.spinner} />
  }

  // TODO(nkang) - Add separate error state
  if (noFetchedResults || !fetchedAlbums) {
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
