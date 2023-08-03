import { AccessAndSaleField } from '../fields/AccessAndSaleField'
import { ReleaseDateField } from '../fields/ReleaseDateField'
import { RemixSettingsField } from '../fields/RemixSettingsField'
import { SourceFilesField } from '../fields/SourceFilesField'
import { AttributionModalForm } from '../forms/AttributionModalForm'

import styles from './TrackModalArray.module.css'

export const TrackModalArray = () => {
  return (
    <div className={styles.root}>
      <ReleaseDateField />
      <RemixSettingsField />
      <SourceFilesField />
      <AccessAndSaleField />
      <AttributionModalForm />
    </div>
  )
}
