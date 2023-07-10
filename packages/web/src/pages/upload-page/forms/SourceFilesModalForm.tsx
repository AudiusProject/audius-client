import { useCallback, useMemo } from 'react'

import { StemCategory, StemUpload, removeNullable } from '@audius/common'
import { Formik, useField } from 'formik'
import { get, set } from 'lodash'

import { ReactComponent as IconSourceFiles } from 'assets/img/iconSourceFiles.svg'
import { Divider } from 'components/divider'

import { ModalField } from '../fields/ModalField'
import {
  SourceFilesView,
  dropdownRows as stemCategories
} from '../fields/SourceFilesView'
import { ToggleRowField } from '../fields/ToggleRowField'
import { processFiles } from '../store/utils/processFiles'

import styles from './SourceFilesModalForm.module.css'

const ALLOW_DOWNLOAD = 'download.is_downloadable'
const FOLLOWER_GATED = 'download.requires_follow'
const STEMS = 'stems'

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
  [STEMS]: StemUpload[]
}

/**
 * This is a subform that expects to exist within a parent TrackEdit form.
 * The useField calls reference the outer form's fields which much match the name constants.
 */
export const SourceFilesModalForm = () => {
  // These refer to the field in the outer EditForm
  const [{ value: allowDownloadValue }, , { setValue: setAllowDownloadValue }] =
    useField(ALLOW_DOWNLOAD)
  const [{ value: followerGatedValue }, , { setValue: setFollowerGatedValue }] =
    useField(FOLLOWER_GATED)
  // TODO: Stems value should be submitted outside tracks in uploadTracks
  const [{ value: stemsValue }, , { setValue: setStemsValue }] = useField(STEMS)

  const initialValues = useMemo(() => {
    const initialValues = {}
    set(initialValues, ALLOW_DOWNLOAD, allowDownloadValue)
    set(initialValues, FOLLOWER_GATED, followerGatedValue)
    set(initialValues, STEMS, stemsValue ?? [])
    return initialValues as SourceFilesFormValues
  }, [allowDownloadValue, followerGatedValue, stemsValue])

  const onSubmit = useCallback(
    (values: SourceFilesFormValues) => {
      setAllowDownloadValue(get(values, ALLOW_DOWNLOAD))
      setFollowerGatedValue(get(values, FOLLOWER_GATED))
      setStemsValue(get(values, STEMS))
    },
    [setAllowDownloadValue, setFollowerGatedValue, setStemsValue]
  )

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
        <SourceFilesModalFiels />
      </ModalField>
    </Formik>
  )
}

const SourceFilesModalFiels = () => {
  const [
    { onChange: allowDownloadOnChange },
    ,
    { setValue: allowDownloadSetValue }
  ] = useField(ALLOW_DOWNLOAD)
  const [
    { onChange: followerGatedOnChange },
    ,
    { setValue: followerGatedSetValue }
  ] = useField(FOLLOWER_GATED)
  const [{ value: stemsValue }, , { setValue: setStems }] =
    useField<StemUpload[]>(STEMS)

  const invalidAudioFile = (name: string, reason: 'size' | 'type') => {
    console.error('Invalid Audio File', { name, reason })
    // TODO: show file error
  }

  const onAddStemsToTrack = useCallback(
    async (selectedStems: File[]) => {
      const processedFiles = processFiles(selectedStems, invalidAudioFile)
      const newStems = (await Promise.all(processedFiles))
        .filter(removeNullable)
        .map((processedFile) => ({
          ...processedFile,
          category: stemCategories[0],
          allowDelete: true,
          allowCategorySwitch: true
        }))
      setStems([...stemsValue, ...newStems])
    },
    [setStems, stemsValue]
  )

  return (
    <div className={styles.fields}>
      <div>{messages.description}</div>
      <Divider />
      <ToggleRowField
        name={ALLOW_DOWNLOAD}
        header={messages[ALLOW_DOWNLOAD].header}
        description={messages[ALLOW_DOWNLOAD].description}
        onChange={(e) => {
          allowDownloadOnChange(e)
          if (!e.target.checked) {
            followerGatedSetValue(false)
          }
        }}
      />
      <Divider />
      <ToggleRowField
        name={FOLLOWER_GATED}
        header={messages[FOLLOWER_GATED].header}
        description={messages[FOLLOWER_GATED].description}
        onChange={(e) => {
          followerGatedOnChange(e)
          if (e.target.checked) {
            allowDownloadSetValue(true)
          }
        }}
      />
      <Divider />
      <SourceFilesView
        onAddStems={onAddStemsToTrack}
        stems={stemsValue}
        onSelectCategory={(category: StemCategory, index: number) => {
          stemsValue[index].category = category
          setStems(stemsValue)
        }}
        onDeleteStem={(index) => {
          stemsValue.splice(index, 1)
          setStems(stemsValue)
        }}
      />
    </div>
  )
}
