import { useState, useCallback } from 'react'

import { ResizeObserver } from '@juggle/resize-observer'
import cn from 'classnames'
import useMeasure from 'react-use-measure'

import { ReactComponent as IconCaretDownLine } from 'assets/img/iconCaretDownLine.svg'
import { ReactComponent as IconCaretUpLine } from 'assets/img/iconCaretUpLine.svg'

import styles from './ToggleCollapseButton.module.css'

export const ToggleCollapseButton = ({
  className,
  toggleButtonClassName,
  showByDefault = false,
  collapsedHeight = 0,
  showText,
  hideText,
  children
}: {
  className?: string
  toggleButtonClassName?: string
  showByDefault?: boolean
  collapsedHeight?: number
  showText: string
  hideText: string
  children: React.ReactNode
}) => {
  const [isCollapsed, setIsCollapsed] = useState(!showByDefault)
  const handleToggle = useCallback(() => {
    setIsCollapsed((isCollapsed) => !isCollapsed)
  }, [setIsCollapsed])
  const [ref, bounds] = useMeasure({
    polyfill: ResizeObserver,
    offsetSize: true
  })
  return (
    <div className={cn(className, { collapsed: isCollapsed })}>
      <div
        className={styles.toggleCollapsedContentsContainer}
        style={{ height: isCollapsed ? collapsedHeight : bounds.height }}
      >
        <div ref={ref} className={styles.toggleCollapsedContents}>
          {children}
        </div>
      </div>
      <div
        className={cn(styles.toggleCollapsedButton, toggleButtonClassName)}
        onClick={handleToggle}
      >
        <span>{isCollapsed ? showText : hideText}</span>
        {isCollapsed ? <IconCaretDownLine /> : <IconCaretUpLine />}
      </div>
    </div>
  )
}
