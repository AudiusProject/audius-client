import React, { useContext, useEffect, useCallback } from 'react'

import Page from 'components/general/Page'
import NavContext, { LeftPreset } from 'containers/nav/store/context'
import GroupableList from 'components/groupable-list/GroupableList'
import Grouping from 'components/groupable-list/Grouping'
import Row from 'components/groupable-list/Row'
import { useUserProfilePicture } from 'hooks/useImageSize'

import {
  ACCOUNT_SETTINGS_PAGE,
  HISTORY_PAGE,
  ABOUT_SETTINGS_PAGE,
  NOTIFICATION_SETTINGS_PAGE
} from 'utils/route'
import AccountSettingsPage from './AccountSettingsPage'
import AboutSettingsPage from './AboutSettingsPage'
import NotificationsSettingsPage from './NotificationsSettingsPage'
import {
  Notifications,
  EmailFrequency,
  BrowserNotificationSetting,
  PushNotificationSetting,
  PushNotifications,
  Cast
} from '../../store/types'
import { getIsIOS } from 'utils/browser'

import styles from './SettingsPage.module.css'
import horizontalLogo from 'assets/img/settingsPageLogo.png'
import { SquareSizes, ProfilePictureSizes } from 'models/common/ImageSizes'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { ID } from 'models/common/Identifiers'
import Theme from 'models/Theme'
import TabSlider from 'components/data-entry/TabSlider'
import useScrollToTop from 'hooks/useScrollToTop'
import { isDarkMode } from 'utils/theme/theme'
import cn from 'classnames'
const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

export enum SubPage {
  ACCOUNT = 'account',
  NOTIFICATIONS = 'notifications',
  ABOUT = 'about'
}

const messages = {
  pageTitle: 'Settings',
  appearanceTitle: 'Appearance',
  appearance:
    'Enable dark mode or choose ‘Auto’ to change with your system settings',
  aboutTitle: 'About',
  cast: 'Select your prefered casting method.',
  title: 'Settings',
  description: 'Configure your Audius account',
  historyTitle: 'Listening History'
}

type OwnProps = {
  title: string
  description: string
  subPage?: SubPage
  userId: ID
  handle: string
  name: string
  theme: Theme | null
  toggleTheme: (theme: any) => void
  profilePictureSizes: ProfilePictureSizes | null
  goToRoute: (route: string) => void
  isVerified: boolean
  onTwitterLogin: (uuid: string, profile: object) => void
  notificationSettings: Notifications
  emailFrequency: EmailFrequency
  pushNotificationSettings: PushNotifications
  castMethod: Cast

  getNotificationSettings: () => void
  getPushNotificationSettings: () => void
  toggleBrowserPushNotificationPermissions: (
    notificationType: BrowserNotificationSetting,
    isOn: boolean
  ) => void
  togglePushNotificationSetting: (
    notificationType: PushNotificationSetting,
    isOn: boolean
  ) => void
  updateEmailFrequency: (frequency: EmailFrequency) => void
  updateCastMethod: (castMethod: Cast) => void
  recordSignOut: (callback?: () => void) => void
  onTwitterCompleteOauth: (isVerified: boolean) => void
}

export type SettingsPageProps = OwnProps

const SubPages = {
  [SubPage.ACCOUNT]: AccountSettingsPage as React.FC<SettingsPageProps>,
  [SubPage.ABOUT]: AboutSettingsPage as React.FC<SettingsPageProps>,
  [SubPage.NOTIFICATIONS]: NotificationsSettingsPage as React.FC<
    SettingsPageProps
  >
}

