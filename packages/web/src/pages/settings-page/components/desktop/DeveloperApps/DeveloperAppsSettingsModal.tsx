import { useCallback, useEffect, useState } from 'react'

import {
  Modal,
  ModalHeader,
  ModalProps,
  ModalTitle,
  ModalContentPages
} from '@audius/stems'

import { ReactComponent as IconEmbed } from 'assets/img/iconEmbed.svg'

import { AppDetailsPage } from './AppDetailsPage'
import { CreateNewAppPage } from './CreateNewAppPage'
import { YourAppsPage } from './YourAppsPage'
import { CreateAppsPages } from './types'

const messages = {
  title: 'Your Apps',
  description: 'Create your own apps using the Audius API.',
  yourAppsTitle: 'Your Apps',
  newAppButton: 'New'
}

type DeveloperAppsSettingsModalProps = Omit<ModalProps, 'children'>

const getCurrentPage = (currentPage: CreateAppsPages) => {
  switch (currentPage) {
    case CreateAppsPages.YOUR_APPS:
      return 0
    case CreateAppsPages.NEW_APP:
      return 1
    case CreateAppsPages.APP_DETAILS:
      return 2
  }
}

export const DeveloperAppsSettingsModal = (
  props: DeveloperAppsSettingsModalProps
) => {
  const { isOpen } = props
  const [currentPage, setCurrentPage] = useState(CreateAppsPages.APP_DETAILS)
  const [currentPageParams, setCurrentPageParams] = useState<any>({
    name: 'New App Test 1',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    apiKey:
      '021671c830081f1dc6277a739ddf3a72f1ae197dd7ed219e2341c36c73c90ce8c6',
    apiSecret:
      '021671c830081f1dc6277a739ddf3a72f1ae197dd7ed219e2341c36c73c90ce8c6'
  })

  const handleSetPage = useCallback(
    (page: CreateAppsPages, params?: Record<string, unknown>) => {
      setCurrentPage(page)
      if (params) {
        setCurrentPageParams(params)
      }
    },
    []
  )

  useEffect(() => {
    if (!isOpen) {
      setCurrentPage(CreateAppsPages.YOUR_APPS)
    }
  }, [isOpen])

  return (
    <>
      <Modal {...props} size='small'>
        <ModalHeader>
          <ModalTitle title={messages.title} icon={<IconEmbed />} />
        </ModalHeader>
        <ModalContentPages currentPage={getCurrentPage(currentPage)}>
          <YourAppsPage setPage={handleSetPage} />
          <CreateNewAppPage setPage={handleSetPage} />
          <AppDetailsPage setPage={handleSetPage} params={currentPageParams} />
        </ModalContentPages>
      </Modal>
    </>
  )
}
