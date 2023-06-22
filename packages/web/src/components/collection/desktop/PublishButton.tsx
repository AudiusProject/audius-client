import {
  cacheCollectionsSelectors,
  Collection,
  collectionPageSelectors,
  CommonState
} from '@audius/common'
import { ButtonProps, ButtonType, IconRocket } from '@audius/stems'
import { useSelector } from 'react-redux'
import { useToggle } from 'react-use'

import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { Tooltip } from 'components/tooltip'

import { EntityActionButton } from '../../entity-page/EntityActionButton'

import styles from './CollectionHeader.module.css'
import { PublishConfirmationModal } from './PublishConfirmationModal'
import { BUTTON_COLLAPSE_WIDTHS } from './utils'

const { getCollection } = collectionPageSelectors
const { getCollecitonHasHiddenTracks } = cacheCollectionsSelectors

const messages = {
  publish: 'Make Public',
  publishing: 'Making Public',
  emptyPlaylistTooltipText: 'You must add at least 1 song.',
  hiddenTracksTooltipText:
    'You cannot make a playlist with hidden tracks public.'
}

type PublishButtonProps = Partial<ButtonProps> & {
  collectionId: number
}

export const PublishButton = (props: PublishButtonProps) => {
  const { collectionId, ...other } = props
  const { _is_publishing, track_count } = useSelector((state: CommonState) =>
    getCollection(state, { id: collectionId })
  ) as Collection
  const hasHiddenTracks = useSelector((state: CommonState) =>
    getCollecitonHasHiddenTracks(state, { id: collectionId })
  )

  const [isConfirming, toggleIsConfirming] = useToggle(false)

  const isDisabled = track_count === 0 || hasHiddenTracks

  const publishButtonElement = (
    <EntityActionButton
      type={_is_publishing ? ButtonType.DISABLED : ButtonType.COMMON}
      text={
        _is_publishing ? (
          <span>{messages.publishing}&#8230;</span>
        ) : (
          messages.publish
        )
      }
      leftIcon={
        _is_publishing ? (
          <LoadingSpinner className={styles.spinner} />
        ) : (
          <IconRocket />
        )
      }
      onClick={_is_publishing ? undefined : toggleIsConfirming}
      widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
      disabled={isDisabled}
      {...other}
    />
  )

  return (
    <>
      {track_count === 0 || hasHiddenTracks ? (
        <Tooltip
          text={
            hasHiddenTracks
              ? messages.hiddenTracksTooltipText
              : messages.emptyPlaylistTooltipText
          }
        >
          <span>{publishButtonElement}</span>
        </Tooltip>
      ) : (
        publishButtonElement
      )}
      <PublishConfirmationModal
        collectionId={collectionId}
        isOpen={isConfirming}
        onClose={toggleIsConfirming}
      />
    </>
  )
}
