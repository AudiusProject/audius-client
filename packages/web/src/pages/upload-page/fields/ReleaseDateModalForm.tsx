import { IconCalendar } from '@audius/stems'
import cn from 'classnames'
import { Formik, useField } from 'formik'
import moment from 'moment'

import { DatePickerField } from './DatePickerField'
import { ModalField } from './ModalField'
import styles from './ReleaseDateModalForm.module.css'

const messages = {
  title: 'Release Date',
  description:
    'Specify a release date (in the past) for your music. Release date will affect the order of content on your profile and is visible to users.'
}

export const RELEASE_DATE_FIELD_NAME = 'releaseDate'

export type ReleaseDateFormValues = {
  [RELEASE_DATE_FIELD_NAME]: moment.Moment
}
type RemixModalFormProps = {
  initialValues: ReleaseDateFormValues
  onSubmit: (values: ReleaseDateFormValues) => void
}
export const ReleaseDateModalForm = (props: RemixModalFormProps) => {
  const { initialValues, onSubmit } = props
  const [{ value }] = useField<string>(RELEASE_DATE_FIELD_NAME)

  const preview = (
    <div className={styles.preview}>
      <div className={styles.header}>
        <label className={styles.title}>{messages.title}</label>
      </div>
      <div className={styles.description}>{messages.description}</div>
      <div className={styles.valueDisplay}>
        <IconCalendar className={styles.calendarIcon} />
        <input
          className={styles.input}
          name={RELEASE_DATE_FIELD_NAME}
          value={moment(value).format('L')}
          aria-readonly
          readOnly
        />{' '}
        <div>{moment(value).calendar().split(' at')[0]}</div>
      </div>
    </div>
  )

  return (
    <Formik<ReleaseDateFormValues>
      initialValues={
        initialValues ?? {
          remix_of: null,
          hideRemixes: false
        }
      }
      onSubmit={onSubmit}
    >
      <ModalField
        title={messages.title}
        icon={<IconCalendar className={styles.titleIcon} />}
        preview={preview}
      >
        <h3 className={cn(styles.title, styles.modalHeading)}>
          {messages.title}
        </h3>
        <p className={styles.description}>{messages.description}</p>
        <div className={styles.datePicker}>
          <DatePickerField
            name={RELEASE_DATE_FIELD_NAME}
            label={'Release Date'}
          />
        </div>
      </ModalField>
    </Formik>
  )
}
