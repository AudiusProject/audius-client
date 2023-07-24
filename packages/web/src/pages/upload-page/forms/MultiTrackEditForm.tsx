import { useCallback, useState } from 'react'

import { Button, ButtonType, IconArrow } from '@audius/stems'
import cn from 'classnames'
import { FieldArray, Formik } from 'formik'
import moment from 'moment'
import * as Yup from 'yup'

import layoutStyles from 'components/layout/layout.module.css'
import PreviewButton from 'components/upload/PreviewButton'

import { TrackModalArray } from '../components/TrackModalArray'
import { TrackForUpload } from '../components/types'
import { MultiTrackSidebar } from '../fields/MultiTrackSidebar'
import TrackMetadataFields from '../fields/TrackMetadataFields'

import styles from './MultiTrackEditForm.module.css'
import { TrackEditFormValues } from './types'

type MultiTrackEditFormProps = {
  tracks: TrackForUpload[]
  setTracks: (tracks: TrackForUpload[]) => void
  onContinue: () => void
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
  //   genre: Yup.string().required('Required'),
  genre: Yup.string(),
  description: Yup.string().max(1000).nullable()
})

export const MultiTrackEditForm = (props: MultiTrackEditFormProps) => {
  const { tracks, setTracks, onContinue } = props

  const isMultiTrack = tracks.length > 1

  const initialValues: TrackEditFormValues = {
    trackMetadatas: tracks.map((track) => ({
      ...track.metadata,
      artwork: null,
      releaseDate: moment().startOf('day'),
      licenseType: {
        allowAttribution: null,
        commercialUse: null,
        derivativeWorks: null
      }
    }))
  }

  const onSubmit = useCallback(
    (values: TrackEditFormValues) => {
      const tracksForUpload: TrackForUpload[] = tracks.map((track, i) => ({
        ...track,
        metadata: values.trackMetadatas[i]
      }))
      setTracks(tracksForUpload)
      onContinue()
    },
    [onContinue, setTracks, tracks]
  )

  const [index, setIndex] = useState(0)

  return (
    <Formik<TrackEditFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
      // validationSchema={EditTrackSchema}
    >
      {(formikProps) => (
        <FieldArray name='trackMetadatas'>
          {() => (
            <>
              <div className={cn(layoutStyles.row, layoutStyles.gap2)}>
                <div className={styles.trackEditFields}>
                  <TrackMetadataFields
                    playing={false}
                    type='track'
                    index={index}
                  />
                  <TrackModalArray index={index} />
                  <PreviewButton
                    playing={false}
                    onClick={() => {}}
                    index={index}
                  />
                </div>
                {isMultiTrack ? (
                  <MultiTrackSidebar index={index} setIndex={setIndex} />
                ) : null}
              </div>
              <div className={styles.continue}>
                <Button
                  type={ButtonType.PRIMARY_ALT}
                  buttonType='submit'
                  text='Continue'
                  name='continue'
                  rightIcon={<IconArrow />}
                  onClick={() => formikProps.handleSubmit()}
                  textClassName={styles.continueButtonText}
                  className={styles.continueButton}
                />
              </div>
            </>
          )}
        </FieldArray>
      )}
    </Formik>
  )
}
