import type { Nullable, ID } from '@audius/common'

import { ReactComponent as IconRemix } from 'assets/img/iconRemixGray.svg'
import { Divider } from 'components/divider'

import { ModalField } from './ModalField'
import styles from './RemixModalField.module.css'
import { ToggleField } from './ToggleField'

const messages = {
  title: 'Remix Settings',
  description:
    'Mark your music as a remix, tag the original track, and customize remix settings.',
  hideRemix: {
    header: 'Hide Remixes of This Track',
    description:
      'Enable this option if you want to prevent remixes of your track by other artists from appearing on your track page.'
  },
  remixOf: {
    header: 'Identify as Remix',
    description:
      "Paste the original Audius track link if yours is a remix. Your remix will typically appear on the original track's page."
  }
}

export type RemixOfField = Nullable<{ tracks: { parent_track_id: ID }[] }>

const HIDE_REMIX_FIELD_NAME = 'hide_remixes'
const REMIX_OF_FIELD_NAME = 'remix_of'

export const RemixModalField = () => {
  const preview = (
    <div className={styles.preview}>
      <div className={styles.header}>
        <label className={styles.title}>{messages.title}</label>
      </div>
      <div className={styles.description}>{messages.description}</div>
    </div>
  )

  return (
    <ModalField
      title={messages.title}
      icon={<IconRemix className={styles.titleIcon} />}
      preview={preview}
    >
      <div className={styles.fields}>
        <ToggleField
          name={HIDE_REMIX_FIELD_NAME}
          header={messages.hideRemix.header}
          description={messages.hideRemix.description}
        />
        <Divider />
        <ToggleField
          name={REMIX_OF_FIELD_NAME}
          header={messages.remixOf.header}
          description={messages.remixOf.description}
        />
      </div>
    </ModalField>
  )
}
