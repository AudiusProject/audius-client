import { useCallback } from 'react'

import { IconButton, IconCaretRight } from '@audius/stems'

import { ReactComponent as IconCopyPlain } from 'assets/img/iconCopyPlain.svg'
import { ReactComponent as IconWarning } from 'assets/img/iconWarning.svg'
import { Divider } from 'components/divider'
import Toast from 'components/toast/Toast'
import { MountPlacement } from 'components/types'

import styles from './AppDetailsPage.module.css'
import { CreateAppPageProps, CreateAppsPages } from './types'

type AppDetailsPageProps = CreateAppPageProps

const AUDIUS_SDK_LINK = 'https://docs.audius.org/developers/sdk/'

const messages = {
  secretReminder:
    "Remember to save your API Secret. You won't be able to view it again.",
  description: 'Description',
  apiKey: 'api key',
  copyApiKeyLabel: 'copy api key',
  apiSecret: 'api secret',
  copyApiSecretLabel: 'copy api secret',
  copied: 'Copied!',
  readTheDocs: 'Read the Developer Docs',
  goBack: 'Back to Your Apps'
}

export const AppDetailsPage = (props: AppDetailsPageProps) => {
  const { params, setPage } = props

  const handleGoBack = useCallback(() => {
    setPage(CreateAppsPages.YOUR_APPS)
  }, [setPage])

  if (!params) return null
  const { name, description, apiKey, apiSecret } = params

  return (
    <div className={styles.root}>
      {!apiSecret ? null : (
        <div className={styles.secretNotice}>
          <span className={styles.noticeTextRoot}>
            <IconWarning className={styles.noticeIcon} />
            <p className={styles.noticeText}>{messages.secretReminder}</p>
          </span>
          <a
            target='_blank'
            href={AUDIUS_SDK_LINK}
            className={styles.readTheDocs}
            rel='noreferrer'
          >
            {messages.readTheDocs}
          </a>
        </div>
      )}
      <h4 className={styles.appName}>{name}</h4>
      {!description ? null : (
        <span>
          <h5 className={styles.descriptionLabel}>{messages.description}</h5>
          <p className={styles.description}>{description}</p>
        </span>
      )}
      <div className={styles.keyRoot}>
        <span className={styles.keyLabel}>{messages.apiKey}</span>
        <Divider type='vertical' className={styles.keyDivider} />
        <span className={styles.keyText}>{apiKey}</span>
        <Divider type='vertical' className={styles.keyDivider} />
        <span>
          <Toast text={messages.copied} mount={MountPlacement.PARENT}>
            <IconButton
              aria-label={messages.copyApiKeyLabel}
              icon={<IconCopyPlain />}
            />
          </Toast>
        </span>
      </div>
      {!apiSecret ? null : (
        <div className={styles.keyRoot}>
          <span className={styles.keyLabel}>{messages.apiSecret}</span>
          <Divider type='vertical' className={styles.keyDivider} />
          <span className={styles.keyText}>{apiSecret}</span>
          <Divider type='vertical' className={styles.keyDivider} />
          <span>
            <Toast text={messages.copied} mount={MountPlacement.PARENT}>
              <IconButton
                aria-label={messages.copyApiKeyLabel}
                icon={<IconCopyPlain />}
              />
            </Toast>
          </span>
        </div>
      )}
      <button className={styles.goBack} onClick={handleGoBack}>
        <IconCaretRight className={styles.goBackIcon} />
        <span className={styles.goBackText}>{messages.goBack}</span>
      </button>
    </div>
  )
}
