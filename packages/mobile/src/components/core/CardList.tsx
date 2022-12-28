import type { ComponentType } from 'react'
import { useMemo, useCallback, useRef } from 'react'

import type {
  FlatList as RNFlatList,
  FlatListProps,
  ListRenderItem
} from 'react-native'
import { View } from 'react-native'

import { useScrollToTop } from 'app/hooks/useScrollToTop'

import { EmptyTile } from './EmptyTile'
import { FlatList } from './FlatList'

export type CardListProps<ItemT> = FlatListProps<ItemT> & {
  isLoading?: boolean
  LoadingCardComponent?: ComponentType
  emptyListText?: string
  disableTopTabScroll?: boolean
}

type LoadingCard = { _loading: true }
const skeletonData: LoadingCard[] = Array(5).fill({ _loading: true })

const DefaultLoadingCard = () => null

export const CardList = <ItemT,>(props: CardListProps<ItemT>) => {
  const {
    renderItem,
    emptyListText,
    disableTopTabScroll,
    data: dataProp,
    isLoading: isLoadingProp,
    LoadingCardComponent = DefaultLoadingCard,
    ...other
  } = props

  const ref = useRef<RNFlatList>(null)

  const isLoading = isLoadingProp ?? !dataProp

  useScrollToTop(() => {
    ref.current?.scrollToOffset({
      offset: 0,
      animated: true
    })
  }, disableTopTabScroll)

  const data = useMemo(
    () => [...(dataProp ?? []), ...(isLoading ? skeletonData : [])],
    [dataProp, isLoading]
  )

  const dataLength = data?.length ?? 0

  const handleRenderItem: ListRenderItem<ItemT> = useCallback(
    (info) => {
      const { item, index } = info
      const isInLeftColumn = !(index % 2)
      const isLastRow = index + 2 > dataLength
      const style = {
        paddingTop: 12,
        paddingBottom: isLastRow ? 12 : 0,
        paddingHorizontal: 6,
        [`padding${isInLeftColumn ? 'Left' : 'Right'}`]: 12,
        width: '50%'
      }
      return (
        <View style={style}>
          {'_loading' in (item as LoadingCard) ? (
            <LoadingCardComponent />
          ) : (
            renderItem?.(info)
          )}
        </View>
      )
    },
    [renderItem, dataLength, LoadingCardComponent]
  )

  return (
    <FlatList
      ref={ref}
      data={data}
      renderItem={handleRenderItem}
      numColumns={2}
      ListEmptyComponent={
        emptyListText ? <EmptyTile message={emptyListText} /> : undefined
      }
      {...other}
    />
  )
}
