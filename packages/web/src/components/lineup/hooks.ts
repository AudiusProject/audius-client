import { useMemo } from 'react'

import { LineupState } from '@audius/common'
import { useDispatch } from 'react-redux'

import { makeGetLineupMetadatas } from 'common/store/lineup/selectors'
import { makeGetCurrent } from 'common/store/queue/selectors'
import { LineupVariant } from 'components/lineup/types'
import { getBuffering, getPlaying } from 'store/player/selectors'
import { AppState } from 'store/types'
import { isMobile } from 'utils/clientUtil'
import { useSelector } from 'utils/reducer'

type LineupActions = any

type useLineupPropsProps = {
  getLineupSelector: (state: AppState) => LineupState<{}>
  actions: LineupActions
  variant?: LineupVariant
  numPlaylistSkeletonRows?: number
  scrollParent?: HTMLElement
  rankIconCount?: number
  isTrending?: boolean
  isOrdered?: boolean
}

/**
 * Returns props for a Lineup component.
 * Requires at least a selector and actions
 * See example usage in `TrendingPlaylistPage`
 * */
export const useLineupProps = ({
  getLineupSelector,
  actions,
  variant,
  numPlaylistSkeletonRows,
  scrollParent,
  rankIconCount,
  isTrending,
  isOrdered
}: useLineupPropsProps) => {
  const dispatch = useDispatch()

  // Create memoized selectors
  const getPlaylistTrendingLineup = useMemo(
    () => makeGetLineupMetadatas(getLineupSelector),
    [getLineupSelector]
  )

  const getCurrentQueueItem = useMemo(() => makeGetCurrent(), [])

  // Selectors
  const currentQueueItem = useSelector(getCurrentQueueItem)
  const lineup = useSelector(getPlaylistTrendingLineup)
  const isPlaying = useSelector(getPlaying)
  const isBuffering = useSelector(getBuffering)

  // Actions
  const pauseTrack = () => dispatch(actions.pause())
  const playTrack = (uid: string) => dispatch(actions.play(uid))
  const loadMore = (offset: number, limit: number, overwrite: boolean) => {
    dispatch(actions.fetchLineupMetadatas(offset, limit, overwrite))
  }

  return {
    lineup,
    selfLoad: true,
    variant: variant ?? LineupVariant.MAIN,
    playingUid: currentQueueItem?.uid,
    playingSource: currentQueueItem?.source,
    playingTrackId: currentQueueItem?.track?.track_id ?? null,
    playing: isPlaying,
    buffering: isBuffering,
    pauseTrack,
    playTrack,
    actions,
    loadMore,
    numPlaylistSkeletonRows,
    scrollParent,
    isMobile: isMobile(),
    rankIconCount,
    isTrending,
    ordered: isOrdered
  }
}
