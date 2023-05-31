import { useContext, createContext } from 'react'

import cn from 'classnames'

import { usePortal } from 'hooks/usePortal'

import styles from './HeaderGutter.module.css'

const BACKGROUND_ELEMENT_HEIGHT_PX = 161
export const BACKGROUND_ELEMENT_ID = 'headerPadding'

export const DesktopHeaderContext = createContext<{ offsetForBanner: boolean }>(
  {
    offsetForBanner: false
  }
)

type HeaderGutterProps = {
  isChromeOrSafari?: boolean
  headerContainerRef?: React.RefObject<HTMLDivElement>
  scrollBarWidth?: number
  className?: string
}

/**
 * Hacky div that's Portaled out to document.body
 * with a low z-index to allow scroll bars to visually "float on top" of sticky headers.
 */
export const HeaderGutter = ({
  isChromeOrSafari,
  headerContainerRef,
  scrollBarWidth,
  className
}: HeaderGutterProps) => {
  const Portal = usePortal({ container: document.body })
  const { offsetForBanner } = useContext(DesktopHeaderContext)

  // Not all browsers support backdrop-filter: blur (at least at time this was intially implemented)
  // so treat it with a different gradient in those cases.
  const gradient = isChromeOrSafari
    ? 'linear-gradient(180deg, var(--page-header-gradient-1) 0%, var(--page-header-gradient-1) 20%, var(--page-header-gradient-2) 65%)'
    : 'linear-gradient(180deg, var(--page-header-gradient-1) 0%, var(--page-header-gradient-1) 40%, var(--page-header-gradient-2-alt) 85%)'

  const containerHeight =
    headerContainerRef && headerContainerRef.current
      ? headerContainerRef.current.offsetHeight
      : BACKGROUND_ELEMENT_HEIGHT_PX

  const style = {
    width: `${scrollBarWidth}px`,
    height: `${containerHeight}px`,
    background: `rgba(0, 0, 0, 0) ${gradient} repeat scroll 0% 0%`
  }

  if (
    isChromeOrSafari === undefined ||
    headerContainerRef === undefined ||
    scrollBarWidth === undefined
  ) {
    return null
  }

  return (
    <Portal>
      <div
        id={BACKGROUND_ELEMENT_ID}
        style={style}
        className={cn(
          styles.gutter,
          { [styles.bannerMargin]: offsetForBanner },
          className
        )}
      />
    </Portal>
  )
}