const SettingsPage = (props: SettingsPageProps) => {
  const {
    subPage,
    userId,
    name,
    handle,
    profilePictureSizes,
    theme,
    toggleTheme,
    goToRoute,
    castMethod,
    updateCastMethod,
    getNotificationSettings,
    getPushNotificationSettings
  } = props
  useScrollToTop()

  useEffect(() => {
    getPushNotificationSettings()
  }, [getPushNotificationSettings])

  useEffect(() => {
    getNotificationSettings()
  }, [getNotificationSettings])

  // Set Nav-Bar Menu
  const { setLeft, setCenter, setRight } = useContext(NavContext)!
  useEffect(() => {
    setLeft(subPage ? LeftPreset.BACK : LeftPreset.CLOSE_NO_ANIMATION)
    setRight(null)
    setCenter(subPage || messages.pageTitle)
  }, [setLeft, setCenter, setRight, subPage])

  const profilePicture = useUserProfilePicture(
    userId,
    profilePictureSizes,
    SquareSizes.SIZE_150_BY_150
  )

  const goToHistoryPage = useCallback(() => {
    goToRoute(HISTORY_PAGE)
  }, [goToRoute])

  const goToAccountSettingsPage = useCallback(() => {
    goToRoute(ACCOUNT_SETTINGS_PAGE)
  }, [goToRoute])

  const goToAboutSettingsPage = useCallback(() => {
    goToRoute(ABOUT_SETTINGS_PAGE)
  }, [goToRoute])

  const goToNotificationsSettingsPage = useCallback(() => {
    goToRoute(NOTIFICATION_SETTINGS_PAGE)
  }, [goToRoute])

  // Render out subPage if we're on one.
  if (subPage && subPage in SubPages) {
    const SubPageComponent = SubPages[subPage]
    return <SubPageComponent {...props} />
  }
  const isIOS = getIsIOS()
  return (
    <Page
      title={messages.title}
      description={messages.description}
      contentClassName={styles.pageContent}
      containerClassName={styles.page}
    >
      <div className={styles.bodyContainer}>
        <div className={styles.logo}>
          <img
            src={horizontalLogo}
            alt='Audius Logo'
            className={cn({ [styles.whiteTint]: isDarkMode() })}
          />
        </div>
        <GroupableList>
          <Grouping>
            <Row onClick={goToAccountSettingsPage}>
              <div className={styles.account}>
                <DynamicImage
                  image={profilePicture}
                  wrapperClassName={styles.profilePicture}
                />
                <div className={styles.info}>
                  <div className={styles.name}>{name}</div>
                  <div className={styles.handle}>{`@${handle}`}</div>
                </div>
              </div>
            </Row>
            <Row
              prefix={<i className='emoji small headphone' />}
              title={messages.historyTitle}
              onClick={goToHistoryPage}
            />
          </Grouping>
          <Grouping>
            <Row
              prefix={<i className='emoji small bell' />}
              title='Notifications'
              onClick={goToNotificationsSettingsPage}
            />
            <Row
              prefix={<i className='emoji small waning-crescent-moon' />}
              title={messages.appearanceTitle}
              body={messages.appearance}
            >
              <TabSlider
                isMobile
                fullWidth
                options={[
                  {
                    key: Theme.AUTO,
                    text: 'Auto'
                  },
                  {
                    key: Theme.DARK,
                    text: 'Dark'
                  },
                  {
                    key: Theme.DEFAULT,
                    text: 'Light'
                  }
                ]}
                selected={theme || Theme.DEFAULT}
                onSelectOption={option => toggleTheme(option)}
              />
            </Row>
            {isIOS && NATIVE_MOBILE && (
              <Row
                prefix={
                  <i className='emoji small speaker-with-three-sound-waves' />
                }
                title='Cast to Devices'
                body={messages.cast}
              >
                <TabSlider
                  isMobile
                  fullWidth
                  options={[
                    {
                      key: Cast.AIRPLAY,
                      text: 'Airplay'
                    },
                    {
                      key: Cast.CHROMECAST,
                      text: 'Chromecast'
                    }
                  ]}
                  selected={castMethod}
                  onSelectOption={(option: Cast) => {
                    updateCastMethod(option)
                  }}
                />
              </Row>
            )}
          </Grouping>
          <Grouping>
            <Row
              prefix={<i className='emoji small speech-balloon' />}
              title={messages.aboutTitle}
              onClick={goToAboutSettingsPage}
            />
          </Grouping>
        </GroupableList>
      </div>
    </Page>
  )
}

export default SettingsPage
