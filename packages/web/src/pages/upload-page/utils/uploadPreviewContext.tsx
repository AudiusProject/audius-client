import { createContext, useCallback, useState } from 'react'

import { Nullable, playerSelectors, queueActions } from '@audius/common'
import { useSelector, useDispatch } from 'react-redux'

const { getPlaying } = playerSelectors
const { pause: pauseQueue } = queueActions

type PreviewContextProps = {
  playPreview: (preview: HTMLAudioElement, idx: number) => void
  stopPreview: () => void
  togglePreview: (preview: HTMLAudioElement, idx: number) => void
  playingPreviewIndex: number
}

export const UploadPreviewContext = createContext<PreviewContextProps>({
  playPreview: () => {},
  stopPreview: () => {},
  togglePreview: () => {},
  playingPreviewIndex: -1
})

export const UploadPreviewContextProvider = (props: {
  children: JSX.Element
}) => {
  const dispatch = useDispatch()
  const isPlaying = useSelector(getPlaying)
  const [preview, setPreview] = useState<Nullable<HTMLAudioElement>>(null)
  const [previewIndex, setPreviewIndex] = useState<number>(-1)

  const stopPreview = useCallback(() => {
    if (preview !== null) {
      preview.pause()
      preview.currentTime = 0
      setPreview(null)
      setPreviewIndex(-1)
    }
  }, [preview])

  const playPreview = useCallback(
    (trackPreview: HTMLAudioElement, trackIdx: number) => {
      if (isPlaying) dispatch(pauseQueue)
      if (preview !== null) {
        preview.pause()
        preview.currentTime = 0
      }

      trackPreview.play()
      setPreview(trackPreview)
      setPreviewIndex(trackIdx)
    },
    [dispatch, isPlaying, preview]
  )

  const togglePreview = useCallback(
    (trackPreview: HTMLAudioElement, trackIdx: number) => {
      trackIdx === previewIndex
        ? stopPreview()
        : playPreview(trackPreview, trackIdx)
    },
    [playPreview, previewIndex, stopPreview]
  )

  return (
    <UploadPreviewContext.Provider
      value={{
        playPreview,
        stopPreview,
        togglePreview,
        playingPreviewIndex: previewIndex
      }}
    >
      {props.children}
    </UploadPreviewContext.Provider>
  )
}
