import React, { useCallback, useEffect, useContext } from 'react'

import { Button, ButtonType, Modal } from '@audius/stems'
import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import Status from 'common/models/Status'
import ActionDrawer from 'components/action-drawer/ActionDrawer'
import MobilePageContainer from 'components/general/MobilePageContainer'
import Page from 'components/general/Page'
import Header from 'components/general/header/desktop/Header'
import { useMobileHeader } from 'components/general/header/mobile/hooks'
import LoadingSpinnerFullPage from 'components/loading-spinner-full-page/LoadingSpinnerFullPage'
import NavContext, {
  LeftPreset,
  RightPreset
} from 'containers/nav/store/context'
import { isMobile } from 'utils/clientUtil'
import { BASE_URL, DEACTIVATE_PAGE } from 'utils/route'

import styles from './DeactivateAccountPage.module.css'
import { getDeactivateAccountStatus } from './store/selectors'
import { deactivateAccount } from './store/slice'

const IS_NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const messages = {
  title: 'Deactivate',
  description: 'Deactivate your account',
  header: 'Are you sure you want to deactivate your account?',
  listItems: [
    "There's no going back.",
    'This will remove all of your tracks, albums and playlists.',
    'You will not be able to re-register with the same email or handle'
  ],
  confirmTitle: 'Deactivate Account',
  confirm: 'Are you sure? This cannot be undone.',
  buttonDeactivate: 'Deactivate',
  buttonSafety: 'Take me back to safety',
  buttonGoBack: 'Go Back'
}

type DeactivateAccountPageProps = {
  children: React.ReactNode
  isConfirmationVisible: boolean
  isLoading: boolean
  openConfirmation: () => void
  onConfirm: () => void
  closeConfirmation: () => void
  onDrawerSelection: (rowNum: number) => void
}

type DeactivateAccountPageContentsProps = {
  isMobile?: boolean
  isLoading?: boolean
  openConfirmation: () => void
}

type DeactivateAccountModalProps = {
  isVisible: boolean
  isLoading: boolean
  onClose: () => void
  onConfirm: () => void
}

export const DeactivateAcccountPageContents = ({
  openConfirmation,
  isMobile,
  isLoading
}: DeactivateAccountPageContentsProps) => {
  return (
    <div className={cn(styles.tile, { [styles.mobile]: isMobile })}>
      <div className={styles.header}>{messages.header}</div>
      <ul className={styles.list}>
        {messages.listItems.map((message, i) => (
          <li key={i}>{message}</li>
        ))}
      </ul>
      {isLoading && isMobile && <LoadingSpinnerFullPage />}
      <div className={styles.buttons}>
        <Button
          className={cn(styles.button, {
            [styles.buttonDanger]: !(isLoading && isMobile)
          })}
          text={messages.buttonDeactivate}
          type={
            isLoading && isMobile ? ButtonType.DISABLED : ButtonType.PRIMARY_ALT
          }
          onClick={openConfirmation}
        />
        <Button
          className={styles.button}
          text={messages.buttonSafety}
          type={
            isLoading && isMobile ? ButtonType.DISABLED : ButtonType.PRIMARY_ALT
          }
        />
      </div>
    </div>
  )
}

export const DeactivateAccountConfirmationModal = ({
  isVisible,
  onClose,
  isLoading,
  onConfirm
}: DeactivateAccountModalProps) => {
  return (
    <Modal
      bodyClassName={styles.confirmModal}
      isOpen={isVisible}
      onClose={onClose}
      showDismissButton
      showTitleHeader
      title={messages.confirmTitle}
    >
      <div className={styles.container}>
        {isLoading ? (
          <LoadingSpinnerFullPage />
        ) : (
          <div className={styles.confirmText}>{messages.confirm}</div>
        )}
        <div className={styles.buttons}>
          <Button
            className={cn(styles.button, {
              [styles.buttonDanger]: !isLoading
            })}
            isDisabled={isLoading}
            onClick={onConfirm}
            textClassName={styles.deleteButtonText}
            text={messages.buttonDeactivate}
            type={isLoading ? ButtonType.DISABLED : ButtonType.PRIMARY_ALT}
          />
          <Button
            className={styles.button}
            isDisabled={isLoading}
            onClick={onClose}
            text={messages.buttonGoBack}
            type={isLoading ? ButtonType.DISABLED : ButtonType.PRIMARY_ALT}
          />
        </div>
      </div>
    </Modal>
  )
}

