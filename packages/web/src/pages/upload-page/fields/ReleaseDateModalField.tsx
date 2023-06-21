import { IconCalendar } from '@audius/stems'
import cn from 'classnames'
import { useField } from 'formik'

import { DatePickerField } from '../fields/DatePickerField'

import { ModalField } from './ModalField'
import styles from './ReleaseDateModalField.module.css'

const messages = {
  title: 'Release Date',
  description:
    'Specify a release date (in the past) for your music. Release date will affect the order of content on your profile and is visible to users.'
}

const FIELD_NAME = 'releaseDate'

export const ReleaseDateModalField = () => {
  const [{ value }] = useField<moment.Moment>(FIELD_NAME)

  const preview = (
    <div className={styles.preview}>
      <div className={styles.header}>
        <div className={styles.title}>{messages.title}</div>
      </div>
      <div className={styles.description}>{messages.description}</div>
      <div className={styles.valueDisplay}>
        <IconCalendar className={styles.calendarIcon} />
        {value.calendar().split(' at')[0]}
      </div>
    </div>
  )

  return (
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
        <DatePickerField name={FIELD_NAME} label={'Release Date'} />
      </div>
    </ModalField>
  )
}
