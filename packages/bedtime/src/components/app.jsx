import { h } from 'preact'
import { useCallback, useEffect, useState, useRef } from 'preact/hooks'
import {
  getCollectible,
  getCollectibles,
  getCollection,
  getCollectionWithHashId,
  getTrack,
  getTrackWithHashId
} from '../util/BedtimeClient'
import { decodeHashId } from '../util/hashids'
import CollectiblesPlayerContainer from './collectibles/CollectiblesPlayerContainer'
import { DEFAULT_DOMINANT_COLOR } from '../util/image/dominantColor.worker'
import CollectionPlayerContainer from './collection/CollectionPlayerContainer'
import TrackPlayerContainer from './track/TrackPlayerContainer'
import Error from './error/Error'
import DeletedContent from './deleted/DeletedContent'
import { stripLeadingSlash } from '../util/stringUtil'
import cn from 'classnames'
import Loading from './loading/Loading'
import { ToastContextProvider } from './toast/ToastContext'
import { PauseContextProvider } from './pausedpopover/PauseProvider'
import PausePopover from './pausedpopover/PausePopover'

import styles from './App.module.css'
import {
  initTrackSessionStart,
  recordOpen,
  recordError
} from '../analytics/analytics'
import transitions from './AppTransitions.module.css'
import { CSSTransition } from 'react-transition-group'
import { getDominantColor } from '../util/image/dominantColor'
import { shadeColor } from '../util/shadeColor'
import { isMobileWebTwitter } from '../util/isMobileWebTwitter'
import { CardContextProvider } from './card/Card'
import { isBItem } from '../util/bitems'
import {
  ID_ROUTE,
  HASH_ID_ROUTE,
  COLLECTIBLES_ROUTE,
  COLLECTIBLE_ID_ROUTE,
  COLLECTIBLES_DISCORD_ROUTE,
  COLLECTIBLE_ID_DISCORD_ROUTE,
  AUDIO_NFT_PLAYLIST_ROUTE,
  AUDIO_NFT_PLAYLIST_DISCORD_ROUTE
} from '../routes'
import { getArtworkUrl } from '../util/getArtworkUrl'
import { logError } from '../util/logError'

if (module.hot) {
  // tslint:disable-next-line:no-var-requires
  require('preact/debug')
}

// How long to wait for GA before we show the loading screen
const LOADING_WAIT_MSEC = 1

const RequestType = Object.seal({
  TRACK: 'track',
  COLLECTION: 'collection',
  COLLECTIBLES: 'collectibles'
})

const pathComponentRequestTypeMap = {
  playlist: RequestType.COLLECTION,
  album: RequestType.COLLECTION,
  track: RequestType.TRACK,
  collectibles: RequestType.COLLECTIBLES
}

export const PlayerFlavor = Object.seal({
  CARD: 'card',
  COMPACT: 'compact',
  TINY: 'tiny'
})

