import { Component } from 'react'

import {
  ID,
  ProfilePictureSizes,
  OS,
  Theme,
  InstagramProfile,
  TwitterProfile,
  Notifications,
  BrowserNotificationSetting,
  EmailFrequency,
  TikTokProfile
} from '@audius/common'
import {
  Modal,
  Button,
  ButtonType,
  IconMail,
  IconNotification,
  IconSignOut,
  IconVerified,
  IconDownload,
  IconMood,
  IconSettings
} from '@audius/stems'
import cn from 'classnames'

import { ChangePasswordModal } from 'components/change-password/ChangePasswordModal'
import ConfirmationBox from 'components/confirmation-box/ConfirmationBox'
import TabSlider from 'components/data-entry/TabSlider'
import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'
import { SelectedServices } from 'components/service-selection'
import Toast from 'components/toast/Toast'
import { ComponentPlacement } from 'components/types'
import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
import DownloadApp from 'services/download-app/DownloadApp'
import { isMobile, isElectron, getOS } from 'utils/clientUtil'
import { COPYRIGHT_TEXT } from 'utils/copyright'

import packageInfo from '../../../../../package.json'

import NotificationSettings from './NotificationSettings'
import SettingsCard from './SettingsCard'
import styles from './SettingsPage.module.css'
import VerificationModal from './VerificationModal'

const { version } = packageInfo

const SIGN_OUT_MODAL_TEXT = `
  Are you sure you want to sign out?
  Double check that you have an account recovery email just in case (resend from your settings).
`

const EMAIL_TOAST_TIMEOUT = 2000

const messages = {
  version: 'Audius Version',
  copyright: COPYRIGHT_TEXT,
  emailSent: 'Email Sent!',
  emailNotSent: 'Something broke! Please try again!',
  darkModeOn: 'Dark',
  darkModeOff: 'Light',
  darkModeAuto: 'Auto',
  matrixMode: '🕳 🐇 Matrix',
  changePassword: 'Change Password',
  changePasswordDescription: 'Change the password to your Audius account',
  signOut: 'Sign Out',

  appearanceCardTitle: 'Appearance',
  inboxSettingsCardTitle: 'Inbox Settings',
  notificationsCardTitle: 'Configure Notifications',
  accountRecoveryCardTitle: 'Resend Recovery Email',
  changePasswordCardTitle: 'Change Password',
  verificationCardTitle: 'Verification',
  desktopAppCardTitle: 'Download the Desktop App',

  appearanceCardDescription:
    'Enable dark mode or choose ‘Auto’ to change with your system settings',
  inboxSettingsCardDescription: '',
  notificationsCardDescription: 'Review your notification preferences',
  accountRecoveryCardDescription:
    'Resend your password reset email and store it safely. This email is the only way to recover your account if you forget your password.',
  changePasswordCardDescription: 'Change the password to your Audius account',
  verificationCardDescription:
    'Verify your Audius profile by linking a verified account from Twitter, Instagram, or TikTok.',
  desktopAppCardDescription:
    'For the best experience, we reccomend downloading the Audius Desktop App',

  inboxSettingsButtonText: 'Inbox Settings',
  notificationsButtonText: 'Configure Notifications',
  accountRecoveryButtonText: 'Resend Email',
  changePasswordButtonText: 'Change Password',
  verificationButtonText: 'Get Verified!',
  desktopAppButtonText: 'Get The App'
}

type OwnProps = {
  title: string
  description: string
  isVerified: boolean
  userId: ID
  handle: string
  name: string
  profilePictureSizes: ProfilePictureSizes | null
  theme: any
  toggleTheme: (theme: any) => void
  goToRoute: (route: string) => void
  notificationSettings: Notifications
  getNotificationSettings: () => void
  onInstagramLogin: (uuid: string, profile: InstagramProfile) => void
  onTwitterLogin: (uuid: string, profile: TwitterProfile) => void
  onTikTokLogin: (uuid: string, profile: TikTokProfile) => void
  toggleBrowserPushNotificationPermissions: (
    notificationType: BrowserNotificationSetting,
    isOn: boolean
  ) => void
  toggleNotificationSetting: (
    notificationType: BrowserNotificationSetting,
    isOn: boolean
  ) => void
  emailFrequency: EmailFrequency
  updateEmailFrequency: (frequency: EmailFrequency) => void
  recordSignOut: (callback?: () => void) => void
  recordAccountRecovery: () => void
  recordDownloadDesktopApp: () => void
  showMatrix: boolean
  signOut: () => void
}

