import React, { useCallback, useRef, useState } from 'react'
import cn from 'classnames'
import Popup from 'components/general/Popup'
import styles from './IconPopup.module.css'
import IconButton from './IconButton'

export const iconPopupClass = 'iconPopup'

type IconPopupItemProps = {
  text: string
  onClick: () => void
  icon?: object
}

type IconPopupProps = {
  icon: object
  menu: { items: IconPopupItemProps[] }
  disabled: boolean
  title?: string
  position?:
    | 'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomCenter'
    | 'bottomRight'
}

const IconPopup: React.FC<IconPopupProps> = ({
  icon,
  menu,
  disabled,
  title,
  position
}) => {
  const ref = useRef<any>()

  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false)

  const handleIconClick = useCallback(
    () => setIsPopupVisible(!isPopupVisible),
    [isPopupVisible, setIsPopupVisible]
  )

  const handleMenuItemClick = useCallback(
    (item: IconPopupItemProps) => () => {
      item.onClick()
      setIsPopupVisible(false)
    },
    [setIsPopupVisible]
  )

  const handlePopupClose = useCallback(() => setIsPopupVisible(false), [
    setIsPopupVisible
  ])

  const style = {
    [styles.focused]: isPopupVisible,
    [styles.disabled]: disabled
  }

  return (
    <div className={cn(styles.popup, style)}>
      <IconButton
        ref={ref}
        className={cn(styles.icon, iconPopupClass)}
        icon={icon}
        disabled={disabled}
        onClick={handleIconClick}
      />

      <Popup
        triggerRef={ref}
        className={styles.fit}
        wrapperClassName={styles.fitWrapper}
        isVisible={isPopupVisible}
        onClose={handlePopupClose}
        position={position}
        title={title || ''}
        noHeader={!title}
      >
        <div className={styles.menu}>
          {menu.items.map((item, i) => (
            <div
              key={`${item.text}_${i}`}
              className={styles.item}
              onClick={handleMenuItemClick(item)}
            >
              <span className={styles.icon}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
        <></>
      </Popup>
    </div>
  )
}

export default IconPopup
