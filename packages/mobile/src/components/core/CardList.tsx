import type { ComponentType } from 'react'
import { useMemo, useCallback, useRef } from 'react'

import type {
  FlatListProps,
  ListRenderItem,
  ListRenderItemInfo
} from 'react-native'
import { View } from 'react-native'

import { useScrollToTop } from 'app/hooks/useScrollToTop'
import { makeStyles } from 'app/styles'

import type { FlatListT } from './FlatList'
import { FlatList } from './FlatList'

export type CardListProps<ItemT> = Omit<FlatListProps<ItemT>, 'data'> & {
  data: ItemT[] | null | undefined
  disableTopTabScroll?: boolean
  FlatListComponent?: ComponentType<FlatListProps<ItemT | LoadingCard>>
  isLoading?: boolean
  LoadingCardComponent?: ComponentType
  // If total count is known, use this to aid in rendering the right number
  // of skeletons
  totalCount?: number
}

type LoadingCard = { _loading: true }

const getSkeletonData = (skeletonCount = 6): LoadingCard[] => {
  return Array(Math.min(skeletonCount, 6)).fill({ _loading: true })
}

const DefaultLoadingCard = () => null

const useStyles = makeStyles(({ spacing }) => ({
  cardList: {
    padding: spacing(3),
    paddingRight: 0
  },
  card: {
    width: '50%',
    paddingRight: spacing(3),
    paddingBottom: spacing(3)
  }
}))

export function CardList<ItemT extends {}>(props: CardListProps<ItemT>) {
  const {
    renderItem,
    disableTopTabScroll,
    data: dataProp,
    isLoading: isLoadingProp,
    LoadingCardComponent = DefaultLoadingCard,
    FlatListComponent = FlatList,
    totalCount,
    ...other
  } = props

  const styles = useStyles()
  const ref = useRef<FlatListT<ItemT>>(null)
  const isLoading = isLoadingProp ?? !dataProp

  useScrollToTop(() => {
    ref.current?.scrollToOffset({
      offset: 0,
      animated: true
    })
  }, disableTopTabScroll)

  const data = useMemo(() => {
    const skeletonData = isLoading ? getSkeletonData(totalCount) : []
    return [...(dataProp ?? []), ...skeletonData]
  }, [dataProp, isLoading, totalCount])

  const handleRenderItem: ListRenderItem<ItemT | LoadingCard> = useCallback(
    (info) => {
      const itemElement =
        '_loading' in info.item ? (
          <LoadingCardComponent />
        ) : (
          renderItem?.(info as ListRenderItemInfo<ItemT>) ?? null
        )

      return <View style={styles.card}>{itemElement}</View>
    },
    [LoadingCardComponent, renderItem, styles.card]
  )

  return (
    <FlatListComponent
      style={styles.cardList}
      ref={ref}
      data={data}
      renderItem={handleRenderItem}
      numColumns={2}
      {...other}
    />
  )
}
