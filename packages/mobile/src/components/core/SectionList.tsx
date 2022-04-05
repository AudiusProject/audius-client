import { forwardRef, MutableRefObject } from 'react'

import {
  Animated,
  DefaultSectionT,
  SectionList as RNSectionList,
  SectionListProps as RNSectionListProps,
  View
} from 'react-native'

import { PullToRefresh, useOverflowHandlers } from './PullToRefresh'

type SectionListProps = RNSectionListProps<any>

/**
 * SectionList with custom PullToRefresh
 */
export const SectionList = forwardRef<RNSectionList, SectionListProps>(
  function SectionList(
    { refreshing, onRefresh, ...other },
    ref: MutableRefObject<RNSectionList<any, DefaultSectionT> | null>
  ) {
    const scrollResponder = ref.current?.getScrollResponder()
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
      scrollResponder,
      onRefresh
    })

    return (
      <View>
        <PullToRefresh
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          scrollAnim={scrollAnim}
          isRefreshDisabled={isRefreshDisabled}
        />
        <Animated.SectionList
          scrollToOverflowEnabled
          ref={ref}
          onScroll={onScroll}
          onScrollBeginDrag={onScrollBeginDrag}
          onScrollEndDrag={onScrollEndDrag}
          {...other}
        />
      </View>
    )
  }
)
