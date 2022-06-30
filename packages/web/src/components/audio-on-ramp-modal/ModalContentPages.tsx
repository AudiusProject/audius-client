import { Children, ReactChild } from 'react'

import { animated, Transition } from 'react-spring/renderprops'

import styles from './ModalContentPages.module.css'

const defaultTransitions = {
  initial: { opacity: 1, transform: 'translate3d(0%, 0, 0)' },
  enter: { opacity: 1, transform: 'translate3d(0%, 0 ,0)' }
}
const useSwipeTransitions = (direction: 'back' | 'forward') =>
  direction === 'forward'
    ? {
        ...defaultTransitions,
        // Next screen enters from right
        from: { opacity: 0, transform: 'translate3d(100%, 0, 0)' },
        // Current screen leaves on left
        leave: { opacity: 0, transform: 'translate3d(-100%, 0, 0)' }
      }
    : {
        ...defaultTransitions,
        // Previous screen enters from left
        from: { opacity: 0, transform: 'translate3d(-100%, 0, 0)' },
        // Current screen leaves on right
        leave: { opacity: 0, transform: 'translate3d(100%, 0, 0)' }
      }

export const ModalContentPages = ({
  currentPage,
  children
}: {
  currentPage: number
  children: ReactChild | ReactChild[]
}) => {
  const transitions = useSwipeTransitions('forward')
  return (
    <div className={styles.transitionContainer}>
      <Transition
        items={currentPage}
        initial={transitions.initial}
        from={transitions.from}
        enter={transitions.enter}
        leave={transitions.leave}
        unique={true}
      >
        {item => style => (
          <animated.div style={{ ...style }}>
            {Children.toArray(children)[item]}
          </animated.div>
        )}
      </Transition>
    </div>
  )
}
