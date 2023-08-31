import { useCallback } from 'react'

import type { UploadTrack } from '@audius/common'
import { creativeCommons } from '@audius/common'
import { Formik } from 'formik'
import * as Yup from 'yup'

import { EditTrackNavigator } from './EditTrackNavigator'
import type { FormValues, EditTrackScreenProps } from './types'
const { computeLicenseVariables, ALL_RIGHTS_RESERVED_TYPE } = creativeCommons

const EditTrackSchema = Yup.object().shape({
  title: Yup.string().required('Your track must have a name.'),
  artwork: Yup.object({
    url: Yup.string()
  })
    .when('trackArtwork', {
      is: undefined,
      then: Yup.object().required('Artwork is required.').nullable()
    })
    .nullable(),
  trackArtwork: Yup.string().nullable(),
  genre: Yup.string().required('Genre is required.'),
  description: Yup.string().max(1000).nullable(),
  premium_conditions: Yup.object({
    usdc_purchase: Yup.object({
      price: Yup.number()
        .positive()
        .min(0.99, 'Price must be at least $0.99.')
        .max(9.99, 'Price must be less than $9.99.')
        .required('Required')
    }).nullable()
  }).nullable(),
  duration: Yup.number(),
  preview_start_seconds: Yup.number()
    .max(
      (Yup.ref('duration') as unknown as number) > 15
        ? (Yup.ref('duration') as unknown as number) - 15
        : 0,
      (Yup.ref('duration') as unknown as number)
        ? 'Preview must start at least 15 seconds before the end of the track.'
        : 'Preview must start at 0 since the track is less than 15 seconds'
    )
    .nullable()
})

export type EditTrackParams = UploadTrack

export const EditTrackScreen = (props: EditTrackScreenProps) => {
  const { initialValues: initialValuesProp, onSubmit, ...screenProps } = props

  const initialValues: FormValues = {
    ...initialValuesProp,
    licenseType: computeLicenseVariables(
      initialValuesProp.license || ALL_RIGHTS_RESERVED_TYPE
    )
  }

  const handleSubmit = useCallback(
    (values: FormValues) => {
      const {
        licenseType: ignoredLicenseType,
        trackArtwork: ignoredTrackArtwork,
        ...metadata
      } = values

      // If track is not unlisted and one of the unlisted visibility fields is false, set to true.
      // We shouldn't have to do this if we set the default for 'share' and 'play_count' to true
      // in newTrackMetadata, but not sure why they default to false.
      if (!metadata.is_unlisted) {
        const unlistedVisibilityFields = [
          'genre',
          'mood',
          'tags',
          'share',
          'play_count'
        ]
        const shouldOverrideVisibilityFields = !unlistedVisibilityFields.every(
          (field) => metadata.field_visibility?.[field]
        )
        if (shouldOverrideVisibilityFields) {
          metadata.field_visibility = {
            ...metadata.field_visibility,
            genre: true,
            mood: true,
            tags: true,
            share: true,
            play_count: true,
            remixes: !!metadata.field_visibility?.remixes
          }
        }
      }
      onSubmit(metadata)
    },
    [onSubmit]
  )

  return (
    <Formik<FormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={EditTrackSchema}
    >
      {(formikProps) => (
        <EditTrackNavigator {...formikProps} {...screenProps} />
      )}
    </Formik>
  )
}
