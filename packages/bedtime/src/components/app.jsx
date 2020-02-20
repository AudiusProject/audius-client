import { h } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { getCollection, GetCollectionsResponse, getTrack, GetTracksResponse } from '../util/BedtimeClient'
import CollectionPlayerContainer from './collection/CollectionPlayerContainer'
import TrackPlayerContainer from './track/TrackPlayerContainer'
import Error from './error/Error'
import cn from 'classnames'

import styles from './App.module.css'
import { ToastContextProvider } from './toast/ToastContext'

if ((module).hot) {
    // tslint:disable-next-line:no-var-requires
    require('preact/debug')
}

const RequestType = Object.seal({
  TRACK: 'track',
  COLLECTION: 'collection'
})

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
  let requestType
  if (lastComponent === RequestType.COLLECTION) {
    requestType = RequestType.COLLECTION
  } else if (lastComponent === RequestType.TRACK) {
    requestType = RequestType.TRACK
  } else {
    return null
  }

  // Pull off the seach params
  const searchParams = new URLSearchParams(window.location.search)
  const [id, ownerId, flavor] = [searchParams.get('id'), searchParams.get('ownerId'), searchParams.get('flavor')]

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
    ownerId: intOwnerId
  }
}

// interface RequestState {
//   requestType: RequestType,
//   playerFlavor: PlayerFlavor,
//   id: number,
//   ownerId: number
// }

const App = () => {
  const [didError, setDidError] = useState(false)
  const [did404, setDid404] = useState(false)
  const [requestState, setRequestState] = useState(null)
  const [tracksResponse, setTracksResponse] = useState(null)
  const [collectionsResponse, setCollectionsResponse] = useState(null)

  // TODO: pull these out into separate functions?
  const requestMetadata = useCallback(async (request) => {
    console.log('Requesting metadata')
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
      setDidError(false)
    } catch (e) {
      setDidError(true)
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


  const renderPlayerContainer = () => {
    if (didError) {
      return (
        <Error
          onRetry={retryRequestMetadata}
          isRetrying={isRetrying}
        />
      )
    }

    if (tracksResponse && requestState) {
      console.log('trying to render the tracks container')
      return (<TrackPlayerContainer
        track={tracksResponse}
        flavor={requestState.playerFlavor}
      />)
    }

    if (collectionsResponse && requestState) {
      return (<CollectionPlayerContainer
        collection={collectionsResponse}
        flavor={requestState.playerFlavor}
      />)
    }

    return null
  }

  const isCompact = requestState && requestState.playerFlavor && requestState.playerFlavor === PlayerFlavor.COMPACT

  return (
    <div id='app' className={cn(styles.app, { [styles.compactApp]: isCompact })}>
      <ToastContextProvider>
        {renderPlayerContainer()}
      </ToastContextProvider>
    </div>
  )
}

export default App
