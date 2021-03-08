import React, { useState } from 'react'
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
}

const IconPopup: React.FC<IconPopupProps> = ({
  icon,
  menu,
  disabled,
  title
}) => {
  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false)

  const handleIconClick = () => setIsPopupVisible(!isPopupVisible)

  const handleMenuItemClick = (item: IconPopupItemProps) => () => {
    item.onClick()
    setIsPopupVisible(false)
  }

  const handlePopupClose = () => setIsPopupVisible(false)

  const style = {
    [styles.focused]: isPopupVisible,
    [styles.disabled]: disabled
  }

  return (
    <div className={cn(styles.popup, style)}>
      <IconButton
        className={cn(styles.icon, iconPopupClass)}
        icon={icon}
        disabled={disabled}
        onClick={handleIconClick}
      />

      <Popup
        className={styles.fit}
        wrapperClassName={styles.fit}
        isVisible={isPopupVisible}
        onClose={handlePopupClose}
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
