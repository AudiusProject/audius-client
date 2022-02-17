import React, { forwardRef } from 'react'

import cn from 'classnames'

import styles from './ModalContent.module.css'
import { ModalContentProps } from './types'

/**
 * Container for the body of content inside a Modal.
 */
export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  function ModalContent({ className, children, ...props }, ref) {
    return (
      <div
        className={cn(styles.modalContentContainer, className)}
        {...props}
        ref={ref}
      >
        {children}
      </div>
    )
  }
)
