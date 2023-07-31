import { useCallback, useMemo } from 'react'

import { IconCalendar } from '@audius/stems'
import cn from 'classnames'
import { Formik } from 'formik'
import { get, set } from 'lodash'
import moment from 'moment'

import { Text } from 'components/typography'

import { DatePickerField } from '../fields/DatePickerField'
import { ModalField } from '../fields/ModalField'

import styles from './ReleaseDateModalForm.module.css'
import { useTrackField } from './utils'
const messages = {
  title: 'Release Date',
  description:
    'Specify a release date (in the past) for your music. Release date will affect the order of content on your profile and is visible to users.'
}

const RELEASE_DATE = 'releaseDate'

export type ReleaseDateFormValues = {
  [RELEASE_DATE]: moment.Moment
}

/**
 * This is a subform that expects to exist within a parent TrackEdit form.
 * The useField calls reference the outer form's fields which much match the name constants.
 */
export const ReleaseDateModalForm = () => {
  // Field from the outer form
  const [{ value }, , { setValue }] = useTrackField(RELEASE_DATE)

  const initialValues = useMemo(() => {
    const initialValues = {}
    set(initialValues, RELEASE_DATE, value)
    return initialValues as ReleaseDateFormValues
  }, [value])

  const onSubmit = useCallback(
    (values: ReleaseDateFormValues) => {
      setValue(get(values, RELEASE_DATE))
    },
    [setValue]
  )

  const preview = (
    <div className={styles.preview}>
      <div className={styles.header}>
        <Text className={styles.title} variant='title' size='large'>
          {messages.title}
        </Text>
      </div>
      <Text>{messages.description}</Text>
      <div className={styles.valueDisplay}>
        <IconCalendar className={styles.calendarIcon} />
        <input
          className={styles.input}
          name={RELEASE_DATE}
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
      initialValues={initialValues}
      onSubmit={onSubmit}
      enableReinitialize
    >
      <ModalField
        title={messages.title}
        icon={<IconCalendar className={styles.titleIcon} />}
        preview={preview}
      >
        <Text
          className={cn(styles.title, styles.modalHeading)}
          variant='title'
          size='large'
        >
          {messages.title}
        </Text>
        <Text>{messages.description}</Text>
        <div className={styles.datePicker}>
          <DatePickerField name={RELEASE_DATE} label={messages.title} />
        </div>
      </ModalField>
    </Formik>
  )
}
