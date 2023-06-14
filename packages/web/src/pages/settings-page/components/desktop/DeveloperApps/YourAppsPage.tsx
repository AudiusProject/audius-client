import { accountSelectors, useGetDeveloperApps } from '@audius/common'
import {
  Button,
  ButtonSize,
  ButtonType,
  IconPlus,
  ModalContentText
} from '@audius/stems'

import { Divider } from 'components/divider'
import { useSelector } from 'utils/reducer'

import { DeveloperAppListItem } from './DeveloperAppListItem'
import styles from './DeveloperApps.module.css'
import { CreateAppPageProps, CreateAppsPages } from './types'

const { getUserId } = accountSelectors

const messages = {
  title: 'Your Apps',
  description: 'Create your own apps using the Audius API.',
  yourAppsTitle: 'Your Apps',
  newAppButton: 'New'
}

type YourAppsPageProps = CreateAppPageProps

export const YourAppsPage = (props: YourAppsPageProps) => {
  const { setPage } = props
  const userId = useSelector(getUserId)
  const { data } = useGetDeveloperApps(
    { id: userId as number },
    { disabled: !userId }
  )

  return (
    <div className={styles.content}>
      <ModalContentText>{messages.description}</ModalContentText>
      <div>
        <div className={styles.appsHeader}>
          <h4 className={styles.appsHeaderText}>{messages.yourAppsTitle}</h4>
          <Button
            type={ButtonType.COMMON_ALT}
            size={ButtonSize.SMALL}
            className={styles.newAppButton}
            textClassName={styles.newAppButtonText}
            iconClassName={styles.newAppButtonIcon}
            text={messages.newAppButton}
            leftIcon={<IconPlus />}
            onClick={() => setPage(CreateAppsPages.NEW_APP)}
          />
        </div>
        <Divider />
        <ol>
          {data?.apps.map((app, index) => (
            <DeveloperAppListItem
              key={app.name}
              index={index + 1}
              appName={app.name}
            />
          ))}
        </ol>
      </div>
    </div>
  )
}
