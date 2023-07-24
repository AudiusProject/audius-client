import { AttributionModalForm } from '../forms/AttributionModalForm'
import { ReleaseDateModalForm } from '../forms/ReleaseDateModalForm'
import { RemixModalForm } from '../forms/RemixModalForm'
import { SourceFilesModalForm } from '../forms/SourceFilesModalForm'
import { TrackAvailabilityModalForm } from '../forms/TrackAvailabilityModalForm'

import styles from './TrackModalArray.module.css'

type TrackModalArrayProps = {
  index: number
}

export const TrackModalArray = (props: TrackModalArrayProps) => {
  const { index } = props
  return (
    <div className={styles.root}>
      <ReleaseDateModalForm index={index} />
      <RemixModalForm index={index} />
      <SourceFilesModalForm index={index} />
      <TrackAvailabilityModalForm index={index} />
      <AttributionModalForm index={index} />
    </div>
  )
}
