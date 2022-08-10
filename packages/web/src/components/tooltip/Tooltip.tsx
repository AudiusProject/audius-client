import { useState, useCallback, useRef, CSSProperties } from 'react'

import AntTooltip from 'antd/lib/tooltip'
import cn from 'classnames'

import { getCurrentThemeColors } from 'utils/theme/theme'

import styles from './Tooltip.module.css'
import { TooltipProps } from './types'

const themeColors = getCurrentThemeColors()

export const Tooltip = ({
  children,
  className = '',
  color = themeColors['--secondary-transparent'],
  disabled = false,
  mount = 'parent',
  getPopupContainer,
  mouseEnterDelay = 0.5,
  mouseLeaveDelay = 0,
  placement = 'top',
  shouldDismissOnClick = true,
  shouldWrapContent = true,
  text = ''
}: TooltipProps) => {
  // Keep track of a hidden state ourselves so we can dismiss the tooltip on click
  const [isHidden, setIsHidden] = useState(false)

  // Keep track of whether we are hovering over the tooltip to know when to
  // allow it to become visible again
  const mousedOver = useRef(false)

  const onClick = useCallback(() => {
    if (shouldDismissOnClick) {
      setIsHidden(true)
    }
  }, [shouldDismissOnClick, setIsHidden])

  const onMouseOut = useCallback(() => {
    mousedOver.current = false
    setIsHidden(false)
  }, [mousedOver, setIsHidden])

  const onMouseOver = useCallback(() => {
    mousedOver.current = true
  }, [mousedOver])

  const onVisibleChange = useCallback(
    (visible: boolean) => {
      // Reset the hidden override if we are becoming invisible or
      // the mouse is not overtop the tooltip
      if (!visible || !mousedOver.current) {
        setIsHidden(false)
      }
    },
    [setIsHidden]
  )

  let popupContainer
  const page = document.getElementById('page')
  switch (mount) {
    case 'parent':
      popupContainer = (triggerNode: HTMLElement) =>
        triggerNode.parentNode ?? page
      break
    case 'page': {
      if (page) popupContainer = () => page
      break
    }
  }

  // Keep track of visibility to override antd's native visibility.
  // Use an empty object when visible as to not trigger the antd component to update
  const visibleProps = disabled || isHidden ? { visible: false } : {}
  // Use a css property so that when we change visibility on click the tooltip
  // immediately disappears instead of animating out.
  const overlayStyle = {
    visibility: isHidden ? 'hidden' : 'visible'
  } as CSSProperties

  return (
    <AntTooltip
      {...visibleProps}
      overlayStyle={overlayStyle}
      placement={placement}
      title={text}
      color={color}
      // @ts-ignore
      getPopupContainer={getPopupContainer || popupContainer}
      overlayClassName={cn(styles.tooltip, className, {
        [styles.nonWrappingTooltip]: !shouldWrapContent
      })}
      mouseEnterDelay={mouseEnterDelay}
      mouseLeaveDelay={mouseLeaveDelay}
      onClick={onClick}
      onMouseOut={onMouseOut}
      onMouseOver={onMouseOver}
      onVisibleChange={onVisibleChange}
    >
      {children}
    </AntTooltip>
  )
}

export default Tooltip
