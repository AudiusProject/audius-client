import { useCallback } from 'react'

import {
  Status,
  transactionDetailsActions,
  transactionDetailsSelectors
} from '@audius/common'
import {
  Button,
  ButtonType,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle
} from '@audius/stems'
import { useDispatch } from 'react-redux'

import { ReactComponent as IconTransaction } from 'assets/img/iconTransaction.svg'
import { useModalState } from 'common/hooks/useModalState'
import { useSelector } from 'common/hooks/useSelector'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'

import styles from './TransactionDetailsModal.module.css'
import { TransactionDetailsContent } from './components/TransactionDetailsContent'

const { getTransactionDetails } = transactionDetailsSelectors
const { setModalClosedAction } = transactionDetailsActions

const messages = {
  transactionDetails: 'Transaction Details',
  done: 'Done',
  error: 'Something went wrong.'
}

export const TransactionDetailsModal = () => {
  const dispatch = useDispatch()
  const [isOpen, setIsOpen] = useModalState('TransactionDetails')
  const transactionDetails = useSelector(getTransactionDetails)

  const handleClose = useCallback(() => {
    if (transactionDetails.onModalCloseAction) {
      dispatch(transactionDetails.onModalCloseAction)
      dispatch(setModalClosedAction())
    }
    setIsOpen(false)
  }, [dispatch, setIsOpen, transactionDetails])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} bodyClassName={styles.root}>
      <ModalHeader onClose={handleClose}>
        <ModalTitle
          title={messages.transactionDetails}
          icon={<IconTransaction />}
        />
      </ModalHeader>
      <ModalContent className={styles.content}>
        {transactionDetails.status === Status.SUCCESS ? (
          <TransactionDetailsContent
            transactionDetails={transactionDetails.transactionDetails}
          />
        ) : transactionDetails.status === Status.LOADING ? (
          <LoadingSpinner className={styles.spinner} />
        ) : transactionDetails.status === Status.ERROR ? (
          <div className={styles.error}>{messages.error}</div>
        ) : null}
      </ModalContent>
      <ModalFooter className={styles.footer}>
        <Button
          type={ButtonType.PRIMARY_ALT}
          text={messages.done}
          onClick={handleClose}
        />
      </ModalFooter>
    </Modal>
  )
}
