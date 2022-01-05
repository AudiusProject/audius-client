import React, { ReactNode } from 'react'

import cn from 'classnames'

import Drawer from 'components/drawer/Drawer'
import { isDarkMode } from 'utils/theme/theme'

import styles from './ActionDrawer.module.css'
import { ActionIcon } from './ActionIcon'

type Action = {
  text: string
  className?: string
  icon?: ReactNode
  isDestructive?: boolean
}

type ActionSheetModalProps = {
  id?: string
  didSelectRow: (index: number) => void
  actions: Action[]
  isOpen: boolean
  onClose: () => void
  title?: string
  renderTitle?: () => React.ReactNode
  classes?: { actionItem?: string }
}

// `ActionDrawer` is a drawer that presents a list of clickable rows with text
const ActionDrawer = ({
  id,
  didSelectRow,
  actions,
  isOpen,
  onClose,
  title,
  renderTitle,
  classes = {}
}: ActionSheetModalProps) => {
  const isDark = isDarkMode()
  const headerId = id ? `${id}-header` : undefined

  return (
    <Drawer onClose={onClose} isOpen={isOpen} shouldClose={!isOpen}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div id={headerId}>
            {renderTitle
              ? renderTitle()
              : title && <div className={styles.title}>{title}</div>}
          </div>
          <ul aria-labelledby={headerId}>
            {actions.map(
              ({ text, isDestructive = false, className, icon }, index) => (
                <li key={text}>
                  <div
                    role='button'
                    tabIndex={0}
                    onClick={() => {
                      didSelectRow(index)
                    }}
                    className={cn(
                      styles.row,
                      classes.actionItem,
                      className,
                      { [styles.darkAction]: isDark },
                      { [styles.destructiveAction]: isDestructive }
                    )}
                  >
                    {icon ? (
                      <div className={styles.actionIcon}>{icon}</div>
                    ) : null}
                    {text}
                  </div>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </Drawer>
  )
}

export default ActionDrawer
