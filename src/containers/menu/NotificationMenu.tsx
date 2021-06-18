import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import { push as pushRoute } from 'connected-react-router'
import { Dispatch } from 'redux'
import { getBrowserNotificationSettings } from 'containers/settings-page/store/selectors'
import { NotificationType } from 'containers/notification/store/types'

import {
  PopupMenu,
  PopupMenuItem,
  PopupMenuProps
} from 'components/general/PopupMenu'
import { AppState } from 'store/types'

export type OwnProps = {
  children: PopupMenuProps['renderTrigger']
  notificationId: string
  notificationType: NotificationType
  onHide: (notificationId: string) => void
  onToggleNotification?: () => void
  type: 'notification'
}

export type NotificationMenuProps = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const NotificationMenu = (props: NotificationMenuProps) => {
  const { onHide, notificationId } = props
  const onHideNotification = useCallback(() => {
    onHide(notificationId)
  }, [onHide, notificationId])

  const getMenu = () => {
    const menu: { items: PopupMenuItem[] } = {
      items: [
        {
          text: 'Hide this notification',
          onClick: onHideNotification
        }
      ]
    }
    return menu
  }

  const menu = getMenu()

  return (
    <PopupMenu
      items={menu.items}
      disabled={false}
      position='bottomRight'
      renderTrigger={props.children}
    />
  )
}

function mapStateToProps(store: AppState) {
  return {
    notificationSettings: getBrowserNotificationSettings(store)
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    goToRoute: (route: string) => dispatch(pushRoute(route))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationMenu)
