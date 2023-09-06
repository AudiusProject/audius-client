import { AccountCollection } from 'store/account'
import { EnhancedCollection } from 'store/cache/collections/selectors'

type FilterCollectionsOptions = {
  filterText?: string
}

export const isAccountCollection = (
  collection: AccountCollection | EnhancedCollection
): collection is AccountCollection => {
  return (collection as AccountCollection).name !== undefined
}

export function filterCollections<
  T extends AccountCollection | EnhancedCollection
>(collections: T[], { filterText = '' }: FilterCollectionsOptions): T[] {
  return collections.filter((item: AccountCollection | EnhancedCollection) => {
    const matchesOwnerName =
      item.user.handle.toLowerCase().indexOf(filterText.toLowerCase()) > -1
    let matchesPlaylistName: boolean

    if (isAccountCollection(item)) {
      matchesPlaylistName =
        item.name.toLowerCase().indexOf(filterText.toLowerCase()) > -1
    } else {
      matchesPlaylistName =
        item.playlist_name.toLowerCase().indexOf(filterText.toLowerCase()) > -1
    }
    return matchesPlaylistName || matchesOwnerName
  })
}
