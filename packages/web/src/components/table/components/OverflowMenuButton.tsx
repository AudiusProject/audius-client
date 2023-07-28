import cn from 'classnames'

import { ReactComponent as IconOptions } from 'assets/img/iconKebabHorizontal.svg'
import tabStyles from 'components/actions-tab/ActionsTab.module.css'
import Menu from 'components/menu/Menu'
import { OwnProps as TrackMenuProps } from 'components/menu/TrackMenu'

import styles from './OverflowMenuButton.module.css'

type BaseOverflowMenuButtonProps = Omit<TrackMenuProps, 'children' | 'type'>

type OverflowMenuButtonProps = BaseOverflowMenuButtonProps & {
  className?: string
  date?: any
  index?: number
  onClick?: (e: any) => void
  onRemove?: (trackId: number, index: number, uid: string, date: number) => void
  removeText?: string
  uid?: string
}

export const OverflowMenuButton = (props: OverflowMenuButtonProps) => {
  const {
    className,
    date,
    index,
    onClick,
    onRemove,
    removeText,
    uid,
    ...other
  } = props
  const { includeEdit = true, isFavorited, isOwnerDeactivated, trackId } = other

  const removeMenuItem = {
    text: removeText,
    onClick: () => {
      if (trackId && index !== undefined && uid) {
        onRemove?.(trackId, index, uid, date?.unix())
      }
    }
  }

  const overflowMenu = {
    ...other,
    type: 'track' as const,
    mount: 'page',
    includeEdit,
    includeShare: true,
    extraMenuItems: onRemove ? [removeMenuItem] : []
  }

  if (isOwnerDeactivated && !onRemove && !isFavorited) {
    return null
  }

  return (
    <div onClick={onClick} className={cn(styles.tableOptionsButton, className)}>
      <Menu menu={overflowMenu}>
        {(ref, triggerPopup) => (
          <div
            className={tabStyles.iconKebabHorizontalWrapper}
            onClick={(e) => {
              e.stopPropagation()
              triggerPopup()
            }}
          >
            <IconOptions
              className={cn(tabStyles.iconKebabHorizontal, styles.icon)}
              ref={ref}
            />
          </div>
        )}
      </Menu>
    </div>
  )
}
