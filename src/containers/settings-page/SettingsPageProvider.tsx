import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { AppState } from 'store/types'
import { Dispatch } from 'redux'
import { push as pushRoute } from 'connected-react-router'

import * as accountActions from 'store/account/reducer'

import {
  getAccountVerified,
  getAccountIsCreator,
  getAccountProfilePictureSizes,
  getUserId,
  getUserHandle,
  getUserName
} from 'store/account/selectors'
import Theme from 'models/Theme'
import { getTheme } from 'store/application/ui/theme/selectors'
import { setTheme } from 'store/application/ui/theme/actions'
import { open as openBrowserPushPermissionModal } from 'store/application/ui/browserPushPermissionConfirmation/actions'
import {
  getBrowserNotificationSettings,
  getPushNotificationSettings,
  getEmailFrequency,
  getCastMethod
} from './store/selectors'
import * as settingPageActions from './store/actions'
import {
  BrowserNotificationSetting,
  EmailFrequency,
  PushNotificationSetting,
  Cast
} from './store/types'

import { SettingsPageProps as DesktopSettingsPageProps } from './components/desktop/SettingsPage'
import {
  SettingsPageProps as MobileSettingsPageProps,
  SubPage
} from './components/mobile/SettingsPage'
import { make, TrackEvent } from 'store/analytics/actions'
import { Name } from 'services/analytics'
import {
  isPushManagerAvailable,
  isSafariPushAvailable,
  getSafariPushBrowser,
  subscribeSafariPushBrowser,
  Permission
} from 'utils/browserNotifications'
import { withClassNullGuard } from 'utils/withNullGuard'

const messages = {
  title: 'Settings',
  description: 'Configure your Audius account'
}

type OwnProps = {
  children:
    | React.ComponentType<MobileSettingsPageProps>
    | React.ComponentType<DesktopSettingsPageProps>
  subPage?: SubPage
}

type SettingsPageProps = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

type SettingsPageState = {
  darkModeSetting: boolean | null
}

const mapper = (props: SettingsPageProps) => {
  const { name, handle, userId } = props
  if (handle && name && userId !== null)
    return { ...props, name, handle, userId }
}

class SettingsPage extends PureComponent<
  NonNullable<ReturnType<typeof mapper>>,
  SettingsPageState
> {
  state = {
    darkModeSetting: null
  }

  toggleTheme = (option: Theme) => {
    this.props.recordThemeChange(option)
    this.props.setTheme(option)
  }

  toggleBrowserPushNotificationPermissions = (
    notificationType: BrowserNotificationSetting,
    isOn: boolean
  ) => {
    if (!isOn) {
      // if turning off, set all settings values to false
      this.props.setBrowserNotificationEnabled(false)
    } else if (
      this.props.notificationSettings.permission === Permission.GRANTED
    ) {
      // Permission is already granted, don't need to popup confirmation modal.
      this.props.setBrowserNotificationEnabled(true)
      this.props.setBrowserNotificationSettingsOn()
    } else {
      if (isPushManagerAvailable) {
        this.props.subscribeBrowserPushNotifications()
      } else if (isSafariPushAvailable) {
        // NOTE: The call call request browser permission must be done directly
        // b/c safari requires the user action to trigger the premission request
        const safariPermission = getSafariPushBrowser()
        if (safariPermission.permission === Permission.GRANTED) {
          this.props.subscribeBrowserPushNotifications()
        } else {
          const getSafariPermission = async () => {
            const permissionData = await subscribeSafariPushBrowser()
            if (
              permissionData &&
              permissionData.permission === Permission.GRANTED
            ) {
              this.props.subscribeBrowserPushNotifications()
            } else if (
              permissionData &&
              permissionData.permission === Permission.DENIED
            ) {
              this.props.setBrowserNotificationPermission(Permission.DENIED)
            }
          }
          getSafariPermission()
        }
      }
    }
  }

  render() {
    const {
      subPage,
      isVerified,
      isCreator,
      userId,
      handle,
      name,
      profilePictureSizes,
      theme,
      notificationSettings,
      emailFrequency,
      pushNotificationSettings,
      getNotificationSettings,
      getPushNotificationSettings,
      castMethod,
      onTwitterLogin,
      toggleNotificationSetting,
      togglePushNotificationSetting,
      updateEmailFrequency,
      updateCastMethod,
      goToRoute,
      onTwitterClick,
      onTwitterCompleteOauth,
      recordSignOut,
      recordAccountRecovery,
      recordDownloadDesktopApp
    } = this.props

    const childProps = {
      title: messages.title,
      description: messages.description,
      isVerified,
      isCreator,
      userId,
      handle,
      name,
      profilePictureSizes,
      theme,
      toggleTheme: this.toggleTheme,
      onTwitterClick,
      onTwitterCompleteOauth,
      recordSignOut,
      recordAccountRecovery,
      notificationSettings,
      emailFrequency,
      pushNotificationSettings,
      getNotificationSettings,
      getPushNotificationSettings,
      onTwitterLogin,
      toggleNotificationSetting,
      toggleBrowserPushNotificationPermissions: this
        .toggleBrowserPushNotificationPermissions,
      togglePushNotificationSetting,
      updateEmailFrequency,
      recordDownloadDesktopApp,
      goToRoute
    }

    const mobileProps = {
      subPage,
      castMethod,
      updateCastMethod
    }

    return <this.props.children {...childProps} {...mobileProps} />
  }
}

