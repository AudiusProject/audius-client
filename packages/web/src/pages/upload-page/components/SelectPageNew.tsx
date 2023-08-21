import { useCallback, useState } from 'react'

import {
  Nullable,
  UploadType,
  removeNullable,
  newCollectionMetadata
} from '@audius/common'
import cn from 'classnames'

import { Dropzone } from 'components/upload/Dropzone'
import InvalidFileType from 'components/upload/InvalidFileType'

import { processFiles } from '../store/utils/processFiles'
import { UploadFormState } from '../types'

import styles from './SelectPage.module.css'
import { TracksPreviewNew } from './TracksPreviewNew'

type ErrorType = { reason: 'size' | 'type' } | null

type SelectPageProps = {
  formState: UploadFormState
  onContinue: (formState: UploadFormState) => void
}

export const SelectPageNew = (props: SelectPageProps) => {
  const { formState, onContinue } = props

  const [tracks, setTracks] = useState(formState.tracks ?? [])
  const [uploadType, setUploadType] = useState(
    formState.uploadType ?? UploadType.INDIVIDUAL_TRACK
  )
  const [uploadTrackError, setUploadTrackError] =
    useState<Nullable<ErrorType>>(null)

  const onSelectTracks = useCallback(
    async (selectedFiles: File[]) => {
      const existing = new Set(
        tracks.map(
          ({ file }: { file: File }) => `${file.name}-${file.lastModified}`
        )
      )
      selectedFiles = selectedFiles.filter(({ name, lastModified }) => {
        const id = `${name}-${lastModified}`
        if (existing.has(id)) return false
        existing.add(id)
        return true
      })

      const processedFiles = processFiles(selectedFiles, (_name, reason) =>
        setUploadTrackError({ reason })
      )
      const processedTracks = (await Promise.all(processedFiles)).filter(
        removeNullable
      )
      if (processedTracks.length === processedFiles.length) {
        setUploadTrackError(null)
      }

      if (
        uploadType === UploadType.INDIVIDUAL_TRACK &&
        selectedFiles.length + processedTracks.length > 1
      ) {
        setUploadType(UploadType.INDIVIDUAL_TRACKS)
      }

      setTracks([...tracks, ...processedTracks])
    },
    [setTracks, tracks, uploadType, setUploadType]
  )

  const onRemoveTrack = useCallback(
    (index: number) => {
      setTracks(tracks.filter((_, i) => i !== index))
      setUploadType(
        tracks.length === 2 ? UploadType.INDIVIDUAL_TRACK : uploadType
      )
    },
    [setTracks, setUploadType, tracks, uploadType]
  )

  const handleContinue = useCallback(() => {
    if (uploadType !== undefined && tracks) {
      switch (uploadType) {
        case UploadType.INDIVIDUAL_TRACK:
        case UploadType.INDIVIDUAL_TRACKS:
          onContinue({ tracks, uploadType })
          break
        case UploadType.ALBUM:
        case UploadType.PLAYLIST:
          onContinue({ tracks, uploadType, metadata: newCollectionMetadata() })
          break
      }
    }
  }, [onContinue, tracks, uploadType])

  const textAboveIcon = tracks.length > 0 ? 'More to Upload?' : undefined
  return (
    <div>
      <div className={styles.select}>
        <div className={styles.dropzone}>
          <Dropzone
            textAboveIcon={textAboveIcon}
            onDropAccepted={onSelectTracks}
            onDropRejected={onSelectTracks}
          />
          {uploadTrackError ? (
            <InvalidFileType
              reason={uploadTrackError.reason}
              className={styles.invalidFileType}
            />
          ) : null}
        </div>
        <div
          className={cn(styles.uploaded, {
            [styles.hide]: tracks.length === 0
          })}
        >
          {tracks.length > 0 ? (
            <TracksPreviewNew
              tracks={tracks}
              uploadType={uploadType}
              onRemove={onRemoveTrack}
              setUploadType={setUploadType}
              onContinue={handleContinue}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default SelectPageNew