// Attemps to parse a the window's url.
// Returns null if the URL scheme is invalid.
const getRequestDataFromURL = ({ path, type, flavor, matches }) => {
  // Get request type
  const requestType = pathComponentRequestTypeMap[type]
  if (!requestType) return null

  // Get the flavor
  let playerFlavor
  if (flavor === PlayerFlavor.CARD) {
    playerFlavor = PlayerFlavor.CARD
  } else if (flavor === PlayerFlavor.COMPACT) {
    playerFlavor = PlayerFlavor.COMPACT
  } else if (flavor === PlayerFlavor.TINY) {
    playerFlavor = PlayerFlavor.TINY
  } else {
    playerFlavor = PlayerFlavor.CARD
  }

  switch (path) {
    case ID_ROUTE: {
      const { id, ownerId, isTwitter } = matches

      // Validate the search params not null
      if ([id, ownerId].some((e) => e === null)) {
        return null
      }
      // Parse them as ints
      const [intId, intOwnerId] = [parseInt(id), parseInt(ownerId)]
      if (isNaN(intId) || isNaN(intOwnerId)) {
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
    case HASH_ID_ROUTE: {
      const { hashId, isTwitter } = matches

      return {
        requestType,
        playerFlavor,
        hashId,
        isTwitter
      }
    }
    case AUDIO_NFT_PLAYLIST_ROUTE:
    case AUDIO_NFT_PLAYLIST_DISCORD_ROUTE:
    case COLLECTIBLES_ROUTE:
    case COLLECTIBLES_DISCORD_ROUTE: {
      const { handle, isTwitter } = matches
      return {
        requestType,
        playerFlavor,
        handle,
        isTwitter
      }
    }
    case COLLECTIBLE_ID_ROUTE:
    case COLLECTIBLE_ID_DISCORD_ROUTE: {
      const { handle, collectibleId, isTwitter } = matches
      return {
        requestType,
        playerFlavor,
        handle,
        collectibleId,
        isTwitter
      }
    }
    default:
      return null
  }
}

const App = (props) => {
  const [didError, setDidError] = useState(false) // General errors
  const [did404, setDid404] = useState(false) // 404s indicate content was deleted
  const [isBlocked, setIsBlocked] = useState(false) // Whether or not the content was blocked
  const [requestState, setRequestState] = useState(null) // Parsed request state
  const [isRetrying, setIsRetrying] = useState(false) // Currently retrying?

  const [tracksResponse, setTracksResponse] = useState(null)
  const [collectionsResponse, setCollectionsResponse] = useState(null)
  const [collectiblesResponse, setCollectiblesResponse] = useState(null)
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false)
  const onGoingRequest = useRef(false)
  const [dominantColor, setDominantColor] = useState(null)

  useEffect(() => {
    if (didError) {
      recordError()
    }
  }, [didError])

  // Record this session with analytics
  useEffect(() => {
    initTrackSessionStart()
  }, [])

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
      const { requestType } = request
      if (requestType === RequestType.TRACK) {
        let track
        if (request.hashId) {
          track = await getTrackWithHashId(request.hashId)
        } else {
          track = await getTrack(request.id)
        }

        if (!track) {
          setDid404(true)
          setTracksResponse(null)
        } else if (isBItem(track.id)) {
          setDid404(true)
          setIsBlocked(true)
          setTracksResponse(null)
        } else {
          setDid404(false)
          setTracksResponse(track)
          recordOpen(
            decodeHashId(track.id),
            track.title,
            track.user.handle,
            stripLeadingSlash(track.permalink)
          )

          const artworkUrl = getArtworkUrl(track)
          // Set dominant color
          let color
          if (artworkUrl) {
            try {
              color = await getDominantColor(artworkUrl)
            } catch (e) {
              color = DEFAULT_DOMINANT_COLOR
            }
          } else {
            color = DEFAULT_DOMINANT_COLOR
          }

          setDominantColor({ primary: color })
        }
      } else if (requestType === RequestType.COLLECTION) {
        let collection
        if (request.hashId) {
          collection = await getCollectionWithHashId(request.hashId)
        } else {
          collection = await getCollection(request.id)
        }

        if (!collection) {
          setDid404(true)
          setCollectionsResponse(null)
        } else {
          setDid404(false)
          setCollectionsResponse(collection)
          recordOpen(
            decodeHashId(collection.id),
            collection.playlistName,
            collection.user.handle,
            stripLeadingSlash(collection.permalink)
          )

          const artworkUrl = getArtworkUrl(collection)
          // Set dominant color
          let color
          if (artworkUrl) {
            try {
              color = await getDominantColor(artworkUrl)
            } catch (e) {
              color = DEFAULT_DOMINANT_COLOR
            }
          } else {
            color = DEFAULT_DOMINANT_COLOR
          }
          setDominantColor({
            primary: color,
            secondary: shadeColor(color, -20)
          })
        }
      } else if (requestType === RequestType.COLLECTIBLES) {
        let collectibleData
        if (request.collectibleId) {
          collectibleData = await getCollectible(
            request.handle,
            request.collectibleId
          )
        } else {
          collectibleData = await getCollectibles(request.handle)
        }

        if (!collectibleData) {
          setDid404(true)
          setCollectiblesResponse(null)
        } else {
          setDid404(false)
          setCollectiblesResponse(collectibleData)
          recordOpen(
            request.collectibleId,
            collectibleData.name,
            request.handle,
            request.url
          )
          setDominantColor({ primary: '#fff' })
        }
      }

      onGoingRequest.current = false
      setDidError(false)
      setShowLoadingAnimation(false)
    } catch (e) {
      onGoingRequest.current = false
      logError(`Got error: ${e.message}`)
      setDidError(true)
      setShowLoadingAnimation(false)
      setDid404(false)
      setTracksResponse(null)
      setCollectionsResponse(null)
    }
  }, [])

  // Perform initial request
  useEffect(() => {
    const request = getRequestDataFromURL(props)
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

  const isCompact =
    requestState &&
    requestState.playerFlavor &&
    requestState.playerFlavor === PlayerFlavor.COMPACT
  const isTiny =
    requestState &&
    requestState.playerFlavor &&
    requestState.playerFlavor === PlayerFlavor.TINY
  const mobileWebTwitter = isMobileWebTwitter(requestState?.isTwitter)

  // The idea is to show nothing (null) until either we
  // get metadata back from GA, or we pass the loading threshold
  // and display the loading screen.
  const renderPlayerContainer = () => {
    if (didError) {
      return <Error onRetry={retryRequestMetadata} isRetrying={isRetrying} />
    }

    // Tiny variant renders its own deleted content
    if (did404) {
      return (
        <DeletedContent
          flavor={requestState.playerFlavor}
          isBlocked={isBlocked}
        />
      )
    }

    if (showLoadingAnimation && !isTiny) {
      return <Loading />
    }

    const mobileWebTwitter = isMobileWebTwitter(requestState?.isTwitter)

    if (requestState && dominantColor) {
      return (
        <CSSTransition
          classNames={{
            appear: mobileWebTwitter
              ? transitions.appearMobileWebTwitter
              : transitions.appear,
            appearActive: mobileWebTwitter
              ? transitions.appearActiveMobileWebTwitter
              : transitions.appearActive
          }}
          appear
          in
          timeout={1000}
        >
          {!tracksResponse ? null : (
            <TrackPlayerContainer
              track={tracksResponse}
              flavor={requestState.playerFlavor}
              isTwitter={requestState.isTwitter}
              backgroundColor={dominantColor.primary}
            />
          )}
          {!collectionsResponse ? null : (
            <CollectionPlayerContainer
              collection={collectionsResponse}
              flavor={requestState.playerFlavor}
              isTwitter={requestState.isTwitter}
              backgroundColor={dominantColor.primary}
              rowBackgroundColor={dominantColor.secondary}
            />
          )}
          {collectiblesResponse && (
            <CollectiblesPlayerContainer
              collectiblesInfo={collectiblesResponse}
              flavor={requestState.playerFlavor}
              isTwitter={requestState.isTwitter}
              backgroundColor={dominantColor.primary}
            />
          )}
        </CSSTransition>
      )
    }

    return null
  }

  const renderPausePopover = () => {
    if (
      !requestState ||
      (!tracksResponse && !collectionsResponse && !collectiblesResponse)
    ) {
      return null
    }

    let artworkURL = getArtworkUrl(tracksResponse || collectionsResponse)
    let artworkClickURL =
      tracksResponse?.permalink || collectionsResponse?.permalink
        ? stripLeadingSlash(
            tracksResponse?.permalink || collectionsResponse?.permalink
          )
        : null
    let listenOnAudiusURL = artworkClickURL
    let flavor = requestState.playerFlavor
    return (
      <PausePopover
        artworkURL={artworkURL}
        artworkClickURL={artworkClickURL}
        listenOnAudiusURL={listenOnAudiusURL}
        flavor={flavor}
        isMobileWebTwitter={mobileWebTwitter}
      />
    )
  }

  useEffect(() => {
    if (requestState?.isTwitter) {
      document.body.style.backgroundColor = '#ffffff'
    }
  }, [requestState])

  return (
    <div
      id='app'
      className={cn(
        styles.app,
        { [styles.compactApp]: isCompact },
        {
          [styles.twitter]:
            requestState && requestState.isTwitter && !mobileWebTwitter
        }
      )}
    >
      <ToastContextProvider>
        <PauseContextProvider>
          <CardContextProvider>
            {renderPausePopover()}
            {renderPlayerContainer()}
          </CardContextProvider>
        </PauseContextProvider>
      </ToastContextProvider>
    </div>
  )
}

export default App
