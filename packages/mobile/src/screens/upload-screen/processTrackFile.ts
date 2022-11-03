import { newTrackMetadata } from '@audius/common'
import type { DocumentPickerResponse } from 'react-native-document-picker'

import type { TrackUpload } from './types'

const ALLOWED_MAX_AUDIO_SIZE_BYTES = 250 * 1000 * 1000

export const processTrackFile = (
  trackFile: DocumentPickerResponse
): TrackUpload => {
  const { name, size } = trackFile
  if (size && size > ALLOWED_MAX_AUDIO_SIZE_BYTES) {
    throw new Error('File to large')
  }

  const title = name?.replace(/\.[^/.]+$/, '') ?? null // strip file extension

  return {
    file: trackFile,
    metadata: newTrackMetadata({
      title,
      artwork: { url: '' }
    })
  }
}
