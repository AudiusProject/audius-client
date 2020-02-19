import { h } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { getCollection, GetCollectionsResponse, getTrack, GetTracksResponse } from '../util/BedtimeClient'
import CollectionPlayerContainer from './collection/CollectionPlayerContainer'
import TrackPlayerContainer from './track/TrackPlayerContainer'

import styles from './App.module.css'
import { ToastContextProvider } from './toast/ToastContext'

if ((module as any).hot) {
    // tslint:disable-next-line:no-var-requires
    require('preact/debug')
}

const enum RequestType {
  TRACK = 'track',
  COLLECTION = 'collection'
}

export enum PlayerFlavor {
  CARD = 'card',
  COMPACT = 'compact'
}

// Returns null if the URL scheme was invalid
const getRequestDataFromURL = () => {
  console.log('Getting request!')
  console.log(window.location.pathname)
  const components = window.location.pathname.split('/')
  const lastComponent = components[components.length - 1]

  // Pull off the request type
  let requestType: RequestType
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
  const [intId, intOwnerId] = [parseInt(id!), parseInt(ownerId!)]
  if (isNaN(intId) || isNaN(intOwnerId)) {
    return null
  }
  let playerFlavor: PlayerFlavor
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

interface RequestState {
  requestType: RequestType,
  playerFlavor: PlayerFlavor,
  id: number,
  ownerId: number
}

const App = () => {
  const [didError, setDidError] = useState(false)
  const [requestState, setRequestState] = useState<RequestState | null>(null)
  const [tracksResponse, setTracksResponse] = useState<GetTracksResponse | null>(null)
  const [collectionsResponse, setCollectionsResponse] = useState<GetCollectionsResponse | null>(null)

  // TODO: pull these out into separate functions?
  const requestMetadata = useCallback(async (request: RequestState) => {
    console.log('Requesting metadata')
    try {
      if (request.requestType === RequestType.TRACK) {
        const track = await getTrack(request.id, request.ownerId)
        console.log('Got track')
        console.log(JSON.stringify(track))
        setTracksResponse(track)
      } else if (request.requestType === RequestType.COLLECTION) {
        console.log('Got coll')
        const collection = await getCollection(request.id, request.ownerId)
        setCollectionsResponse(collection)
        console.log(JSON.stringify(collection))
      }
    } catch (e) {
      setDidError(true)
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


  const renderPlayerContainer = () => {
    if (didError) {
      return <div>"This is the error div"</div>
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

  return (
    <div id='app' className={styles.app}>
      <ToastContextProvider>
        {renderPlayerContainer()}
      </ToastContextProvider>
    </div>
  )
}

export default App
