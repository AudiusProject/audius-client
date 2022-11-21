import { useCallback } from 'react'

import type { UploadTrack } from '@audius/common'
import { useRoute } from '@react-navigation/native'

import { useNavigation } from 'app/hooks/useNavigation'

import { EditTrackScreen } from '../../edit-track-screen'
import type { FormValues, UploadParamList, UploadRouteProp } from '../types'

export type CompleteTrackParams = UploadTrack

export const CompleteTrackScreen = () => {
  const { params } = useRoute<UploadRouteProp<'CompleteTrack'>>()
  const { metadata, file } = params
  const navigation = useNavigation<UploadParamList>()

  const handleSubmit = useCallback(
    (values: FormValues) => {
      navigation.push('UploadingTracks', {
        tracks: [{ file, preview: null, metadata: values }]
      })
    },
    [navigation, file]
  )

  return <EditTrackScreen initialValues={metadata} onSubmit={handleSubmit} />
}
