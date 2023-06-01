import { ID, Nullable, SmartCollectionVariant, Variant } from '@audius/common'
import cn from 'classnames'

import styles from './CollectionHeader.module.css'
import { OwnerActionButtons } from './OwnerActionButtons'
import { PlayButton } from './PlayButton'
import { SmartCollectionActionButtons } from './SmartCollectionActionButtons'
import { ViewerActionButtons } from './ViewerActionButtons'

type CollectionActionButtonProps = {
  collectionId: ID | SmartCollectionVariant
  variant?: Variant
  isOwner?: boolean
  onPlay: () => void
  playing: boolean
  isEmptyPlaylist: boolean
  userId: ID
  tracksLoading: boolean
}

export const CollectionActionButtons = (props: CollectionActionButtonProps) => {
  const {
    variant,
    isOwner,
    collectionId,
    onPlay,
    playing,
    isEmptyPlaylist,
    userId,
    tracksLoading
  } = props

  let actionButtons: Nullable<JSX.Element> = null

  if (typeof collectionId !== 'number') {
    if (variant === Variant.SMART) {
      actionButtons = (
        <SmartCollectionActionButtons
          collectionId={collectionId}
          userId={userId}
        />
      )
    }
  } else if (isOwner) {
    actionButtons = <OwnerActionButtons collectionId={collectionId} />
  } else {
    actionButtons = <ViewerActionButtons collectionId={collectionId} />
  }

  return (
    <div
      className={cn(styles.actionButtons, {
        [styles.show]: !tracksLoading,
        [styles.hide]: tracksLoading
      })}
    >
      {isEmptyPlaylist ? null : (
        <PlayButton onPlay={onPlay} playing={playing} />
      )}
      {actionButtons}
    </div>
  )
}
