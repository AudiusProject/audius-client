import React from 'react'

import { ResizeObserver } from '@juggle/resize-observer'
import cn from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import useMeasure from 'react-use-measure'

import styles from './Scrollbar.module.css'
import { ScrollbarProps } from './types'

/**
 * A container with a custom scrollbar, meant to be used for small scrolling areas within a
 * page/view (e.g. a scrolling navigation bar), not the entire page itself.
 * `Scrollbar` uses react-perfect-scrollbar (https://www.npmjs.com/package/react-perfect-scrollbar)
 * under the hood. For advanced use cases, refer to the documentation.
 */
export const Scrollbar = ({
  children,
  className,
  ...props
}: ScrollbarProps) => {
  const [ref] = useMeasure({ polyfill: ResizeObserver })
  return (
    <PerfectScrollbar {...props} className={cn(styles.scrollbar, className)}>
      <div ref={ref}>{children}</div>
    </PerfectScrollbar>
  )
}
