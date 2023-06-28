import { useMemo } from 'react'

import { Formik, useField } from 'formik'

import { ReactComponent as IconSourceFiles } from 'assets/img/iconSourceFiles.svg'
import { Divider } from 'components/divider'

import { ModalField } from './ModalField'
import styles from './SourceFilesModalForm.module.css'
import { ToggleRowField } from './ToggleRowField'

const ALLOW_DOWNLOAD = 'download.is_downloadable'
const FOLLOWER_GATED = 'download.requires_follow'

const messages = {
  title: 'Stems & Source Files',
  description:
    'Upload your stems and source files to help your fans remix your tracks!',
  previewDescription:
    'Upload stems and source files for your music, enabling others to create remixes with ease.',
  [ALLOW_DOWNLOAD]: {
    header: 'Make Full MP3 Track Available',
    description:
      'Enable to provide your fans with a copy of your track as an mp3 file'
  },
  [FOLLOWER_GATED]: {
    header: 'Available Only to Followers',
    description:
      'Make your stems and source files available only to your followers'
  }
}

export type SourceFilesFormValues = {
  [ALLOW_DOWNLOAD]: boolean
  [FOLLOWER_GATED]: boolean
}

export const SourceFilesModalForm = () => {
  // These refer to the field in the outer EditForm
  const [{ value: allowDownloadValue }, , { setValue: setAllowDownloadValue }] =
    useField(ALLOW_DOWNLOAD)
  const [{ value: followerGatedValue }, , { setValue: setFollowerGatedValue }] =
    useField(FOLLOWER_GATED)

  const initialValues = useMemo(
    () => ({
      [ALLOW_DOWNLOAD]: allowDownloadValue,
      [FOLLOWER_GATED]: followerGatedValue
    }),
    [allowDownloadValue, followerGatedValue]
  )

  const onSubmit = (values: SourceFilesFormValues) => {
    setAllowDownloadValue(values[ALLOW_DOWNLOAD])
    setFollowerGatedValue(values[FOLLOWER_GATED])
  }

  const preview = (
    <div className={styles.preview}>
      <div className={styles.header}>
        <label className={styles.title}>{messages.title}</label>
      </div>
      <div className={styles.description}>{messages.description}</div>
    </div>
  )

  return (
    <Formik<SourceFilesFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
      enableReinitialize
    >
      <ModalField
        title={messages.title}
        icon={<IconSourceFiles className={styles.titleIcon} />}
        preview={preview}
      >
        <div className={styles.fields}>
          <div>{messages.description}</div>
          <Divider />
          <ToggleRowField
            name={ALLOW_DOWNLOAD}
            header={messages[ALLOW_DOWNLOAD].header}
            description={messages[ALLOW_DOWNLOAD].description}
          />
          <Divider />
          <ToggleRowField
            name={FOLLOWER_GATED}
            header={messages[FOLLOWER_GATED].header}
            description={messages[FOLLOWER_GATED].description}
          />
        </div>
      </ModalField>
    </Formik>
  )
}
