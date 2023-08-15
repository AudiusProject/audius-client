import { UploadType } from '@audius/common'

import { EditCollectionForm } from '../forms/EditCollectionForm'
import { EditTrackForm } from '../forms/EditTrackForm'
import { UploadFormState } from '../types'

type EditPageProps = {
  formState: UploadFormState
  onContinue: (formState: UploadFormState) => void
}

export const EditPage = (props: EditPageProps) => {
  const { formState, onContinue } = props

  switch (formState.uploadType) {
    case UploadType.INDIVIDUAL_TRACK:
    case UploadType.INDIVIDUAL_TRACKS:
      return <EditTrackForm formState={formState} onContinue={onContinue} />
    case UploadType.ALBUM:
    case UploadType.PLAYLIST:
      return (
        <EditCollectionForm formState={formState} onContinue={onContinue} />
      )
  }
  return null
}