export type SettingsPageProps = OwnProps

type SettingsPageState = {
  showNotificationSettings: boolean
  showModalSignOut: boolean
  emailToastText: string
  showChangePasswordModal: boolean
}

class SettingsPage extends Component<SettingsPageProps, SettingsPageState> {
  state = {
    showNotificationSettings: false,
    showModalSignOut: false,
    showChangePasswordModal: false,
    emailToastText: ''
  }

  componentDidMount() {
    this.props.getNotificationSettings()
  }

  showModalSignOut = () => {
    this.setState({ showModalSignOut: true })
  }

  closeModalSignOut = () => {
    this.setState({ showModalSignOut: false })
  }

  showNotificationSettings = () => {
    this.setState({ showNotificationSettings: true })
  }

  closeNotificationSettings = () => {
    this.setState({ showNotificationSettings: false })
  }

  onSignOut = () => {
    const { recordSignOut, signOut } = this.props

    recordSignOut(signOut)
  }

  showEmailToast = async () => {
    try {
      await audiusBackendInstance.sendRecoveryEmail()
      this.setState({ emailToastText: messages.emailSent })
      this.props.recordAccountRecovery()
    } catch (e) {
      this.setState({ emailToastText: messages.emailNotSent })
    }
    setTimeout(() => {
      this.setState({ emailToastText: '' })
    }, EMAIL_TOAST_TIMEOUT)
  }

  downloadDesktopApp = () => {
    DownloadApp.start(getOS() || OS.WIN)
    this.props.recordDownloadDesktopApp()
  }

  showChangePasswordModal = () => {
    this.setState({ showChangePasswordModal: true })
  }

  closeChangePasswordModal = () => {
    this.setState({ showChangePasswordModal: false })
  }

  renderThemeCard() {
    const { showMatrix, theme, toggleTheme } = this.props

    const options = [
      {
        key: Theme.AUTO,
        text: messages.darkModeAuto
      },
      {
        key: Theme.DEFAULT,
        text: messages.darkModeOff
      },
      {
        key: Theme.DARK,
        text: messages.darkModeOn
      }
    ]
    if (showMatrix) {
      options.push({ key: Theme.MATRIX, text: messages.matrixMode })
    }

    return (
      <SettingsCard
        icon={<IconMood />}
        title={messages.appearanceCardTitle}
        description={messages.appearanceCardDescription}
      >
        <TabSlider
          className={styles.cardSlider}
          options={options}
          selected={theme || Theme.DEFAULT}
          onSelectOption={(option) => toggleTheme(option)}
          key={`tab-slider-${options.length}`}
        />
      </SettingsCard>
    )
  }

