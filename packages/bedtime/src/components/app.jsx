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
import transitions from './AppTransitions.module.css'
import { CSSTransition } from 'react-transition-group'
import { getDominantColor } from '../util/image/dominantColor'
import { shadeColor } from '../util/shadeColor'
import { isMobileWebTwitter } from '../util/isMobileWebTwitter'

if ((module).hot) {
    // tslint:disable-next-line:no-var-requires
    require('preact/debug')
}

// How long to wait for GA before we show the loading screen
const LOADING_WAIT_MSEC = 1

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

// Attemps to parse a the window's url.
// Returns null if the URL scheme is invalid.
const getRequestDataFromURL = () => {
  const components = window.location.pathname.split('/')
  const lastComponent = components[components.length - 1]
  // Pull off the request type
  let requestType = pathComponentRequestTypeMap[lastComponent]
  if (!requestType) return null

  // Pull off the seach params
  const searchParams = new URLSearchParams(window.location.search)
  const [id, ownerId, flavor, isTwitter] = ['id', 'ownerId', 'flavor', 'twitter'].map(x => searchParams.get(x))

  // Validate the search params not null
  if ([id, ownerId, flavor].some(e => e === null)) {
    return null
  }
  // Parse them as ints
  const [intId, intOwnerId] = [parseInt(id), parseInt(ownerId)]
  if (isNaN(intId) || isNaN(intOwnerId)) {
    return null
  }

  // Get the flavor
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

const App = () => {
  const [didError, setDidError] = useState(false) // General errors
  const [did404, setDid404] = useState(false) // 404s indicate content was deleted
  const [requestState, setRequestState] = useState(null) // Parsed request state
  const [isRetrying, setIsRetrying] = useState(false) // Currently retrying?

  const [tracksResponse, setTracksResponse] = useState(null)
  const [collectionsResponse, setCollectionsResponse] = useState(null)
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false)
  const onGoingRequest = useRef(false)
  const [dominantColor, setDominantColor] = useState(null)

  useEffect(() => {
    recordOpen()
  }, [])

  useEffect(() => {
    if (didError) {
      recordError()
    }
  }, [didError])

  // TODO: pull these out into separate functions?
  // Request metadata from GA, computing
  // dominant color on success.
  const requestMetadata = useCallback(async (request) => {
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
        if (!track) {
          setDid404(true)
          setTracksResponse(null)
        } else {
          setDid404(false)
          setTracksResponse(track)

          // set average color
          const color = await getDominantColor(track.coverArt)
          setDominantColor({ primary: color })
        }
      } else {
        const collection = await getCollection(request.id, request.ownerId)
        if (!collection) {
          console.log(1)
          setDid404(true)
          setCollectionsResponse(null)
        } else {
          console.log(2)
          setDid404(false)
          setCollectionsResponse(collection)

          // Set dominant color
          console.log({ collection })
          const color = await getDominantColor(collection.coverArt)
          setDominantColor({ primary: color, secondary: shadeColor(color, -20) })
          console.log(2.5)
        }
      }
      console.log(3)

      onGoingRequest.current = false
      setDidError(false)
      setShowLoadingAnimation(false)
    } catch (e) {
      console.log(4)
      onGoingRequest.current = false
      console.error(`Got error: ${e.message}`)
      setDidError(true)
      setShowLoadingAnimation(false)
      setDid404(false)
      setTracksResponse(null)
      setCollectionsResponse(null)
    }
  }, [])

  // Perform initial request
  useEffect(() => {
    const request = getRequestDataFromURL()
    if (!request) {
      setDidError(true)
      return
    }
    setRequestState(request)
    requestMetadata(request)
  }, [])

  // Retries
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
  const mobileWebTwitter = isMobileWebTwitter(requestState?.isTwitter)

  // The idea is to show nothing (null) until either we
  // get metadata back from GA, or we pass the loading threshold
  // and display the loading screen.
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

    const mobileWebTwitter = isMobileWebTwitter(requestState?.isTwitter)

    if (requestState && dominantColor) {
      return (
        <CSSTransition
          classNames={{
            appear: mobileWebTwitter ? transitions.appearMobileWebTwitter : transitions.appear,
            appearActive: mobileWebTwitter ? transitions.appearActiveMobileWebTwitter : transitions.appearActive
          }}
          appear
          in
          timeout={1000}
        >
        { tracksResponse
          ? <TrackPlayerContainer
              track={tracksResponse}
              flavor={requestState.playerFlavor}
              isTwitter={requestState.isTwitter}
              backgroundColor={dominantColor.primary}
            />
          : <CollectionPlayerContainer
              collection={collectionsResponse}
              flavor={requestState.playerFlavor}
              isTwitter={requestState.isTwitter}
              backgroundColor={dominantColor.primary}
              rowBackgroundColor={dominantColor.secondary}
            />
        }
        </CSSTransition>
      )
    }

    return null
  }

  const renderPausePopover = () => {
    if (!requestState || (!tracksResponse && !collectionsResponse)) {
      return null
    }

    let artworkURL = tracksResponse?.coverArt || collectionsResponse?.coverArt
    let artworkClickURL = tracksResponse?.urlPath || collectionsResponse?.collectionURLPath
    let listenOnAudiusURL = tracksResponse?.urlPath || collectionsResponse?.collectionURLPath
    let flavor = requestState.playerFlavor
    return (<PausePopover
             artworkURL={artworkURL}
             artworkClickURL={artworkClickURL}
             listenOnAudiusURL={listenOnAudiusURL}
             flavor={flavor}
             isMobileWebTwitter={mobileWebTwitter}
            />)
  }

  useEffect(() => {
    if (requestState?.isTwitter) {
      document.body.style.backgroundColor = '#ffffff'
    }
  }, [requestState])

  return (
    <div
      id='app'
      className={
        cn(styles.app,
           { [styles.compactApp]: isCompact },
           { [styles.twitter]: requestState && requestState.isTwitter && !mobileWebTwitter}
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
