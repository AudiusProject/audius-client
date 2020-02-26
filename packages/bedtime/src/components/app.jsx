import { h } from 'preact'
import { useCallback, useEffect, useState, useRef } from 'preact/hooks'
import { getCollection, GetCollectionsResponse, getTrack, GetTracksResponse } from '../util/BedtimeClient'
import CollectionPlayerContainer from './collection/CollectionPlayerContainer'
import TrackPlayerContainer from './track/TrackPlayerContainer'
import Error from './error/Error'
import DeletedContent from './deleted/DeletedContent'
import cn from 'classnames'
import Loading from './loading/Loading'
import TwitterFooter from './twitterfooter/TwitterFooter'
import { ToastContextProvider } from './toast/ToastContext'
import { PauseContextProvider } from './pausedpopover/PauseProvider'
import PausePopover from './pausedpopover/PausePopover'

import styles from './App.module.css'
import { recordOpen, recordError } from '../analytics/analytics'

if ((module).hot) {
    // tslint:disable-next-line:no-var-requires
    require('preact/debug')
}

const RequestType = Object.seal({
  TRACK: 'track',
  COLLECTION: 'collection'
})

const pathComponentRequestTypeMap = {
  "playlist": RequestType.COLLECTION,
  "album": RequestType.COLLECTION,
  "track": RequestType.TRACK,
}

export const PlayerFlavor = Object.seal({
  CARD: 'card',
  COMPACT: 'compact'
})

// Returns null if the URL scheme was invalid
const getRequestDataFromURL = () => {
  console.log('Getting request!')
  console.log(window.location.pathname)
  const components = window.location.pathname.split('/')
  const lastComponent = components[components.length - 1]

  // Pull off the request type
  let requestType = pathComponentRequestTypeMap[lastComponent]
  if (!requestType) return null

  // Pull off the seach params
  const searchParams = new URLSearchParams(window.location.search)
  const [id, ownerId, flavor, isTwitter] = [searchParams.get('id'), searchParams.get('ownerId'), searchParams.get('flavor'), searchParams.get('twitter')]

  // Validate the search params
  if ([id, ownerId, flavor].some(e => e === null)) {
    return null
  }
  const [intId, intOwnerId] = [parseInt(id), parseInt(ownerId)]
  if (isNaN(intId) || isNaN(intOwnerId)) {
    return null
  }
  let playerFlavor
  if (flavor === PlayerFlavor.CARD) {
    playerFlavor = PlayerFlavor.CARD
  } else if (flavor === PlayerFlavor.COMPACT) {
    playerFlavor = PlayerFlavor.COMPACT
  } else {
    return null
  }

  return {
    requestType,
    playerFlavor,
    id: intId,
    ownerId: intOwnerId,
    isTwitter
  }
}

// interface RequestState {
//   requestType: RequestType,
//   playerFlavor: PlayerFlavor,
//   id: number,
//   ownerId: number
// }

const LOADING_WAIT_MSEC = 1000

