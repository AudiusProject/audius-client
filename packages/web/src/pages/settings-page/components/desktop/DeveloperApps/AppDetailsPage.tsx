import { DeveloperApp } from '@audius/common'
import { IconButton } from '@audius/stems'

import { ReactComponent as IconCopyPlain } from 'assets/img/iconCopyPlain.svg'
import { ReactComponent as IconWarning } from 'assets/img/iconWarning.svg'
import { Divider } from 'components/divider'

import styles from './AppDetailsPage.module.css'
import { CreateAppPageProps } from './types'

type AppDetailsParams = DeveloperApp

type AppDetailsPageProps = CreateAppPageProps<AppDetailsParams>

const audiusSdkLink = 'https://docs.audius.org/developers/sdk/'

const messages = {
  secretReminder:
    "Remember to save your API Secret. You won't be able to view it again.",
  description: 'Description',
  apiKey: 'api key',
  copyApiKeyLabel: 'copy api key',
  apiSecret: 'api secret',
  copyApiSecretLabel: 'copy api secret',
  readTheDocs: 'Read the Developer Docs'
}

export const AppDetailsPage = (props: AppDetailsPageProps) => {
  const { params } = props
  if (!params) return null
  const { name, description, apiKey, apiSecret } = params

  return (
    <div className={styles.root}>
      {apiSecret ? (
        <div className={styles.secretNotice}>
          <span className={styles.noticeTextRoot}>
            <IconWarning className={styles.noticeIcon} />
            <p className={styles.noticeText}>{messages.secretReminder}</p>
          </span>
          <a
            target='_blank'
            href={audiusSdkLink}
            className={styles.readTheDocs}
            rel='noreferrer'
          >
            {messages.readTheDocs}
          </a>
        </div>
      ) : null}
      <h4 className={styles.appName}>{name}</h4>
      <span>
        <h5 className={styles.descriptionLabel}>{messages.description}</h5>
        <p className={styles.description}>{description}</p>
      </span>

      <div className={styles.keyRoot}>
        <span className={styles.keyLabel}>{messages.apiKey}</span>
        <Divider type='vertical' className={styles.keyDivider} />
        <span className={styles.keyText}>{apiKey}</span>
        <Divider type='vertical' className={styles.keyDivider} />
        <IconButton
          className={styles.copyKey}
          aria-label={messages.copyApiKeyLabel}
          icon={<IconCopyPlain />}
        />
      </div>

      {apiSecret ? (
        <div className={styles.keyRoot}>
          <span className={styles.keyLabel}>{messages.apiSecret}</span>
          <Divider type='vertical' className={styles.keyDivider} />
          <span className={styles.keyText}>{apiSecret}</span>
          <Divider type='vertical' className={styles.keyDivider} />
          <IconButton
            className={styles.copyKey}
            aria-label={messages.copyApiKeyLabel}
            icon={<IconCopyPlain />}
          />
        </div>
      ) : null}
    </div>
  )
}
