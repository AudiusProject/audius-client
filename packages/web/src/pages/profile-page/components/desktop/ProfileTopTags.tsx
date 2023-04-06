import { useCallback, useEffect, MouseEvent } from 'react'

import {
  Name,
  Status,
  profilePageActions,
  profilePageSelectors
} from '@audius/common'
import { IconTrending, Tag } from '@audius/stems'
import { useDispatch, useSelector } from 'react-redux'

import { make, useRecord } from 'common/store/analytics/actions'
import { useProfileRoute } from 'pages/profile-page/useProfileRoute'
import { AppState } from 'store/types'
import { searchResultsPage } from 'utils/route'

import styles from './ProfileTopTags.module.css'
const { getTopTags, getTopTagsStatus } = profilePageSelectors
const { fetchTopTags } = profilePageActions

const messages = {
  topTags: 'Top Tags'
}

const MOST_USED_TAGS_COUNT = 5

export const ProfileTopTags = () => {
  const dispatch = useDispatch()
  const user = useProfileRoute()
  const handle = user?.handle
  const userId = user?.user_id

  const topTagsStatus = useSelector((state: AppState) => {
    if (!handle) return Status.IDLE
    return getTopTagsStatus(state, handle)
  })

  const topTags = useSelector((state: AppState) => {
    if (handle) {
      return getTopTags(state, handle)?.slice(0, MOST_USED_TAGS_COUNT)
    }
  })

  useEffect(() => {
    if (handle && userId) {
      dispatch(fetchTopTags(handle, userId))
    }
  }, [dispatch, handle, userId])

  const record = useRecord()
  const handleClickTag = useCallback(
    (_e: MouseEvent, tag: string) => {
      record(make(Name.TAG_CLICKING, { tag, source: 'profile page' }))
    },
    [record]
  )

  if (topTagsStatus === Status.SUCCESS && topTags && topTags.length > 0) {
    return (
      <div className={styles.tags}>
        <div className={styles.tagsTitleContainer}>
          <IconTrending className={styles.topTagsIcon} />
          <span className={styles.tagsTitleText}>{messages.topTags}</span>
          <span className={styles.tagsLine} />
        </div>
        <div className={styles.tagsContent}>
          {topTags.map((tag) => (
            <Tag
              to={searchResultsPage(`#${tag}`)}
              onClick={handleClickTag}
              key={tag}
              className={styles.tag}
              textLabel={tag}
            />
          ))}
        </div>
      </div>
    )
  }

  return null
}
