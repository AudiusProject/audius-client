import { useField, useFormikContext } from 'formik'

import {
  RELEASE_DATE_FIELD_NAME,
  ReleaseDateModalForm
} from '../fields/ReleaseDateModalForm'
import {
  HIDE_REMIX_FIELD_NAME,
  REMIX_LINK_FIELD_NAME,
  REMIX_OF_FIELD_NAME,
  RemixModalForm
} from '../fields/RemixModalForm'

import { EditFormValues } from './EditPageNew'
import styles from './TrackModalArray.module.css'

export const TrackModalArray = () => {
  const { values: currentValues, setValues } =
    useFormikContext<EditFormValues>()

  const handleSubmit = (values: Partial<EditFormValues>) => {
    // TODO: reformat values to match outer form structure
    setValues({ ...currentValues, ...values })
  }

  const [{ value: releaseDateValue }] = useField(RELEASE_DATE_FIELD_NAME)
  const [{ value: hideRemixesValue }] = useField(HIDE_REMIX_FIELD_NAME)
  const [{ value: remixOfValue }] = useField(REMIX_OF_FIELD_NAME)

  return (
    <div className={styles.root}>
      <ReleaseDateModalForm
        initialValues={{
          [RELEASE_DATE_FIELD_NAME]: releaseDateValue
        }}
        onSubmit={handleSubmit}
      />
      <RemixModalForm
        initialValues={{
          [HIDE_REMIX_FIELD_NAME]: hideRemixesValue,
          [REMIX_OF_FIELD_NAME]: remixOfValue,
          [REMIX_LINK_FIELD_NAME]: ''
        }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
