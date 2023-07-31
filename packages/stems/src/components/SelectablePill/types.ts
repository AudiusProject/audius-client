import { IconComponent } from 'components/Icons/types'
import { BaseButtonProps } from 'utils/types'

export type SelectablePillProps = {
  size?: 'default' | 'large'
  isSelected: boolean
  label: string
  icon?: IconComponent
  onClick?: () => void
} & BaseButtonProps
