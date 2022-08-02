import { useState, useMemo, useEffect, useCallback } from 'react'

import { PlayableType, ID, Name, Track } from '@audius/common'
import { Modal, Button, ButtonType } from '@audius/stems'
import cn from 'classnames'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import TabSlider from 'components/data-entry/TabSlider'
import { useRecord, make } from 'store/analytics/actions'
import { AppState } from 'store/types'
import { BASE_GA_URL } from 'utils/route'
import { encodeHashId } from 'utils/route/hashIds'

import styles from './EmbedModal.module.css'
import EmbedCopy from './components/EmbedCopy'
import EmbedFrame from './components/EmbedFrame'
import { close } from './store/actions'
import { getIsOpen, getId, getKind, getMetadata } from './store/selectors'
import { Size } from './types'

const BASE_EMBED_URL = `${BASE_GA_URL}/embed`

const FlavorMap = {
  [Size.STANDARD]: 'card',
  [Size.COMPACT]: 'compact',
  [Size.TINY]: 'tiny'
}

const KindMap = {
  [PlayableType.TRACK]: 'track',
  [PlayableType.PLAYLIST]: 'playlist',
  [PlayableType.ALBUM]: 'album'
}

const constructUrl = (kind: PlayableType, id: ID, size: Size) => {
  return `${BASE_EMBED_URL}/${KindMap[kind]}/${encodeHashId(id)}?flavor=${
    FlavorMap[size]
  }`
}

const formatIFrame = (url: string, size: Size) => {
  let extras
  switch (size) {
    case Size.STANDARD:
      extras = 'width="100%" height="480"'
      break
    case Size.COMPACT:
      extras = 'width="100%" height="120"'
      break
    case Size.TINY:
      extras = 'width="100%" height="24" allowTransparency="true"'
      break
  }
  return `<iframe src=${url} ${extras} allow="encrypted-media" style="border: none;"></iframe>`
}

const messages = {
  title: {
    [PlayableType.TRACK]: 'Embed Track',
    [PlayableType.PLAYLIST]: 'Embed Playlist',
    [PlayableType.ALBUM]: 'Embed Album'
  },
  playerSize: 'Player Size',
  embedCode: 'Embed Code'
}

type OwnProps = {}

type EmbedModalProps = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const EmbedModal = ({ isOpen, kind, id, metadata, close }: EmbedModalProps) => {
  const [size, setSize] = useState(Size.STANDARD)
  // Delay the rendering of the embed frame since it's expensive.
  // This shores up the modal open animation a bit.
  const [delayedOpen, setDelayedOpen] = useState(false)
  useEffect(() => {
    setTimeout(() => setDelayedOpen(isOpen), 100)
  }, [isOpen])

  // Configure analytics
  const record = useRecord()

  useEffect(() => {
    if (isOpen && kind && id) {
      record(make(Name.EMBED_OPEN, { kind, id: `${id}` }))
    }
  }, [isOpen, kind, id, record])
  const onCopy = useCallback(() => {
    if (kind && id) {
      record(
        make(Name.EMBED_COPY, {
          kind,
          id: `${id}`,
          size: FlavorMap[size] as 'card' | 'compact' | 'tiny'
        })
      )
    }
  }, [kind, id, record, size])

  // Configure frames
  const standardFrameString = useMemo(() => {
    if (!kind || !id || !metadata) return ''
    return formatIFrame(constructUrl(kind, id, Size.STANDARD), Size.STANDARD)
  }, [kind, id, metadata])
  const compactFrameString = useMemo(() => {
    if (!kind || !id || !metadata) return ''
    return formatIFrame(constructUrl(kind, id, Size.COMPACT), Size.COMPACT)
  }, [kind, id, metadata])
  const tinyFrameString = useMemo(() => {
    if (!kind || !id || !metadata) return ''
    return formatIFrame(constructUrl(kind, id, Size.TINY), Size.TINY)
  }, [kind, id, metadata])

  const tabOptions = [
    {
      key: Size.STANDARD,
      text: Size.STANDARD
    },
    {
      key: Size.COMPACT,
      text: Size.COMPACT
    },
    {
      key: Size.TINY,
      text: Size.TINY
    }
  ]

  let frameString
  switch (size) {
    case Size.STANDARD:
      frameString = standardFrameString
      break
    case Size.COMPACT:
      frameString = compactFrameString
      break
    case Size.TINY:
      frameString = tinyFrameString
      break
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      showDismissButton
      showTitleHeader
      title={kind ? messages.title[kind] : ''}
      contentHorizontalPadding={32}
      bodyClassName={styles.modalBodyStyle}
      titleClassName={styles.modalTitleStyle}
    >
      <div className={styles.embed}>
        <div className={styles.frame}>
          <div
            className={cn(styles.switcher, {
              [styles.show]: size === Size.STANDARD
            })}
          >
            {delayedOpen && <EmbedFrame frameString={standardFrameString} />}
          </div>
          {kind === PlayableType.TRACK && (
            <div
              className={cn(styles.switcher, {
                [styles.show]: size === Size.COMPACT
              })}
            >
              {delayedOpen && <EmbedFrame frameString={compactFrameString} />}
            </div>
          )}
          {kind === PlayableType.TRACK && (
            <div
              className={cn(styles.switcher, {
                [styles.show]: size === Size.TINY
              })}
            >
              {delayedOpen && (
                <EmbedFrame width={265} frameString={tinyFrameString} />
              )}
            </div>
          )}
        </div>
        <div className={styles.details}>
          {metadata && (metadata as Track).track_id && (
            <div className={styles.panel}>
              <div className={styles.title}>{messages.playerSize}</div>
              <TabSlider
                options={tabOptions}
                selected={size}
                onSelectOption={(size) => setSize(size)}
              />
            </div>
          )}
          <div className={styles.panel}>
            <div className={styles.title}>{messages.embedCode}</div>
            <EmbedCopy frameString={frameString} onCopy={onCopy} />
          </div>

          <div className={styles.bottom}>
            <Button
              type={ButtonType.PRIMARY_ALT}
              onClick={close}
              text='Done'
              textClassName={styles.buttonText}
              className={styles.button}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

function mapStateToProps(state: AppState) {
  return {
    metadata: getMetadata(state),
    isOpen: getIsOpen(state),
    id: getId(state),
    kind: getKind(state)
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    close: () => dispatch(close())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EmbedModal)
