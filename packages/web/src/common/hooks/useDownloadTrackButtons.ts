import {
  ID,
  stemCategoryFriendlyNames,
  StemCategory,
  Track,
  StemTrack
} from '@audius/common'
import moment from 'moment'
import { useSelector as reduxUseSelector, shallowEqual } from 'react-redux'

import { CommonState } from 'common/store'
import { getHasAccount } from 'common/store/account/selectors'
import { getTrack, getTracks } from 'common/store/cache/tracks/selectors'
import { getCurrentUploads } from 'common/store/stems-upload/selectors'

export type DownloadButtonConfig = {
  state: ButtonState
  type: ButtonType
  label: string
  onClick?: () => void
}

export enum ButtonState {
  PROCESSING,
  LOG_IN_REQUIRED,
  DOWNLOADABLE,
  REQUIRES_FOLLOW
}

export enum ButtonType {
  STEM,
  TRACK
}

type Stem = {
  category: StemCategory
  downloadable: boolean
  downloadURL?: string
  id?: ID
}

type LabeledStem = Omit<Stem, 'category'> & { label: string }

type UseDownloadTrackButtonsArgs = {
  following: boolean
  isOwner: boolean
  onDownload: (
    trackID: number,
    cid: string,
    category?: string,
    parentTrackId?: ID
  ) => void
  onNotLoggedInClick?: () => void
}

const messages = {
  getDownloadTrack: (stemCount: number) => `${stemCount ? 'Original' : ''}`,
  getDownloadStem: (friendlyName: string, categoryCount: number) =>
    `${friendlyName} ${categoryCount || ''}`
}

const doesRequireFollow = (
  isOwner: boolean,
  following: boolean,
  track: Track
) => !isOwner && !following && track.download?.requires_follow

const useCurrentStems = ({
  trackId,
  useSelector
}: {
  trackId: ID
  useSelector: typeof reduxUseSelector
}) => {
  const track: Track | null = useSelector(
    (state: CommonState) => getTrack(state, { id: trackId }),
    shallowEqual
  )
  const stemIds = (track?._stems ?? []).map((s) => s.track_id)
  const stemTracksMap = useSelector(
    (state: CommonState) => getTracks(state, { ids: stemIds }),
    shallowEqual
  ) as { [id: number]: StemTrack }

  // Sort the stems, filter deletes
  const stemTracks = Object.values(stemTracksMap)
    .filter((t) => !t._marked_deleted && !t.is_delete)
    .sort(
      (a, b) =>
        moment(a.created_at).milliseconds() -
        moment(b.created_at).milliseconds()
    )
    .map((t) => ({
      downloadURL: t.download?.cid,
      category: t.stem_of.category,
      downloadable: true,
      id: t.track_id
    }))
    .filter((t) => t.downloadURL)
  return { stemTracks, track }
}

const useUploadingStems = ({
  trackId,
  useSelector
}: {
  trackId: ID
  useSelector: typeof reduxUseSelector
}) => {
  const currentUploads = useSelector(
    (state: CommonState) => getCurrentUploads(state, trackId),
    shallowEqual
  )
  const uploadingTracks = currentUploads.map((u) => ({
    category: u.category,
    downloadable: false
  }))
  return { uploadingTracks }
}

const getFriendlyNames = (stems: Stem[]): LabeledStem[] => {
  // Make a map of counts of the shape { category: { count, index }}
  // where count is the number of occurences of a category, and index
  // tracks which instance you're pointing at when naming.
  const catCounts = stems.reduce((acc, cur) => {
    const { category } = cur
    if (!acc[category]) {
      acc[category] = { count: 0, index: 0 }
    }
    acc[category].count += 1
    return acc
  }, {} as { [category: string]: { count: number; index: number } })

  return stems.map((t) => {
    const friendlyName = stemCategoryFriendlyNames[t.category]
    let label
    const counts = catCounts[t.category]
    if (counts.count <= 1) {
      label = messages.getDownloadStem(friendlyName, 0)
    } else {
      counts.index += 1
      label = messages.getDownloadStem(friendlyName, counts.index)
    }

    return {
      downloadURL: t.downloadURL,
      downloadable: t.downloadable,
      label,
      id: t.id
    }
  })
}

