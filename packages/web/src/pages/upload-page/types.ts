import { ExtendedTrackMetadata, Nullable } from '@audius/common'
import moment from 'moment'

import { TrackForUpload } from './components/types'

export type SingleTrackEditValues = ExtendedTrackMetadata & {
  releaseDate: moment.Moment
  licenseType: {
    allowAttribution: Nullable<boolean>
    commercialUse: Nullable<boolean>
    derivativeWorks: Nullable<boolean>
  }
}

export type TrackEditFormValues = {
  trackMetadatas: SingleTrackEditValues[]
}

export type CollectionTrackForUpload = TrackForUpload & {
  override: boolean
}