function mapStateToProps(state: AppState) {
  return {
    handle: getUserHandle(state),
    name: getUserName(state),
    isVerified: getAccountVerified(state),
    isCreator: getAccountIsCreator(state),
    userId: getUserId(state),
    profilePictureSizes: getAccountProfilePictureSizes(state),
    theme: getTheme(state),
    emailFrequency: getEmailFrequency(state),
    notificationSettings: getBrowserNotificationSettings(state),
    pushNotificationSettings: getPushNotificationSettings(state),
    castMethod: getCastMethod(state)
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    setTheme: (theme: any) => dispatch(setTheme(theme)),
    getNotificationSettings: () =>
      dispatch(settingPageActions.getNotificationSettings()),
    getPushNotificationSettings: () =>
      dispatch(settingPageActions.getPushNotificationSettings()),
    onTwitterLogin: (uuid: string, profile: object) =>
      dispatch(accountActions.twitterLogin({ uuid, profile })),
    subscribeBrowserPushNotifications: () =>
      dispatch(accountActions.subscribeBrowserPushNotifications()),
    setBrowserNotificationSettingsOn: () =>
      dispatch(settingPageActions.setBrowserNotificationSettingsOn()),
    setNotificationSettings: (settings: object) =>
      dispatch(settingPageActions.setNotificationSettings(settings)),
    setBrowserNotificationEnabled: (enabled: boolean) =>
      dispatch(settingPageActions.setBrowserNotificationEnabled(enabled)),
    setBrowserNotificationPermission: (permission: Permission) =>
      dispatch(settingPageActions.setBrowserNotificationPermission(permission)),
    openBrowserPushPermissionModal: () =>
      dispatch(openBrowserPushPermissionModal()),
    toggleNotificationSetting: (
      notificationType: BrowserNotificationSetting,
      isOn: boolean
    ) =>
      dispatch(
        settingPageActions.toggleNotificationSetting(notificationType, isOn)
      ),
    togglePushNotificationSetting: (
      notificationType: PushNotificationSetting,
      isOn: boolean
    ) =>
      dispatch(
        settingPageActions.togglePushNotificationSetting(notificationType, isOn)
      ),
    updateEmailFrequency: (frequency: EmailFrequency) =>
      dispatch(settingPageActions.updateEmailFrequency(frequency)),
    goToRoute: (route: string) => dispatch(pushRoute(route)),
    updateCastMethod: (castMethod: Cast) =>
      dispatch(settingPageActions.updateCastMethod(castMethod)),
    recordThemeChange: (themeSettings: string) => {
      const theme =
        themeSettings === Theme.DEFAULT
          ? 'light'
          : themeSettings.toLocaleLowerCase()
      const trackEvent: TrackEvent = make(Name.SETTINGS_CHANGE_THEME, {
        mode: theme as 'dark' | 'light' | 'auto'
      })
      dispatch(trackEvent)
    },
    recordSignOut: (callback?: () => void) => {
      const trackEvent: TrackEvent = make(Name.SETTINGS_LOG_OUT, { callback })
      dispatch(trackEvent)
    },
    recordAccountRecovery: () => {
      const trackEvent: TrackEvent = make(
        Name.SETTINGS_RESEND_ACCOUNT_RECOVERY,
        {}
      )
      dispatch(trackEvent)
    },
    onTwitterClick: () => {
      const trackEvent: TrackEvent = make(Name.SETTINGS_START_TWITTER_OAUTH, {})
      dispatch(trackEvent)
    },
    onTwitterCompleteOauth: (isVerified: boolean) => {
      const trackEvent: TrackEvent = make(
        Name.SETTINGS_COMPLETE_TWITTER_OAUTH,
        { is_verified: isVerified }
      )
      dispatch(trackEvent)
    },
    recordDownloadDesktopApp: () => {
      dispatch(
        make(Name.ACCOUNT_HEALTH_DOWNLOAD_DESKTOP, { source: 'settings' })
      )
    }
  }
}

const g = withClassNullGuard(mapper)

export default connect(mapStateToProps, mapDispatchToProps)(g(SettingsPage))
