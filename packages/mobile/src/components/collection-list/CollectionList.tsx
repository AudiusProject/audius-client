import { UserCollection } from 'audius-client/src/common/models/Collection'

import { CollectionCard } from 'app/components/collection-card'
import { CardList, CardListProps } from 'app/components/core'

type ListProps = Omit<
  CardListProps<UserCollection>,
  'data' | 'renderItem' | 'ListEmptyComponent'
>

type CollectionListProps = {
  collection: UserCollection[]
  fromPage?: string

  /**
   * Whether or not the lineup appears inside a collapsible scene.
   * See `useCollapsibleScene` from 'react-native-collapsible-tab-view'
   */
  isCollapsible?: boolean

  /**
   * The scene name if the lineup appears in a collapsible scene.
   */
  collapsibleSceneName?: string
} & ListProps

export const CollectionList = (props: CollectionListProps) => {
  const {
    collection,
    fromPage,
    isCollapsible,
    collapsibleSceneName,
    ...other
  } = props
  return (
    <CardList
      isCollapsible={isCollapsible}
      collapsibleSceneName={collapsibleSceneName}
      data={collection}
      renderItem={({ item }) => (
        <CollectionCard collection={item} fromPage={fromPage} />
      )}
      {...other}
    />
  )
}
