import { createContext, useCallback, useEffect, useState } from 'react'

import {
  UploadType,
  uploadActions,
  uploadConfirmationModalUIActions,
  uploadSelectors
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'

import styles from './UploadPage.module.css'
import { FinishPageNew } from './components/FinishPageNew'
import SelectPageNew from './components/SelectPageNew'
import { EditPage } from './pages/EditPage'
import { UploadFormState } from './types'
import { UploadPreviewContextProvider } from './utils/uploadPreviewContext'

const { uploadTracks, undoResetState } = uploadActions
const { requestOpen: openUploadConfirmationModal } =
  uploadConfirmationModalUIActions
const { getShouldReset } = uploadSelectors

const messages = {
  selectPageTitle: 'Upload Your Music',
  editPageTitle: 'Complete Your ',
  finishPageTitle: 'Uploading Your '
}

enum Phase {
  SELECT,
  EDIT,
  FINISH
}

const uploadTypeStringMap: Record<UploadType, string> = {
  [UploadType.INDIVIDUAL_TRACK]: 'Track',
  [UploadType.INDIVIDUAL_TRACKS]: 'Tracks',
  [UploadType.ALBUM]: 'Album',
  [UploadType.PLAYLIST]: 'Playlist'
}

const initialFormState = {
  uploadType: undefined,
  metadata: undefined,
  tracks: undefined
}

type UploadPageProps = {
  scrollToTop: () => void
}

export const UploadFormScrollContext = createContext(() => {})

export const UploadPageNew = (props: UploadPageProps) => {
  const { scrollToTop } = props
  const dispatch = useDispatch()
  const [phase, setPhase] = useState(Phase.SELECT)
  const [formState, setFormState] = useState<UploadFormState>(initialFormState)
  const shouldResetState = useSelector(getShouldReset)

  const { tracks, uploadType } = formState

  // Pretty print json just for testing
  useEffect(() => {
    if (phase !== Phase.FINISH) return
    const stylizePreElements = function () {
      const preElements = document.getElementsByTagName('pre')
      for (let i = 0; i < preElements.length; ++i) {
        const preElement = preElements[i]
        preElement.className += 'prettyprint'
      }
    }

    const injectPrettifyScript = function () {
      const scriptElement = document.createElement('script')
      scriptElement.setAttribute(
        'src',
        'https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js'
      )
      document.head.appendChild(scriptElement)
    }

    stylizePreElements()
    injectPrettifyScript()
  }, [phase])

  const pageTitleUploadType =
    !uploadType ||
    (uploadType === UploadType.INDIVIDUAL_TRACKS && tracks?.length === 1)
      ? UploadType.INDIVIDUAL_TRACK
      : uploadType

  let pageTitle = messages.selectPageTitle
  switch (phase) {
    case Phase.EDIT:
      pageTitle = `${messages.editPageTitle}${uploadTypeStringMap[pageTitleUploadType]}`
      break
    case Phase.FINISH:
      pageTitle = `${messages.finishPageTitle}${uploadTypeStringMap[pageTitleUploadType]}`
      break
    case Phase.SELECT:
    default:
      pageTitle = messages.selectPageTitle
  }

  let page
  switch (phase) {
    case Phase.SELECT:
      page = (
        <SelectPageNew
          formState={formState}
          onContinue={(formState: UploadFormState) => {
            setFormState(formState)
            setPhase(Phase.EDIT)
          }}
        />
      )
      break
    case Phase.EDIT:
      if (formState.uploadType !== undefined) {
        page = (
          <EditPage
            formState={formState}
            onContinue={(formState: UploadFormState) => {
              setFormState(formState)
              const hasPublicTracks =
                formState.tracks?.some(
                  (track) => !track.metadata.is_unlisted
                ) ?? true
              openUploadConfirmation(hasPublicTracks)
            }}
          />
        )
      }
      break
    case Phase.FINISH:
      if (formState.uploadType !== undefined) {
        page = (
          <FinishPageNew
            formState={formState}
            onContinue={() => {
              setFormState({
                tracks: undefined,
                uploadType: undefined,
                metadata: undefined
              })
              setPhase(Phase.SELECT)
            }}
          />
        )
      }
  }

  const openUploadConfirmation = useCallback(
    (hasPublicTracks: boolean) => {
      dispatch(
        openUploadConfirmationModal({
          hasPublicTracks,
          confirmCallback: () => {
            setPhase(Phase.FINISH)
          }
        })
      )
    },
    [dispatch]
  )

  useEffect(() => {
    if (shouldResetState) {
      setFormState(initialFormState)
      setPhase(Phase.SELECT)
      dispatch(undoResetState())
    }
  }, [dispatch, shouldResetState])

  const handleUpload = useCallback(() => {
    if (!formState.tracks) return
    const { tracks } = formState
    const trackStems = tracks.reduce((acc, track) => {
      // @ts-ignore - This has stems in it sometimes
      acc = [...acc, ...(track.metadata.stems ?? [])]
      return acc
    }, [])

    dispatch(
      uploadTracks(
        // @ts-ignore - This has artwork on it
        tracks,
        // NOTE: Need to add metadata for collections here for collection upload
        undefined,
        tracks.length > 1
          ? UploadType.INDIVIDUAL_TRACKS
          : UploadType.INDIVIDUAL_TRACK,
        trackStems
      )
    )
  }, [dispatch, formState])

  useEffect(() => {
    if (phase === Phase.FINISH) handleUpload()
  }, [handleUpload, phase])

  return (
    <Page
      title='Upload'
      description='Upload and publish audio content to the Audius platform'
      contentClassName={styles.upload}
      header={
        <Header
          primary={pageTitle}
          showBackButton={phase === Phase.EDIT}
          onClickBack={() => {
            setPhase(Phase.SELECT)
          }}
        />
      }
    >
      <UploadPreviewContextProvider>
        <UploadFormScrollContext.Provider value={scrollToTop}>
          {page}
        </UploadFormScrollContext.Provider>
      </UploadPreviewContextProvider>
    </Page>
  )
}
