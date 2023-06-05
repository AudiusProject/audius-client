import { ExtendedTrackMetadata, Nullable } from '@audius/common'
import { Button, ButtonType, IconArrow } from '@audius/stems'
import { Formik } from 'formik'
import * as Yup from 'yup'

import { EditTrackMetadataField } from '../fields/EditTrackMetadataField'

import styles from './EditPage.module.css'
import { TrackForUpload } from './types'

type EditPageProps = {
  tracks: TrackForUpload[]
  onContinue: () => void
}
export type FormValues = ExtendedTrackMetadata & {
  licenseType: {
    allowAttribution: Nullable<boolean>
    commercialUse: Nullable<boolean>
    derivativeWorks: Nullable<boolean>
  }
  trackArtwork?: string
}

const EditTrackSchema = Yup.object().shape({
  title: Yup.string().required('Required'),
  artwork: Yup.object({
    url: Yup.string()
  })
    // .when('trackArtwork', {
    //   is: undefined,
    //   then: Yup.object().required('Required').nullable()
    // })
    .nullable(),
  trackArtwork: Yup.string().nullable(),
  genre: Yup.string().required('Required'),
  description: Yup.string().max(1000).nullable()
})

export const EditPageNew = (props: EditPageProps) => {
  const { tracks, onContinue } = props

  const initialValues: FormValues = {
    ...tracks[0].metadata,
    artwork: null,
    licenseType: {
      allowAttribution: null,
      commercialUse: null,
      derivativeWorks: null
    }
  }

  return (
    <Formik<FormValues>
      initialValues={initialValues}
      onSubmit={onContinue}
      validationSchema={EditTrackSchema}
    >
      {(formikProps) => (
        <div className={styles.edit}>
          <EditTrackMetadataField />
          <div className={styles.continue}>
            <Button
              type={ButtonType.PRIMARY_ALT}
              text='Continue'
              name='continue'
              rightIcon={<IconArrow />}
              onClick={() => formikProps.handleSubmit()}
              textClassName={styles.continueButtonText}
              className={styles.continueButton}
            />
          </div>
        </div>
      )}
    </Formik>
  )
}
