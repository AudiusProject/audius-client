import React, { useCallback, useMemo } from 'react'

import FeedFilter from 'common/models/FeedFilter'
import ActionDrawer from 'components/action-drawer/ActionDrawer'

import styles from './FeedFilterModal.module.css'

interface FeedFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  didSelectFilter: (filter: FeedFilter) => void
}

const messages = {
  title: 'What do you want to see in your feed?',
  filterAll: 'All Posts',
  filterOriginal: 'Original Posts',
  filterReposts: 'Reposts'
}

const FeedFilterDrawer = ({
  isOpen,
  didSelectFilter,
  onClose
}: FeedFilterDrawerProps) => {
  const onClickFilter = useCallback(
    (filter: FeedFilter) => {
      didSelectFilter(filter)
      onClose()
    },
    [onClose, didSelectFilter]
  )

  const actions = useMemo(
    () => [
      {
        text: messages.filterAll,
        onClick: () => onClickFilter(FeedFilter.ALL)
      },
      {
        text: messages.filterOriginal,
        onClick: () => onClickFilter(FeedFilter.ORIGINAL)
      },
      {
        text: messages.filterReposts,
        onClick: () => onClickFilter(FeedFilter.REPOST)
      }
    ],
    [onClickFilter]
  )

  return (
    <ActionDrawer
      renderTitle={() => <div className={styles.title}>{messages.title}</div>}
      actions={actions}
      onClose={onClose}
      isOpen={isOpen}
    />
  )
}

export default FeedFilterDrawer