const getStemButtons = ({
  following,
  isLoggedIn,
  isOwner,
  onDownload,
  onNotLoggedInClick,
  parentTrackId,
  stems,
  track
}: UseDownloadTrackButtonsArgs & {
  isLoggedIn: boolean
  stems: LabeledStem[]
  parentTrackId: ID
  track: Track
}) => {
  return stems.map((u) => {
    const state = (() => {
      if (!isLoggedIn) return ButtonState.LOG_IN_REQUIRED

      const requiresFollow = doesRequireFollow(isOwner, following, track)
      if (requiresFollow) return ButtonState.REQUIRES_FOLLOW

      return u.downloadable ? ButtonState.DOWNLOADABLE : ButtonState.PROCESSING
    })()

    const onClick = (() => {
      const { downloadURL, id } = u
      if (downloadURL !== undefined && id !== undefined)
        return () => {
          if (!isLoggedIn) {
            onNotLoggedInClick?.()
          }
          onDownload(id, downloadURL, u.label, parentTrackId)
        }
    })()

    return {
      label: u.label,
      downloadURL: u.downloadURL,
      type: ButtonType.STEM,
      state,
      onClick
    }
  })
}

const makeDownloadOriginalButton = ({
  following,
  isLoggedIn,
  isOwner,
  onNotLoggedInClick,
  onDownload,
  stemButtonsLength,
  track
}: UseDownloadTrackButtonsArgs & {
  isLoggedIn: boolean
  track: Track | null
  stemButtonsLength: number
}) => {
  if (!track?.download?.is_downloadable) {
    return undefined
  }

  const label = messages.getDownloadTrack(stemButtonsLength)
  const config: DownloadButtonConfig = {
    state: ButtonState.PROCESSING,
    label,
    type: ButtonType.TRACK
  }

  const requiresFollow = doesRequireFollow(isOwner, following, track)
  if (isLoggedIn && requiresFollow) {
    return {
      ...config,
      state: ButtonState.REQUIRES_FOLLOW
    }
  }

  const { cid } = track.download
  if (cid) {
    return {
      ...config,
      state: isLoggedIn
        ? ButtonState.DOWNLOADABLE
        : ButtonState.LOG_IN_REQUIRED,
      onClick: () => {
        if (!isLoggedIn) {
          onNotLoggedInClick?.()
        }
        onDownload(track.track_id, cid)
      }
    }
  }

  return config
}

export const useDownloadTrackButtons = ({
  following,
  isOwner,
  onDownload,
  onNotLoggedInClick,
  trackId,
  useSelector
}: UseDownloadTrackButtonsArgs & {
  trackId: ID
  useSelector: typeof reduxUseSelector
}) => {
  const isLoggedIn = useSelector(getHasAccount)

  // Get already uploaded stems and parent track
  const { stemTracks, track } = useCurrentStems({ trackId, useSelector })

  // Get the currently uploading stems
  const { uploadingTracks } = useUploadingStems({ trackId, useSelector })
  if (!track) return []

  // Combine uploaded and uploading stems
  const combinedStems = [...stemTracks, ...uploadingTracks] as Stem[]

  // Give the stems friendly names
  const combinedFriendly = getFriendlyNames(combinedStems)

  // Make buttons for stems
  const stemButtons = getStemButtons({
    following,
    isLoggedIn,
    isOwner,
    onDownload,
    onNotLoggedInClick,
    parentTrackId: trackId,
    stems: combinedFriendly,
    track
  })

  // Make download original button
  const originalTrackButton = makeDownloadOriginalButton({
    following,
    isLoggedIn,
    isOwner,
    onDownload,
    onNotLoggedInClick,
    stemButtonsLength: stemButtons.length,
    track
  })

  return [...(originalTrackButton ? [originalTrackButton] : []), ...stemButtons]
}
