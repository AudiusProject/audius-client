import React from 'react'

import cn from 'classnames'

import Drawer from 'components/drawer/Drawer'
import { isDarkMode } from 'utils/theme/theme'

import styles from './ActionSheetModal.module.css'

type ActionSheetAction = {
  text: string
  isDestructive?: boolean
}

type ActionSheetModalProps = {
  didSelectRow: (index: number) => void
  actions: ActionSheetAction[]
  isOpen: boolean
  onClose: () => void
  title?: string
}

export const MODAL_OFFSET_PIXELS = 41

// `ActionSheetModal` is a modal that presents a list of clickable rows with text
// styled like an iOS Action Sheet.
// See: https://developer.apple.com/design/human-interface-guidelines/ios/views/action-sheets/
const ActionSheetModal = ({
  didSelectRow,
  actions,
  isOpen,
  onClose,
  title
}: ActionSheetModalProps) => {
  const isDark = isDarkMode()

  return (
    <Drawer onClose={onClose} isOpen={isOpen} shouldClose={!isOpen}>
      <div className={styles.container}>
        {title && <div className={styles.title}>{title}</div>}
        {actions.map(({ text, isDestructive = false }, index) => (
          <div
            key={`${text}-${index}`}
            onClick={() => {
              didSelectRow(index)
            }}
            className={cn(
              styles.row,
              { [styles.darkAction]: isDark },
              { [styles.destructiveAction]: isDestructive }
            )}
          >
            {text}
          </div>
        ))}
      </div>
    </Drawer>
  )
}

export default ActionSheetModal