export const DeactivateAccountPageDesktop = ({
  children,
  isConfirmationVisible,
  isLoading,
  onConfirm,
  closeConfirmation
}: DeactivateAccountPageProps) => {
  return (
    <Page
      title={messages.title}
      description={messages.description}
      header={<Header primary={messages.title} />}
    >
      {children}
      <DeactivateAccountConfirmationModal
        isVisible={isConfirmationVisible}
        onClose={closeConfirmation}
        onConfirm={onConfirm}
        isLoading={isLoading}
      />
    </Page>
  )
}

const useMobileNavContext = () => {
  useMobileHeader({ title: messages.title })
  const { setLeft, setRight } = useContext(NavContext)!
  useEffect(() => {
    setLeft(LeftPreset.CLOSE)
    setRight(RightPreset.SEARCH)
  }, [setLeft, setRight])
}

const DrawerTitle = () => (
  <div className={styles.drawerTitle}>
    <div className={styles.drawerTitleHeader}>{messages.confirmTitle}</div>
    <div className={styles.drawerTitleWarning}>{messages.confirm}</div>
  </div>
)

export const DeactivateAccountPageMobile = ({
  children,
  isConfirmationVisible,
  onDrawerSelection,
  closeConfirmation
}: DeactivateAccountPageProps) => {
  useMobileNavContext()
  return (
    <MobilePageContainer
      title={messages.title}
      description={messages.description}
      canonicalUrl={`${BASE_URL}${DEACTIVATE_PAGE}`}
      hasDefaultHeader
    >
      {children}
      {!IS_NATIVE_MOBILE && (
        <ActionDrawer
          isOpen={isConfirmationVisible}
          onClose={closeConfirmation}
          actions={[
            { text: messages.buttonDeactivate, isDestructive: true },
            { text: messages.buttonGoBack }
          ]}
          didSelectRow={onDrawerSelection}
          renderTitle={DrawerTitle}
        />
      )}
    </MobilePageContainer>
  )
}

export const DeactivateAccountPage = () => {
  const Page = isMobile()
    ? DeactivateAccountPageMobile
    : DeactivateAccountPageDesktop

  const dispatch = useDispatch()

  const deactivateAccountStatus = useSelector(getDeactivateAccountStatus)
  const [isConfirmationVisible, setIsConfirmationVisible] = useModalState(
    'DeactivateAccountConfirmation'
  )
  const isDeactivating = deactivateAccountStatus === Status.LOADING

  const openConfirmation = useCallback(() => {
    setIsConfirmationVisible(true)
  }, [setIsConfirmationVisible])
  const closeConfirmation = useCallback(() => {
    if (!isDeactivating) {
      setIsConfirmationVisible(false)
    }
  }, [isDeactivating, setIsConfirmationVisible])
  const onConfirm = useCallback(() => {
    dispatch(deactivateAccount())
  }, [dispatch])
  const onDrawerSelection = useCallback(
    (rowNumber: number) => {
      if (rowNumber === 0) {
        onConfirm()
        closeConfirmation()
      } else {
        closeConfirmation()
      }
    },
    [onConfirm, closeConfirmation]
  )

  return (
    <Page
      openConfirmation={openConfirmation}
      isConfirmationVisible={isConfirmationVisible}
      closeConfirmation={closeConfirmation}
      onDrawerSelection={onDrawerSelection}
      onConfirm={onConfirm}
      isLoading={isDeactivating}
    >
      <DeactivateAcccountPageContents
        isMobile={isMobile()}
        isLoading={isDeactivating}
        openConfirmation={openConfirmation}
      />
    </Page>
  )
}
