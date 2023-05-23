import { MutableRefObject, useCallback, useMemo, useState } from 'react'

import {
  CreatePlaylistSource,
  FeatureFlags,
  Name,
  accountSelectors,
  createPlaylistModalUIActions
} from '@audius/common'
import {
  PopupMenu,
  IconCreatePlaylist,
  IconFolder,
  IconPlaylists
} from '@audius/stems'
import { useDispatch } from 'react-redux'

import { make, useRecord } from 'common/store/analytics/actions'
import Pill from 'components/pill/Pill'
import { Tooltip } from 'components/tooltip'
import { useAuthenticatedCallback } from 'hooks/useAuthenticatedCallback'
import { useFlag } from 'hooks/useRemoteConfig'

const messages = {
  new: 'New',
  newPlaylistOrFolderTooltip: 'New Playlist or Folder',
  createPlaylist: 'Create Playlist',
  createFolder: 'Create Folder'
}

type Props = {
  scrollbarRef: MutableRefObject<HTMLElement | null>
}

// Allows user to create a playlist or playlist-folder
export const CreateButton = (props: Props) => {
  const { scrollbarRef } = props
  const record = useRecord()
  const dispatch = useDispatch()
  const { isEnabled: isPlaylistUpdatesEnabled } = useFlag(
    FeatureFlags.PLAYLIST_UPDATES_PRE_QA
  )

  const getTooltipPopupContainer = useCallback(
    () => scrollbarRef.current?.parentNode,
    [scrollbarRef]
  )

  const handleCreateLegacy = useAuthenticatedCallback(() => {
    dispatch(createPlaylistModalUIActions.open())
    record(
      make(Name.PLAYLIST_OPEN_CREATE, { source: CreatePlaylistSource.NAV })
    )
  }, [dispatch, record])

  // Gate triggering popup behind authentication
  const handleClickPill = useAuthenticatedCallback(
    (triggerPopup: () => void) => {
      triggerPopup()
    },
    []
  )

  const legacyPill = (
    <Tooltip
      text={messages.newPlaylistOrFolderTooltip}
      getPopupContainer={getTooltipPopupContainer}
    >
      <Pill text={messages.new} icon='save' onClick={handleCreateLegacy} />
    </Tooltip>
  )

  const handleCreatePlaylist = useCallback(() => {}, [])
  const handleCreateFolder = useCallback(() => {}, [])

  const items = useMemo(
    () => [
      {
        text: messages.createPlaylist,
        icon: <IconPlaylists />,
        onClick: handleCreatePlaylist
      },
      {
        text: messages.createFolder,
        icon: <IconFolder />,
        onClick: handleCreateFolder
      }
    ],
    [handleCreatePlaylist, handleCreateFolder]
  )

  const pillMenu = (
    <PopupMenu
      items={items}
      renderTrigger={(anchorRef, triggerPopup, triggerProps) => (
        <Tooltip
          text={messages.newPlaylistOrFolderTooltip}
          getPopupContainer={getTooltipPopupContainer}
        >
          <Pill
            ref={anchorRef}
            text={messages.new}
            icon='save'
            onClick={() => handleClickPill(triggerPopup)}
            {...triggerProps}
          />
        </Tooltip>
      )}
    />
  )

  return isPlaylistUpdatesEnabled ? pillMenu : legacyPill
}
