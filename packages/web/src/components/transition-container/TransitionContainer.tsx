import React, { ReactElement } from 'react'

import { animated, Transition } from 'react-spring/renderprops'

type TransitionContainerProps<T> = {
  renderFunc: (item: any, style: object) => ReactElement
  item: T
  fromStyles: object
  enterStyles: object
  leaveStyles: object
  config: object
  additionalStyles?: object
}

export function TransitionContainer<T>({
  renderFunc,
  item,
  fromStyles,
  enterStyles,
  leaveStyles,
  config,
  additionalStyles
}: TransitionContainerProps<T>) {
  return (
    <Transition
      items={item}
      unique
      from={fromStyles}
      enter={enterStyles}
      leave={leaveStyles}
      config={config}
    >
      {item => style => (
        <animated.div style={{ ...style, ...additionalStyles }}>
          {renderFunc(item, style)}
        </animated.div>
      )}
    </Transition>
  )
}