  render() {
    const {
      title,
      description,
      isVerified,
      userId,
      handle,
      name,
      profilePictureSizes,
      onInstagramLogin,
      goToRoute,
      onTwitterLogin,
      onTikTokLogin,
      notificationSettings,
      emailFrequency,
      toggleBrowserPushNotificationPermissions,
      toggleNotificationSetting,
      updateEmailFrequency
    } = this.props

    const header = <Header primary={'Settings'} />

    return (
      <Page
        title={title}
        description={description}
        containerClassName={styles.settingsPageContainer}
        contentClassName={styles.settingsPageContent}
        header={header}
      >
        <div className={styles.settings}>
          {this.renderThemeCard()}
          <SettingsCard
            icon={<IconVerified />}
            title={messages.verificationCardTitle}
            description={messages.verificationCardDescription}
          >
            <VerificationModal
              userId={userId}
              handle={handle}
              name={name}
              profilePictureSizes={profilePictureSizes}
              goToRoute={goToRoute}
              isVerified={isVerified}
              onInstagramLogin={onInstagramLogin}
              onTwitterLogin={onTwitterLogin}
              onTikTokLogin={onTikTokLogin}
            />
          </SettingsCard>
          <SettingsCard
            icon={<IconNotification />}
            title={messages.notificationsCardTitle}
            description={messages.notificationsCardDescription}
          >
            <Button
              onClick={this.showNotificationSettings}
              className={styles.cardButton}
              textClassName={styles.settingButtonText}
              type={ButtonType.COMMON_ALT}
              text={messages.notificationsButtonText}
            />
          </SettingsCard>
          <SettingsCard
            icon={<IconMail />}
            title={messages.accountRecoveryCardTitle}
            description={messages.accountRecoveryCardDescription}
          >
            <Toast
              tooltipClassName={styles.cardToast}
              text={this.state.emailToastText}
              open={!!this.state.emailToastText}
              placement={ComponentPlacement.BOTTOM}
              fillParent={false}
            >
              <Button
                onClick={this.showEmailToast}
                className={styles.cardButton}
                textClassName={styles.settingButtonText}
                type={ButtonType.COMMON_ALT}
                text={messages.accountRecoveryButtonText}
              />
            </Toast>
          </SettingsCard>
          {!isMobile() && !isElectron() && (
            <SettingsCard
              icon={<IconDownload />}
              title={messages.desktopAppCardTitle}
              description={messages.desktopAppCardDescription}
            >
              <Button
                onClick={this.downloadDesktopApp}
                className={styles.cardButton}
                textClassName={styles.settingButtonText}
                type={ButtonType.COMMON_ALT}
                text={messages.desktopAppButtonText}
              />
            </SettingsCard>
          )}
          <SettingsCard
            icon={<IconSettings />}
            title={messages.changePassword}
            description={messages.changePasswordDescription}
          >
            <Button
              onClick={this.showChangePasswordModal}
              className={cn(styles.cardButton, styles.changePasswordButton)}
              textClassName={styles.settingButtonText}
              type={ButtonType.COMMON_ALT}
              text={messages.changePasswordButtonText}
            />
          </SettingsCard>
        </div>
        <div className={styles.version}>
          <Button
            className={styles.signOutButton}
            textClassName={styles.signOutButtonText}
            iconClassName={styles.signOutButtonIcon}
            type={ButtonType.COMMON_ALT}
            text={messages.signOut}
            name='sign-out'
            leftIcon={<IconSignOut />}
            onClick={this.showModalSignOut}
          />
          <span>{`${messages.version} ${version}`}</span>
          <span>{messages.copyright}</span>
        </div>
        <div className={styles.selectedServices}>
          <SelectedServices variant='lighter' />
        </div>
        <Modal
          title={
            <>
              Hold Up! <i className='emoji waving-hand-sign' />
            </>
          }
          isOpen={this.state.showModalSignOut}
          onClose={this.closeModalSignOut}
          showTitleHeader
          showDismissButton
          bodyClassName={styles.modalBody}
          headerContainerClassName={styles.modalHeader}
          titleClassName={styles.modalTitle}
        >
          <ConfirmationBox
            text={SIGN_OUT_MODAL_TEXT}
            rightText='NEVERMIND'
            leftText='SIGN OUT'
            leftName='confirm-sign-out'
            rightClick={this.closeModalSignOut}
            leftClick={this.onSignOut}
          />
        </Modal>
        <ChangePasswordModal
          showModal={this.state.showChangePasswordModal}
          onClose={this.closeChangePasswordModal}
        />
        <NotificationSettings
          isOpen={this.state.showNotificationSettings}
          toggleBrowserPushNotificationPermissions={
            toggleBrowserPushNotificationPermissions
          }
          toggleNotificationSetting={toggleNotificationSetting}
          updateEmailFrequency={updateEmailFrequency}
          settings={notificationSettings}
          emailFrequency={emailFrequency}
          onClose={this.closeNotificationSettings}
        />
      </Page>
    )
  }
}

export default SettingsPage
