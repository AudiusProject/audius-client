import React, { ReactElement } from 'react'

import { TransitionContainer } from './TransitionContainer'

const DEFAULT_DURATION = 500

type OpacityTransitionProps = {
  renderFunc: (item: any, style: object) => ReactElement
  item?: any
  duration?: number
}
export const OpacityTransition = ({
  renderFunc,
  item = null,
  duration = DEFAULT_DURATION
}: OpacityTransitionProps) => {
  return (
    <TransitionContainer
      renderFunc={renderFunc}
      item={item}
      fromStyles={{ opacity: 0 }}
      enterStyles={{ opacity: 1 }}
      leaveStyles={{ opacity: 0 }}
      config={{ duration }}
    />
  )
}
