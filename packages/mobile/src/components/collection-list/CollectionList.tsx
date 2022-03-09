import { UserCollection } from 'audius-client/src/common/models/Collection'

import { CollectionCard } from 'app/components/collection-card'
import { CardList, CardListProps } from 'app/components/core'

type ListProps = Omit<
  CardListProps<UserCollection>,
  'data' | 'renderItem' | 'ListEmptyComponent'
>

type CollectionListProps = {
  collection: UserCollection[]
} & ListProps

export const CollectionList = (props: CollectionListProps) => {
  const { collection, ...other } = props
  return (
    <CardList
      data={collection}
      renderItem={({ item }) => <CollectionCard collection={item} />}
      {...other}
    />
  )
}