const App = () => {
  const [didError, setDidError] = useState(false)
  const [did404, setDid404] = useState(false)
  const [requestState, setRequestState] = useState(null)
  const [tracksResponse, setTracksResponse] = useState(null)
  const [collectionsResponse, setCollectionsResponse] = useState(null)
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false)
  const onGoingRequest = useRef(false)

  useEffect(() => {
    recordOpen()
  }, [])

  useEffect(() => {
    if (didError) {
      recordError()
    }
  }, [didError])

  // TODO: pull these out into separate functions?
  const requestMetadata = useCallback(async (request) => {
    console.log('Requesting metadata')
    onGoingRequest.current = true

    // Queue up the loading animation
    setTimeout(() => {
      if (onGoingRequest.current) {
        setShowLoadingAnimation(true)
      }
    }, LOADING_WAIT_MSEC)

    try {
      if (request.requestType === RequestType.TRACK) {
        const track = await getTrack(request.id, request.ownerId)
        console.log('Got track')
        console.log(JSON.stringify(track))
        if (!track) {
          setDid404(true)
          setTracksResponse(null)
        } else {
          setDid404(false)
          setTracksResponse(track)
        }
      } else if (request.requestType === RequestType.COLLECTION) {
        console.log('Got coll')
        const collection = await getCollection(request.id, request.ownerId)
        if (!collection) {
          setDid404(true)
          setCollectionsResponse(null)
        } else {
          setDid404(false)
          setCollectionsResponse(collection)
        }
      }

      onGoingRequest.current = false
      setDidError(false)
      setShowLoadingAnimation(false)
    } catch (e) {
      onGoingRequest.current = false
      setDidError(true)
      setShowLoadingAnimation(false)
      setDid404(false)
      setTracksResponse(null)
      setCollectionsResponse(null)
    }
  }, [])

  useEffect(() => {
    const request = getRequestDataFromURL()
    if (!request) {
      console.error('bad req')
      setDidError(true)
      return
    }
    console.log('settin')
    setRequestState(request)
    requestMetadata(request)
  }, [])

  // Retries
  const [isRetrying, setIsRetrying] = useState(false)
  const retryRequestMetadata = async () => {
    if (isRetrying) return
    setIsRetrying(true)
    // If we don't have a valid request state
    // (e.g. URL params are invalid, just wait and then set it to retry failed)
    if (!requestState) {
      setTimeout(() => {
        setIsRetrying(false)
      }, 1500)
      return
    }

    await requestMetadata(requestState)
    setIsRetrying(false)
  }


  const isCompact = requestState && requestState.playerFlavor && requestState.playerFlavor === PlayerFlavor.COMPACT
  const renderPlayerContainer = () => {
    if (didError) {
      return (
        <Error
          onRetry={retryRequestMetadata}
          isRetrying={isRetrying}
        />
      )
    }

    if (did404) {
      return (
        <DeletedContent
          isCard={!isCompact}
        />
      )
    }

    if (showLoadingAnimation) {
      return <Loading />
    }

    if (tracksResponse && requestState) {
      console.log('trying to render the tracks container')
      return (<TrackPlayerContainer
        track={tracksResponse}
        flavor={requestState.playerFlavor}
        isTwitter={requestState.isTwitter}
      />)
    }

    if (collectionsResponse && requestState) {
      return (<CollectionPlayerContainer
        collection={collectionsResponse}
        flavor={requestState.playerFlavor}
        isTwitter={requestState.isTwitter}
      />)
    }

    return null
  }

  // TODO: can I delete this?
  const renderTwitterFooter = () => {
     if (didError ||
        did404 ||
        showLoadingAnimation ||
        (!tracksResponse && !collectionsResponse) ||
        requestState === null ||
        !requestState.isTwitter ||
        requestState.playerFlavor !== PlayerFlavor.CARD
       ) return null

    console.log("TRYA RENDER TWITTER")
    // TODO: this lack of consistent naming here is gross
    const url = tracksResponse ? tracksResponse.urlPath : collectionsResponse.collectionURLPath

    return <TwitterFooter onClickPath={url} />
  }

  const renderPausePopover = () => {
    if (!requestState || (!tracksResponse && !collectionsResponse)) {
      return null
    }
    let artworkURL = tracksResponse?.coverArt || collectionsResponse?.coverArt
    let artworkClickURL = tracksResponse?.urlPath || collectionsResponse?.collectionURLPath
    let listenOnAudiusURL = tracksResponse?.urlPath || collectionsResponse?.collectionURLPath
    let flavor = requestState.playerFlavor
    return <PausePopover
             artworkURL={artworkURL}
             artworkClickURL={artworkClickURL}
             listenOnAudiusURL={listenOnAudiusURL}
             flavor={flavor}
           />
  }

  return (
    <div
      id='app'
      className={
        cn(styles.app,
           { [styles.compactApp]: isCompact },
           { [styles.twitter]: requestState && requestState.isTwitter}
          )}>
      <ToastContextProvider>
        <PauseContextProvider>
          {renderPausePopover()}
          {renderPlayerContainer()}
        </PauseContextProvider>
      </ToastContextProvider>
    </div>
  )
}

export default App
