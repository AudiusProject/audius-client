import React from 'react'

import FeedFilter from 'common/models/FeedFilter'
import ActionDrawer from 'components/action-drawer/ActionDrawer'

import styles from './FeedFilterModal.module.css'

interface FeedFilterModalProps {
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

const FeedFilterModal = ({
  isOpen,
  didSelectFilter,
  onClose
}: FeedFilterModalProps) => {
  const onClickFilter = (filter: FeedFilter) => {
    didSelectFilter(filter)
    onClose()
  }

  return (
    <ActionDrawer
      renderTitle={() => <div className={styles.title}>{messages.title}</div>}
      actions={[
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
      ]}
      onClose={onClose}
      isOpen={isOpen}
    />
  )
}

export default FeedFilterModal
