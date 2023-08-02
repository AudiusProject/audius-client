import { ReleaseDateField } from '../fields/ReleaseDateField'
import { RemixSettingsField } from '../fields/RemixSettingsField'
import { AttributionModalForm } from '../forms/AttributionModalForm'
import { SourceFilesModalForm } from '../forms/SourceFilesModalForm'
import { TrackAvailabilityModalForm } from '../forms/TrackAvailabilityModalForm'

import styles from './TrackModalArray.module.css'

export const TrackModalArray = () => {
  return (
    <div className={styles.root}>
      <ReleaseDateField />
      <RemixSettingsField />

      <SourceFilesModalForm />
      <TrackAvailabilityModalForm />
      <AttributionModalForm />
    </div>
  )
}
