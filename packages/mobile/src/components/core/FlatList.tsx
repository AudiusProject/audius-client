import { forwardRef, MutableRefObject, useRef } from 'react'

import {
  Animated,
  FlatList as RNFlatList,
  FlatListProps as RNFlatListProps,
  View
} from 'react-native'

import { PullToRefresh, useOverflowHandlers } from './PullToRefresh'

type FlatListProps = RNFlatListProps<any> & {
  scrollAnim?: Animated.Value
  refreshIndicatorTopOffset?: number
}

/**
 * FlatList with custom PullToRefresh
 */
export const FlatList = forwardRef<RNFlatList, FlatListProps>(function FlatList(
  {
    refreshing,
    onRefresh,
    refreshIndicatorTopOffset,
    scrollAnim: providedScrollAnim,
    ...other
  },
  ref: MutableRefObject<RNFlatList<any> | null>
) {
  const scrollRef = useRef<Animated.FlatList>(null)

  const {
    isRefreshing,
    isRefreshDisabled,
    handleRefresh,
    scrollAnim,
    onScroll,
    onScrollBeginDrag,
    onScrollEndDrag
  } = useOverflowHandlers({
    isRefreshing: refreshing,
    scrollResponder: ref?.current || scrollRef.current,
    onRefresh,
    scrollAnim: providedScrollAnim
  })

  return (
    <View>
      <PullToRefresh
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        scrollAnim={scrollAnim}
        isRefreshDisabled={isRefreshDisabled}
        topOffset={refreshIndicatorTopOffset}
      />
      <Animated.FlatList
        scrollToOverflowEnabled
        ref={ref || scrollRef}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        {...other}
      />
    </View>
  )
})
