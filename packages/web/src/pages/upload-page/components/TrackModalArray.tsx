import { ReleaseDateModalForm } from '../fields/ReleaseDateModalForm'
import { RemixModalForm } from '../fields/RemixModalForm'
import { SourceFilesModalForm } from '../fields/SourceFilesModalForm'
import { TrackAvailabilityModalForm } from '../fields/TrackAvailabilityModalForm'

import styles from './TrackModalArray.module.css'

export const TrackModalArray = () => {
  return (
    <div className={styles.root}>
      <ReleaseDateModalForm />
      <RemixModalForm />
      <SourceFilesModalForm />
      <TrackAvailabilityModalForm />
    </div>
  )
}
