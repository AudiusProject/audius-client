import React, { useCallback } from 'react'
import {
  Button,
  ButtonSize,
  ButtonType,
  IconRemove,
  Modal
} from '@audius/stems'

import styles from './SourceFilesModal.module.css'
import Dropzone from 'components/upload/Dropzone'
import Track, { Download } from 'models/Track'
import { StemCategory, stemCategoryFriendlyNames } from 'models/Stems'
import Dropdown from 'components/navigation/Dropdown'
import IconButton from 'components/general/IconButton'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import Switch from 'components/general/Switch'
import cn from 'classnames'
import {
  incrementScrollCount,
  decrementScrollCount
} from 'store/application/ui/scrollLock/actions'
import { useDispatch } from 'react-redux'

const MAX_ROWS = 5

const messages = {
  title: 'DOWNLOADS & SOURCE FILES',
  subtitle: 'Allow Users to download MP3 copies of your track',
  sourceFiles: 'SOURCE FILES',
  allowDownloads: 'Allow Downloads',
  requireFollowToDownload: 'Require Follow to Download',
  done: 'DONE',
  maxCapacity: 'Reached upload limit of 5 files.'
}

const defaultDownloadSettings: Download = {
  is_downloadable: false,
  requires_follow: false,
  cid: null
}

export type StemUpload = {
  metadata: Track
  category: StemCategory
  allowDelete: boolean
  allowCategorySwitch: boolean
}

export type StemUploadWithFile = StemUpload & {
  file: File
}

export const dropdownRows = [
  StemCategory.INSTRUMENTAL,
  StemCategory.LEAD_VOCALS,
  StemCategory.MELODIC_LEAD,
  StemCategory.PAD,
  StemCategory.SNARE,
  StemCategory.KICK,
  StemCategory.HIHAT,
  StemCategory.PERCUSSION,
  StemCategory.SAMPLE,
  StemCategory.BACKING_VOX,
  StemCategory.BASS,
  StemCategory.OTHER
]

type StemRowProps = {
  stem: StemUpload
  didSelectCategory: (category: StemCategory) => void
  onDelete: () => void
}

const StemRow = ({
  stem: { category, metadata, allowCategorySwitch, allowDelete },
  didSelectCategory,
  onDelete
}: StemRowProps) => {
  const onSelectIndex = (index: number) => {
    const cat = dropdownRows[index]
    didSelectCategory(cat)
  }

  let stemIndex = dropdownRows.findIndex(r => r === category)
  if (stemIndex === -1) {
    console.error(`Couldn't find stem row for category: ${category}`)
    stemIndex = 0
  }

  const renderDeleteButton = () => {
    return (
      <div className={styles.deleteButton}>
        {allowDelete ? (
          <IconButton
            className={styles.deleteButtonIcon}
            onClick={() => {
              if (!allowDelete) return
              onDelete()
            }}
            icon={<IconRemove />}
          />
        ) : (
          <LoadingSpinner />
        )}
      </div>
    )
  }

  return (
    <div className={styles.stemRowContainer}>
      <div className={styles.dropdownContainer}>
        <Dropdown
          size='medium'
          menu={{
            items: dropdownRows.map(r => ({
              text: stemCategoryFriendlyNames[r]
            }))
          }}
          variant='border'
          onSelectIndex={onSelectIndex}
          defaultIndex={stemIndex}
          disabled={!allowCategorySwitch}
          textClassName={styles.dropdownText}
        />
      </div>
      <div className={styles.title}>{metadata.title}</div>
      {renderDeleteButton()}
    </div>
  )
}

