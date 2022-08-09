import cn from 'classnames'

import { ReactComponent as IconOptions } from 'assets/img/iconKebabHorizontal.svg'
import tabStyles from 'components/actions-tab/ActionsTab.module.css'
import Menu from 'components/menu/Menu'

import styles from './OverflowMenuButton.module.css'

type OverflowMenuButtonProps = {
  className?: string
  handle: string
  trackId?: number
  index?: number
  isFavorited?: boolean
  isReposted?: boolean
  isDeleted?: boolean
  trackTitle?: string
  albumId?: number | null
  albumName?: string | null
  date?: object
  onClick?: (e: MouseEvent) => void
  onRemove?: (
    trackId?: number,
    index?: number,
    uid?: string,
    date?: any
  ) => void
  removeText?: string
  isArtistPick?: boolean
  isOwner?: boolean
  isOwnerDeactivated?: boolean
  hiddenUntilHover?: boolean
  trackPermalink?: string
  uid?: string
}

export const OverflowMenuButton = (props: OverflowMenuButtonProps) => {
  const {
    className,
    onClick,
    trackId,
    index,
    uid,
    date,
    isFavorited,
    isOwnerDeactivated,
    onRemove,
    removeText
  } = props

  const removeMenuItem = {
    text: removeText,
    onClick: () => onRemove?.(trackId, index, uid, date?.unix())
  }

  const overflowMenu = {
    menu: {
      type: 'track',
      mount: 'page',
      includeShare: true,
      ...props,
      extraMenuItems: onRemove ? [removeMenuItem] : []
    }
  }

  if (isOwnerDeactivated && !onRemove && !isFavorited) {
    return null
  }

  return (
    <div onClick={onClick} className={cn(styles.tableOptionsButton, className)}>
      <Menu {...overflowMenu}>
        {(ref, triggerPopup) => (
          <div
            className={tabStyles.iconKebabHorizontalWrapper}
            onClick={triggerPopup}
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
