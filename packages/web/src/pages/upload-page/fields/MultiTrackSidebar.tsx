import { HarmonyButton } from '@audius/stems'
import cn from 'classnames'

import layoutStyles from 'components/layout/layout.module.css'

type MultiTrackSidebarProps = {
  index: number
  limit: number
  setIndex: (index: number) => void
}

export const MultiTrackSidebar = (props: MultiTrackSidebarProps) => {
  const { index, setIndex, limit } = props
  return (
    <div className={cn(layoutStyles.col, layoutStyles.gap2)}>
      Track {index + 1} of {limit}
      <div className={cn(layoutStyles.row, layoutStyles.gap2)}>
        <HarmonyButton
          text={'Prev'}
          onClick={() => setIndex(Math.max(index - 1, 0))}
          type='button'
        />
        <HarmonyButton
          text={'Next'}
          onClick={() => setIndex(Math.min(index + 1, limit - 1))}
          type='button'
        />
      </div>
    </div>
  )
}
