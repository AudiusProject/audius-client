import { ReleaseDateField } from '../fields/ReleaseDateField'
import { RemixSettingsField } from '../fields/RemixSettingsField'
import { SourceFilesField } from '../fields/SourceFilesField'
import { AttributionModalForm } from '../forms/AttributionModalForm'
import { TrackAvailabilityModalForm } from '../forms/TrackAvailabilityModalForm'

import styles from './TrackModalArray.module.css'

export const TrackModalArray = () => {
  return (
    <div className={styles.root}>
      <ReleaseDateField />
      <RemixSettingsField />
      <SourceFilesField />
      <TrackAvailabilityModalForm />
      <AttributionModalForm />
    </div>
  )
}
