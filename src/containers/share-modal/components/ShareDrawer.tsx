import React, { useContext } from 'react'

import { IconLink, IconTwitterBird } from '@audius/stems'
import { useDispatch, useSelector } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { CommonState } from 'common/store'
import { getUser } from 'common/store/cache/users/selectors'
import { shareTrack } from 'common/store/social/tracks/actions'
import { getSource, getTrack } from 'common/store/ui/share-modal/selectors'
import ActionDrawer from 'components/action-drawer/ActionDrawer'
import { ToastContext } from 'components/toast/ToastContext'
import { getCopyableLink } from 'utils/clipboardUtil'
import { SHARE_TOAST_TIMEOUT_MILLIS } from 'utils/constants'
import { openTwitterLink } from 'utils/tweet'

import styles from './ShareDrawer.module.css'

export const ShareDrawer = () => {
  const [isOpen, setIsOpen] = useModalState('Share')
  const { toast } = useContext(ToastContext)
  const dispatch = useDispatch()
  const track = useSelector(getTrack)
  const artist = useSelector((state: CommonState) =>
    getUser(state, { id: track?.owner_id })
  )
  const source = useSelector(getSource)

  return (
    <ActionDrawer
      title='Share Track'
      actions={[
        {
          text: 'Share to Twitter',
          icon: <IconTwitterBird height={20} width={26} />,
          className: styles.shareToTwitterAction,
          onClick: () => {
            if (track && artist) {
              const twitterText = `Check out ${track.title} by ${artist.handle} on @AudiusProject #Audius`
              const trackLink = getCopyableLink(track.permalink)
              openTwitterLink(trackLink, twitterText)
            }
          }
        },
        {
          text: 'Copy Link to Track',
          icon: <IconLink height={26} width={26} />,
          className: styles.copyLinkAction,
          onClick: () => {
            if (track && source) {
              dispatch(shareTrack(track.track_id, source))
              toast('Copied Link to Track', SHARE_TOAST_TIMEOUT_MILLIS)
            }
          }
        }
      ]}
      didSelectRow={() => {}}
      onClose={() => setIsOpen(false)}
      isOpen={isOpen}
      classes={{ actionItem: styles.actionItem }}
    />
  )
}
