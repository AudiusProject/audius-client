import { useState } from 'react'

import {
  Button,
  ButtonType,
  IconCalendar,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle
} from '@audius/stems'
import { useField } from 'formik'

import DatePicker from 'components/data-entry/DatePicker'

const messages = {
  title: 'Release Date',
  description:
    'Specify a release date (in the past) for your music.\nRelease date will affect the order of content on your profile and is visible to users.',
  done: 'Done'
}

export const ReleaseDateModalField = () => {
  const [, { initialValue }, { setValue }] = useField('release_date')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const open = () => setIsModalOpen(true)
  const close = () => setIsModalOpen(false)

  const modal = (
    <Modal onClose={close} isOpen={isModalOpen}>
      <ModalHeader>
        <ModalTitle title={messages.title} icon={<IconCalendar />} />
      </ModalHeader>
      <ModalContent>
        <h3>{messages.title}</h3>
        <p>{messages.description}</p>
        <DatePicker defaultDate={initialValue} onDateChange={setValue} />
      </ModalContent>
      <ModalFooter>
        <Button
          //   className={styles.button}
          type={ButtonType.PRIMARY}
          text={messages.done}
          onClick={close}
        />
      </ModalFooter>
    </Modal>
  )

  return (
    <>
      <div onClick={open}>Test 123</div>
      {modal}
    </>
  )
}
