import { MultiTrackEditForm } from '../forms/MultiTrackEditForm'

import { TrackForUpload } from './types'

type EditPageProps = {
  tracks: TrackForUpload[]
  setTracks: (tracks: TrackForUpload[]) => void
  onContinue: () => void
}

export const EditPageNew = (props: EditPageProps) => {
  // TODO: collection upload case switch
  return <MultiTrackEditForm {...props} />
}
