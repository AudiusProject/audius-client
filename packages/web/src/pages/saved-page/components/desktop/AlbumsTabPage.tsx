import { useMemo } from 'react'

import { statusIsNotFinalized } from '@audius/common'

import { InfiniteCardLineup } from 'components/lineup/InfiniteCardLineup'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import EmptyTable from 'components/tracks-table/EmptyTable'
import { useGoToRoute } from 'hooks/useGoToRoute'
import { useCollectionsData } from 'pages/saved-page/hooks/useCollectionsData'

import { CollectionCard } from './CollectionCard'
import styles from './SavedPage.module.css'

const messages = {
  emptyAlbumsHeader: 'You haven’t favorited any albums yet.',
  emptyAlbumsBody: 'Once you have, this is where you’ll find them!',
  goToTrending: 'Go to Trending'
}

export const AlbumsTabPage = () => {
  const goToRoute = useGoToRoute()
  const {
    status,
    hasMore,
    fetchMore,
    collections: albums
  } = useCollectionsData('album')

  const noResults = !statusIsNotFinalized(status) && albums?.length === 0

  const cards = useMemo(() => {
    return albums?.map(({ playlist_id }, i) => {
      return (
        <CollectionCard index={i} key={playlist_id} albumId={playlist_id} />
      )
    })
  }, [albums])

  if (statusIsNotFinalized(status)) {
    // TODO(nkang) - Confirm loading state UI
    return <LoadingSpinner className={styles.spinner} />
  }

  // TODO(nkang) - Add separate error state
  if (noResults || !albums) {
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
