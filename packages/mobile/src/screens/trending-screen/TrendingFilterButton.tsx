import { useCallback } from 'react'

import { Genre } from '@audius/common'
import { trendingPageSelectors } from '@audius/common'
const { getTrendingGenre } = trendingPageSelectors
import { modalsActions } from '@audius/common'
const { setVisibility } = modalsActions

import { HeaderButton } from 'app/components/header'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { MODAL_NAME } from './TrendingFilterDrawer'

export const TrendingFilterButton = () => {
  const dispatchWeb = useDispatchWeb()
  const trendingGenre = useSelectorWeb(getTrendingGenre) ?? Genre.ALL

  const handlePress = useCallback(() => {
    dispatchWeb(setVisibility({ modal: MODAL_NAME, visible: true }))
  }, [dispatchWeb])

  return <HeaderButton title={trendingGenre} onPress={handlePress} />
}
