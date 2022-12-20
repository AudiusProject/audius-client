import { useCallback } from 'react'

import { Genre, trendingPageSelectors, modalsActions } from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import { ScreenHeaderButton } from 'app/components/core'

import { MODAL_NAME } from './TrendingFilterDrawer'
const { getTrendingGenre } = trendingPageSelectors
const { setVisibility } = modalsActions

export const TrendingFilterButton = () => {
  const dispatchWeb = useDispatch()
  const trendingGenre = useSelector(getTrendingGenre) ?? Genre.ALL

  const handlePress = useCallback(() => {
    dispatchWeb(setVisibility({ modal: MODAL_NAME, visible: true }))
  }, [dispatchWeb])

  return <ScreenHeaderButton title={trendingGenre} onPress={handlePress} />
}
