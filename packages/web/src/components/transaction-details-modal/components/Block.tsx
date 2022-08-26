import { ComponentPropsWithoutRef, ReactNode } from 'react'

import cn from 'classnames'

import styles from './Block.module.css'

export const Block = ({
  header,
  children,
  className,
  ...divProps
}: {
  header: ReactNode
  children: ReactNode
} & ComponentPropsWithoutRef<'div'>) => {
  return (
    <div className={cn(styles.block, className)} {...divProps}>
      <div className={styles.blockHeader}>{header}</div>
      <div className={styles.blockContent}>{children}</div>
    </div>
  )
}

export const BlockContainer = ({ children }: { children: ReactNode }) => {
  return <div className={styles.blockContainer}>{children}</div>
}
