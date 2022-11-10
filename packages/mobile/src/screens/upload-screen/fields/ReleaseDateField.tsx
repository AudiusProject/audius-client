import { useCallback, useMemo, useState } from 'react'

import type { Nullable } from '@audius/common'
import { useField } from 'formik'
import moment from 'moment'
import { TouchableOpacity } from 'react-native-gesture-handler'
import DateTimePickerModal from 'react-native-modal-datetime-picker'

import { Divider, Pill, Text } from 'app/components/core'
import { makeStyles } from 'app/styles'

const isToday = (date: Date) => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const messages = {
  label: 'Release Date',
  today: 'Today'
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing(2),
    paddingTop: spacing(2),
    paddingBottom: spacing(4)
  },
  label: {
    marginTop: spacing(1)
  },
  dateText: {
    marignTop: spacing(1),
    textTransform: 'uppercase'
  },
  divider: {
    marginHorizontal: spacing(-4)
  }
}))

export const ReleaseDateField = () => {
  const styles = useStyles()
  const [{ value, onChange }] = useField<Nullable<string>>('release_date')
  const [isOpen, setIsOpen] = useState(false)

  const releaseDate = useMemo(
    () => (value ? new Date(value) : new Date()),
    [value]
  )

  const handlePress = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleChange = useCallback(
    (selectedDate: Date) => {
      const dateString = moment(selectedDate).toString()
      console.log('hello?', dateString)
      if (dateString) {
        onChange('release_date')(dateString)
      }
      handleClose()
    },
    [onChange, handleClose]
  )

  return (
    <>
      <TouchableOpacity style={styles.root} onPress={handlePress}>
        <Text fontSize='large' weight='demiBold' style={styles.label}>
          {messages.label}
        </Text>
        <Pill>
          <Text fontSize='small' weight='demiBold' style={styles.dateText}>
            {isToday(releaseDate)
              ? messages.today
              : moment(releaseDate).format('MM/DD/YY')}
          </Text>
        </Pill>
      </TouchableOpacity>
      <Divider style={styles.divider} />
      <DateTimePickerModal
        isVisible={isOpen}
        date={releaseDate}
        mode='date'
        onConfirm={handleChange}
        onCancel={handleClose}
        display='inline'
        themeVariant='light'
        accentColor='red'
        maximumDate={new Date()}
      />
    </>
  )
}
