import React from 'react'

import { Button, ButtonType, IconCheck } from '@audius/stems'

import styles from './FormActions.module.css'

export const EditActions = ({
  onDelete,
  onCancel,
  onSave,
  disabled = false,
  deleteText,
  cancelText,
  saveText,
  isForm = false
}: {
  onDelete?: () => void
  onCancel?: () => void
  onSave?: () => void
  disabled?: boolean
  deleteText: string
  cancelText: string
  saveText: string
  isForm?: boolean
}) => {
  return (
    <div className={styles.editActionsContainer}>
      <div>
        <Button
          text={deleteText}
          type={disabled ? ButtonType.DISABLED : ButtonType.SECONDARY}
          onClick={onDelete}
          disabled={disabled}
          className={styles.deleteButton}
          textClassName={styles.deleteButtonText}
        />
      </div>
      <div>
        <Button
          text={cancelText}
          type={disabled ? ButtonType.DISABLED : ButtonType.SECONDARY}
          disabled={disabled}
          className={styles.cancelButton}
          textClassName={styles.cancelButtonText}
          onClick={onCancel}
        />
        <Button
          buttonType={isForm ? 'submit' : 'button'}
          className={styles.saveChangesButton}
          text={saveText}
          disabled={disabled}
          type={disabled ? ButtonType.DISABLED : ButtonType.PRIMARY}
          onClick={onSave}
        />
      </div>
    </div>
  )
}

export const CreateActions = ({
  disabled = false,
  onSave,
  saveText,
  isForm = false
}: {
  disabled?: boolean
  onSave?: () => void
  saveText: string
  isForm?: boolean
}) => {
  return (
    <div className={styles.createActionsContainer}>
      <Button
        buttonType={isForm ? 'submit' : 'button'}
        rightIcon={<IconCheck />}
        text={saveText}
        type={disabled ? ButtonType.DISABLED : ButtonType.PRIMARY}
        disabled={disabled}
        onClick={onSave}
      />
    </div>
  )
}
