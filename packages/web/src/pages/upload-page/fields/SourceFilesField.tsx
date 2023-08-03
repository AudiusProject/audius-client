import { useCallback, useMemo } from 'react'

import {
  Download,
  StemCategory,
  StemUpload,
  removeNullable
} from '@audius/common'
import { useField } from 'formik'
import { get, set } from 'lodash'

import { ReactComponent as IconSourceFiles } from 'assets/img/iconSourceFiles.svg'
import { ContextualMenu } from 'components/data-entry/ContextualMenu'
import { Divider } from 'components/divider'
import { Text } from 'components/typography'

import {
  SourceFilesView,
  dropdownRows as stemCategories
} from '../fields/SourceFilesView'
import { SwitchRowField } from '../fields/SwitchRowField'
import { useTrackField } from '../hooks'
import { processFiles } from '../store/utils/processFiles'

import styles from './SourceFilesField.module.css'

const ALLOW_DOWNLOAD_BASE = 'is_downloadable'
const ALLOW_DOWNLOAD = 'download.is_downloadable'
const FOLLOWER_GATED_BASE = 'requires_follow'
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
  },
  values: {
    allowDownload: 'MP3 Available',
    followerGated: 'Followers Only'
  }
}

export type SourceFilesFormValues = {
  [ALLOW_DOWNLOAD]: boolean
  [FOLLOWER_GATED]: boolean
  [STEMS]: StemUpload[]
}

export const SourceFilesField = () => {
  const [{ value: allowDownloadValue }, , { setValue: setAllowDownloadValue }] =
    useTrackField<Download[typeof ALLOW_DOWNLOAD_BASE]>(ALLOW_DOWNLOAD)
  const [{ value: followerGatedValue }, , { setValue: setFollowerGatedValue }] =
    useTrackField<Download[typeof FOLLOWER_GATED_BASE]>(FOLLOWER_GATED)
  // TODO: Stems value should be submitted outside tracks in uploadTracks
  const [{ value: stemsValue }, , { setValue: setStemsValue }] =
    useTrackField<StemUpload[]>(STEMS)

  const initialValues = useMemo(() => {
    const initialValues = {}
    set(initialValues, ALLOW_DOWNLOAD, allowDownloadValue)
    set(initialValues, FOLLOWER_GATED, followerGatedValue)
    set(initialValues, STEMS, stemsValue ?? [])
    return initialValues as SourceFilesFormValues
  }, [allowDownloadValue, followerGatedValue, stemsValue])

  const handleSubmit = useCallback(
    (values: SourceFilesFormValues) => {
      setAllowDownloadValue(get(values, ALLOW_DOWNLOAD))
      setFollowerGatedValue(get(values, FOLLOWER_GATED))
      setStemsValue(get(values, STEMS))
    },
    [setAllowDownloadValue, setFollowerGatedValue, setStemsValue]
  )

  const getValue = () => {
    const values = []
    if (allowDownloadValue) {
      values.push(messages.values.allowDownload)
    }
    if (followerGatedValue) {
      values.push(messages.values.followerGated)
    }
    const stemsCategories = stemsValue.map((stem) => stem.category)
    return [...values, ...stemsCategories]
  }

  return (
    <ContextualMenu
      label={messages.title}
      description={messages.description}
      icon={<IconSourceFiles />}
      initialValues={initialValues}
      value={getValue()}
      onSubmit={handleSubmit}
      menuFields={<SourceFilesMenuFields />}
    />
  )
}

const SourceFilesMenuFields = () => {
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
      <Text>{messages.description}</Text>
      <Divider />
      <SwitchRowField
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
      <SwitchRowField
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
