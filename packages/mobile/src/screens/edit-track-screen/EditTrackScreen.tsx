import type { ExtendedTrackMetadata, UploadTrack } from '@audius/common'
import { Formik } from 'formik'
import * as Yup from 'yup'

import type { FormValues } from '../upload-screen/types'

import { EditTrackNavigator } from './EditTrackNavigator'

const EditTrackSchema = Yup.object().shape({
  title: Yup.string().required('Required'),
  artwork: Yup.object({
    url: Yup.string().nullable().required('Required')
  }),
  genre: Yup.string().required('Required'),
  description: Yup.string().max(1000).nullable()
})

export type EditTrackParams = UploadTrack

export type EditTrackScreenProps = {
  onSubmit: (values: ExtendedTrackMetadata) => void
  initialValues: ExtendedTrackMetadata
}

export const EditTrackScreen = (props: EditTrackScreenProps) => {
  const { initialValues: initialValuesProp, onSubmit } = props

  const initialValues: FormValues = {
    ...initialValuesProp,
    licenseType: {
      allowAttribution: false,
      commercialUse: false,
      derivativeWorks: false
    }
  }

  return (
    <Formik<FormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
      component={EditTrackNavigator}
      validationSchema={EditTrackSchema}
    />
  )
}