type SourceFilesViewProps = {
  downloadSettings: Download
  onUpdateDownloadSettings: (downloadSettings: Download) => void
  onAddStems: (stems: any) => void
  stems: StemUpload[]
  onSelectCategory: (category: StemCategory, index: number) => void
  onDeleteStem: (index: number) => void
}
const SourceFilesView = ({
  downloadSettings,
  onUpdateDownloadSettings,
  onAddStems,
  stems,
  onSelectCategory,
  onDeleteStem
}: SourceFilesViewProps) => {
  const toggleIsDownloadable = useCallback(() => {
    const newSettings = downloadSettings
      ? { ...downloadSettings }
      : { ...defaultDownloadSettings }

    if (newSettings.is_downloadable) {
      // Disabling
      newSettings.is_downloadable = false
      newSettings.requires_follow = false
    } else {
      // Enabling
      newSettings.is_downloadable = true
      newSettings.requires_follow = false
    }
    onUpdateDownloadSettings(newSettings)
  }, [onUpdateDownloadSettings, downloadSettings])

  const toggleRequiresFollow = useCallback(() => {
    const newSettings = downloadSettings
      ? { ...downloadSettings }
      : { ...defaultDownloadSettings }

    if (newSettings.requires_follow) {
      // Disabling
      newSettings.requires_follow = false
    } else {
      // Enabling
      newSettings.requires_follow = true
      newSettings.is_downloadable = true
    }
    onUpdateDownloadSettings(newSettings)
  }, [onUpdateDownloadSettings, downloadSettings])

  const renderDownloadSection = () => {
    return (
      <div className={styles.downloadSettings}>
        <div className={styles.downloadSetting}>
          <div className={styles.label}>{messages.allowDownloads}</div>
          <Switch
            isOn={downloadSettings?.is_downloadable ?? false}
            handleToggle={toggleIsDownloadable}
          />
        </div>
        <div className={styles.downloadSetting}>
          <div className={styles.label}>{messages.requireFollowToDownload}</div>
          <Switch
            isOn={downloadSettings?.requires_follow ?? false}
            handleToggle={toggleRequiresFollow}
          />
        </div>
      </div>
    )
  }

  const renderCurrentStems = () => {
    return (
      <div className={styles.stemRows}>
        {stems.map((stem, i) => (
          <StemRow
            key={`${stem.metadata.title}-${i}`}
            stem={stem}
            didSelectCategory={category => onSelectCategory(category, i)}
            onDelete={() => onDeleteStem(i)}
          />
        ))}
      </div>
    )
  }

  const useRenderDropzone = () => {
    const atCapacity = stems.length >= MAX_ROWS

    // Trim out stems > MAX_ROWS on add
    const onAdd = useCallback(
      (toAdd: any[]) => {
        const remaining = MAX_ROWS - stems.length
        onAddStems(toAdd.slice(0, remaining))
      },
      // eslint-disable-next-line
      [stems]
    )

    return (
      <Dropzone
        className={styles.dropZone}
        titleTextClassName={cn(styles.dropzoneTitle, {
          [styles.dropzoneDisabled]: atCapacity
        })}
        messageClassName={cn(styles.dropzoneMessage, {
          [styles.dropzoneDisabled]: atCapacity
        })}
        iconClassName={cn(styles.dropzoneIcon, {
          [styles.dropzoneDisabled]: atCapacity
        })}
        textAboveIcon={messages.sourceFiles}
        onDrop={onAdd}
        type='stem'
        subtitle={atCapacity ? messages.maxCapacity : undefined}
        disableClick={atCapacity}
      />
    )
  }

  return (
    <div className={styles.sourceFilesContainer}>
      {renderDownloadSection()}
      {useRenderDropzone()}
      {renderCurrentStems()}
    </div>
  )
}

type SourceFilesModalProps = SourceFilesViewProps & {
  isOpen: boolean
  onClose: () => void
}

const SourceFilesModal = ({
  downloadSettings,
  onUpdateDownloadSettings,
  isOpen,
  onClose,
  onAddStems,
  stems,
  onSelectCategory,
  onDeleteStem
}: SourceFilesModalProps) => {
  const dispatch = useDispatch()
  const incrementScroll = useCallback(() => dispatch(incrementScrollCount()), [
    dispatch
  ])
  const decrementScroll = useCallback(() => dispatch(decrementScrollCount()), [
    dispatch
  ])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showTitleHeader
      title={messages.title}
      subtitle={messages.subtitle}
      dismissOnClickOutside
      showDismissButton
      bodyClassName={styles.modalContainer}
      headerContainerClassName={styles.modalHeader}
      titleClassName={styles.modalTitle}
      subtitleClassName={styles.modalSubtitle}
      zIndex={12000}
      incrementScrollCount={incrementScroll}
      decrementScrollCount={decrementScroll}
    >
      <SourceFilesView
        downloadSettings={downloadSettings}
        onUpdateDownloadSettings={onUpdateDownloadSettings}
        onAddStems={onAddStems}
        stems={stems}
        onSelectCategory={onSelectCategory}
        onDeleteStem={onDeleteStem}
      />
      <Button
        className={styles.doneButton}
        text={messages.done}
        size={ButtonSize.TINY}
        type={ButtonType.SECONDARY}
        onClick={onClose}
      />
    </Modal>
  )
}

export default SourceFilesModal
