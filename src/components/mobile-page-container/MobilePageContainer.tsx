import React, { ReactNode, useEffect, useContext } from 'react'

import cn from 'classnames'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'

import useInstanceVar from 'common/hooks/useInstanceVar'
import { ScrollContext } from 'components/scroll-provider/ScrollProvider'
import { getHasTrack } from 'store/player/selectors'
import { AppState } from 'store/types'
import { getPathname } from 'utils/route'
import { getSafeArea, SafeAreaDirection } from 'utils/safeArea'

import styles from './MobilePageContainer.module.css'

const messages = {
  dotAudius: '• Audius',
  audius: 'Audius'
}

type OwnProps = {
  title?: string
  description?: string | null
  canonicalUrl?: string

  children: ReactNode

  // Whether or not to always render the page at full viewport height.
  // Defaults to false.
  fullHeight?: boolean

  // If full height specified, optionally pass in a classname for the
  // background div.
  backgroundClassName?: string
  containerClassName?: string

  // Has the default header and should add margins to the top for it
  hasDefaultHeader?: boolean
}

type MobilePageContainerProps = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

// Height of the bottom nav bar in px
const BOTTOM_BAR_HEIGHT = 49
// Padding between bottom of content and the
// bottom bars
const BOTTOM_PADDING = 32

// Need to account for extra spacing of the bottom
// bar on native mobile
const BOTTOM_PADDING_NATIVE_MOBILE_OFFSET = 32

// Height of the bottom play bar in px
const PLAY_BAR_HEIGHT = 48

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const safeAreaBottom = getSafeArea(SafeAreaDirection.BOTTOM)

const MobilePageContainer = ({
  title,
  description,
  canonicalUrl,
  children,
  backgroundClassName,
  containerClassName,
  fullHeight = false,
  hasDefaultHeader = false,
  hasPlayBar
}: MobilePageContainerProps) => {
  const { getScrollForRoute, setScrollForRoute } = useContext(ScrollContext)!
  const [getInitialPathname] = useInstanceVar(getPathname())
  const [getLastScroll, setLastScroll] = useInstanceVar(0)

  // On mount, restore the last scroll position
  useEffect(() => {
    const lastScrollPosition = getScrollForRoute(getInitialPathname())
    window.scrollTo(0, lastScrollPosition)
    setLastScroll(lastScrollPosition)
  }, [getScrollForRoute, getInitialPathname, setLastScroll])

  useEffect(() => {
    // Store Y scroll in instance var as we scroll
    const onScroll = () => {
      const path = getPathname()
      // We can stay mounted after switching
      // paths, so check for this case
      if (path === getInitialPathname()) {
        setLastScroll(window.scrollY)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    // Save the valid scroll on unmount
    return () => {
      setScrollForRoute(getInitialPathname(), getLastScroll())
      window.removeEventListener('scroll', onScroll)
    }
  }, [setLastScroll, getInitialPathname, setScrollForRoute, getLastScroll])

  const paddingBottom = `${
    BOTTOM_BAR_HEIGHT +
    BOTTOM_PADDING +
    safeAreaBottom +
    (hasPlayBar ? PLAY_BAR_HEIGHT : 0) +
    (NATIVE_MOBILE ? BOTTOM_PADDING_NATIVE_MOBILE_OFFSET : 0)
  }px`
  const style = { paddingBottom }

  return (
    <>
      <Helmet>
        {title ? (
          <title>{`${title} ${messages.dotAudius}`}</title>
        ) : (
          <title>{messages.audius}</title>
        )}
        {description && <meta name='description' content={description} />}
        {canonicalUrl && <link rel='canonical' href={canonicalUrl} />}
      </Helmet>
      <div
        className={cn(styles.container, {
          [containerClassName!]: !!containerClassName,
          [styles.hasDefaultHeader]: hasDefaultHeader
        })}
        style={style}
      >
        {children}
      </div>
      {fullHeight && (
        <div className={cn(styles.background, backgroundClassName)} />
      )}
    </>
  )
}

function mapStateToProps(state: AppState) {
  return {
    hasPlayBar: getHasTrack(state)
  }
}

function mapDispatchToProps() {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(MobilePageContainer)
