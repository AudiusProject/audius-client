import React, { useEffect, useState } from 'react'
import styles from 'containers/collectibles/components/CollectiblesPage.module.css'
import cn from 'classnames'
import Tooltip from 'components/tooltip/Tooltip'
import { formatDate } from 'utils/timeUtil'
import { Nullable } from 'utils/typeUtils'
import { ReactComponent as IconDrag } from 'assets/img/iconDrag.svg'
import { ReactComponent as IconShow } from 'assets/img/iconMultiselectAdd.svg'
import { ReactComponent as IconHide } from 'assets/img/iconRemoveTrack.svg'
import { collectibleMessages } from 'containers/collectibles/components/CollectiblesPage'
import { getCollectibleImage } from 'containers/collectibles/helpers'
import { Collectible } from 'containers/collectibles/components/types'

// @ts-ignore
export const VisibleCollectibleRow = props => {
  const {
    collectible,
    onHideClick,
    forwardRef,
    handleProps,
    ...otherProps
  } = props
  const { name, isOwned, dateCreated } = collectible

  const [image, setImage] = useState<Nullable<string>>(null)

  useEffect(() => {
    getCollectibleImage(collectible).then(frame => setImage(frame))
  }, [collectible])

  return (
    <div className={styles.editRow} ref={forwardRef} {...otherProps}>
      <Tooltip text={collectibleMessages.hideCollectible}>
        <IconHide onClick={onHideClick} />
      </Tooltip>
      <div className={styles.verticalDivider} />
      {image ? (
        <div>
          <img
            className={styles.editMedia}
            src={image}
            alt={collectibleMessages.visibleThumbnail}
          />
        </div>
      ) : (
        <div className={styles.editMediaEmpty} />
      )}
      <div className={styles.editRowTitle}>{name}</div>
      <div>
        {isOwned ? (
          <span className={cn(styles.owned, styles.editStamp)}>
            {collectibleMessages.owned}
          </span>
        ) : (
          <span className={cn(styles.created, styles.editStamp)}>
            {collectibleMessages.created}
          </span>
        )}
      </div>
      {dateCreated && <div>{formatDate(dateCreated)}</div>}
      <div className={styles.verticalDivider} />
      <div className={styles.drag} {...handleProps}>
        <IconDrag />
      </div>
    </div>
  )
}

export const HiddenCollectibleRow: React.FC<{
  collectible: Collectible
  onShowClick: () => void
}> = props => {
  const { collectible, onShowClick } = props
  const { name, isOwned, dateCreated } = collectible

  const [image, setImage] = useState<Nullable<string>>(null)

  useEffect(() => {
    getCollectibleImage(collectible).then(frame => setImage(frame))
  }, [collectible])

  return (
    <div className={cn(styles.editRow, styles.editHidden)}>
      <Tooltip
        className={styles.showButton}
        text={collectibleMessages.showCollectible}
      >
        <IconShow onClick={onShowClick} />
      </Tooltip>
      <div className={styles.verticalDivider} />
      {image ? (
        <div>
          <img
            className={styles.editMedia}
            src={image}
            alt={collectibleMessages.hiddenThumbnail}
          />
        </div>
      ) : (
        <div className={styles.editMediaEmpty} />
      )}
      <div className={styles.editRowTitle}>{name}</div>
      <div>
        {isOwned ? (
          <span className={cn(styles.owned, styles.editStamp)}>
            {collectibleMessages.owned}
          </span>
        ) : (
          <span className={cn(styles.created, styles.editStamp)}>
            {collectibleMessages.created}
          </span>
        )}
      </div>
      {dateCreated && <div>{formatDate(dateCreated)}</div>}
    </div>
  )
}
