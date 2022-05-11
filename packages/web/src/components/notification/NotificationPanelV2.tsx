import React, { useRef, useCallback, useEffect } from 'react'

import { Popup, PopupPosition } from '@audius/stems'
import cn from 'classnames'
import InfiniteScroll from 'react-infinite-scroller'
import Lottie from 'react-lottie'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParam } from 'react-use'
import SimpleBar from 'simplebar-react'

import loadingSpinner from 'assets/animations/loadingSpinner.json'
import Status from 'common/models/Status'
import {
  fetchNotifications,
  markAllAsRead,
  setNotificationModal,
  toggleNotificationPanel
} from 'common/store/notifications/actions'
import {
  getModalNotification,
  getNotificationHasLoaded,
  getNotificationHasMore,
  getNotificationModalIsOpen,
  getNotificationPanelIsOpen,
  getNotificationStatus,
  makeGetAllNotifications
} from 'common/store/notifications/selectors'
import { Notification as Notifications } from 'common/store/notifications/types'
import { Nullable } from 'common/utils/typeUtils'
import zIndex from 'utils/zIndex'

import styles from './NotificationPanel.module.css'
import { Notification } from './Notifications'
import EmptyNotifications from './components/EmptyNotifications'
import NotificationModal from './components/desktop/NotificationModal'

const getNotifications = makeGetAllNotifications()

const simpleBarId = 'notificationsPanelScroll'

const getScrollParent = () => {
  const simpleBarElement = window.document.getElementById(simpleBarId)
  return simpleBarElement || null
}

const messages = {
  title: 'Notifications',
  markAllRead: 'Mark All Read',
  empty: 'There’s Nothing Here Yet!',
  readMore: 'Read More'
}

type OwnProps = {
  anchorRef: React.MutableRefObject<HTMLElement>
}

type NotificationPanelProps = OwnProps

// The threshold of distance from the bottom of the scroll container in the
// notification panel before requesting `loadMore` for more notifications
const SCROLL_THRESHOLD = 1000

/** The notification panel displays the list of notifications w/ a
 * summary of each notification and a link to open the full
 * notification in a modal  */
export const NotificationPanel = ({ anchorRef }: NotificationPanelProps) => {
  const panelIsOpen = useSelector(getNotificationPanelIsOpen)
  const notifications = useSelector(getNotifications)
  const hasLoaded = useSelector(getNotificationHasLoaded)
  const hasMore = useSelector(getNotificationHasMore)
  const status = useSelector(getNotificationStatus)
  const isNotificationModalOpen = useSelector(getNotificationModalIsOpen)
  const modalNotification = useSelector(getModalNotification)

  const panelRef = useRef<Nullable<HTMLDivElement>>(null)
  const scrollRef = useRef<Nullable<HTMLDivElement>>(null)

  const dispatch = useDispatch()
  const openNotifications = useSearchParam('openNotifications')

  const setSimpleBarRef = useCallback(el => {
    el.recalculate()
  }, [])

  const handleCloseNotificationModal = useCallback(() => {
    dispatch(setNotificationModal(false))
  }, [dispatch])

  const handleMarkAllAsRead = useCallback(() => {
    dispatch(markAllAsRead())
  }, [dispatch])

  const loadMore = useCallback(() => {
    if (!hasMore || status === Status.LOADING || status === Status.ERROR) return
    dispatch(fetchNotifications())
  }, [hasMore, status, dispatch])

  useEffect(() => {
    if (openNotifications) {
      dispatch(toggleNotificationPanel())
    }
  }, [openNotifications, dispatch])

  console.log(
    !hasMore || status === Status.LOADING || status === Status.ERROR,
    { hasMore, status }
  )

  return (
    <Popup
      anchorRef={anchorRef}
      className={styles.popup}
      isVisible={panelIsOpen}
      checkIfClickInside={(target: EventTarget) => {
        if (target instanceof Element) {
          return [anchorRef?.current].some(r => r?.contains(target))
        }
        return false
      }}
      onClose={toggleNotificationPanel}
      position={PopupPosition.BOTTOM_RIGHT}
      wrapperClassName={styles.popupWrapper}
      zIndex={zIndex.NAVIGATOR_POPUP}
    >
      <>
        <div className={styles.panelContainer} ref={panelRef}>
          <div className={styles.header}>
            <div className={styles.title}> {messages.title} </div>
            <div className={styles.markAllRead} onClick={handleMarkAllAsRead}>
              {messages.markAllRead}
            </div>
          </div>
          {!hasLoaded ? (
            <div className={cn(styles.notLoaded, styles.spinnerContainer)}>
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: loadingSpinner
                }}
              />
            </div>
          ) : null}
          {hasLoaded && notifications.length > 0 ? (
            <SimpleBar
              className={styles.scrollContent}
              ref={setSimpleBarRef}
              scrollableNodeProps={{ id: simpleBarId, ref: scrollRef }}
            >
              <InfiniteScroll
                pageStart={0}
                loadMore={loadMore}
                hasMore={hasMore}
                useWindow={false}
                initialLoad={false}
                threshold={SCROLL_THRESHOLD}
                getScrollParent={getScrollParent}
              >
                <div className={styles.content}>
                  {notifications
                    .filter(({ isHidden }: any) => !isHidden)
                    .map((notification: Notifications) => {
                      return (
                        <Notification
                          key={notification.id}
                          notification={notification}
                        />
                      )
                    })}
                  {status === Status.LOADING ? (
                    <div className={styles.spinnerContainer} key={'loading'}>
                      <Lottie
                        options={{
                          loop: true,
                          autoplay: true,
                          animationData: loadingSpinner
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              </InfiniteScroll>
            </SimpleBar>
          ) : null}
          {hasLoaded && notifications.length === 0 ? (
            <EmptyNotifications />
          ) : null}
        </div>
        <NotificationModal
          isOpen={isNotificationModalOpen}
          notification={modalNotification}
          onClose={handleCloseNotificationModal}
        />
      </>
    </Popup>
  )
}
