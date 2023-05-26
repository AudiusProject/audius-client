import React, { useCallback, useRef } from 'react'

import InfiniteScroll from 'react-infinite-scroller'

import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { getScrollParent } from 'utils/scrollParent'

import CardLineup, { CardLineupProps } from './CardLineup'
import styles from './InfiniteCardLineup.module.css'

type InfiniteLoadingProps = {
  hasMore: boolean
  loadMore: () => void
}

export type InfiniteCardLineupProps = CardLineupProps & InfiniteLoadingProps

const InfiniteCardLineup = (props: InfiniteCardLineupProps) => {
  const { hasMore, loadMore, ...lineupProps } = props
  const scrollRef = useRef(null)

  const getNearestScrollParent = useCallback(() => {
    if (!scrollRef.current) {
      return null
    }
    return (
      (getScrollParent(scrollRef.current) as unknown as HTMLElement) ?? null
    )
  }, [])

  return (
    <>
      <InfiniteScroll
        hasMore={hasMore}
        getScrollParent={getNearestScrollParent}
        loadMore={loadMore}
        loader={
          <LoadingSpinner key='loading-spinner' className={styles.spinner} />
        }
        useWindow={false}
      >
        {React.createElement(CardLineup, lineupProps)}
      </InfiniteScroll>
      <div ref={scrollRef} />
    </>
  )
}

export default InfiniteCardLineup
