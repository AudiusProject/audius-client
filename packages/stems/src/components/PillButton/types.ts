import { HTMLAttributes } from 'react'
// import { HTMLAttributes, ReactNode } from 'react'
import * as React from 'react'

export enum Type {
  PRIMARY = 'primary',
  SECONDARY = 'secondary'
}

export type PillButtonProps = HTMLAttributes<HTMLButtonElement> & {
  text: any
  // text: ReactNode
  onClick?: (event: React.MouseEvent) => void
  disabled?: boolean
  type?: Type
  className?: string
  textClassName?: string
}
