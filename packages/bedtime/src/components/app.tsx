import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import AudioStream from '../audio/AudioStream'
import { getCollection, getTrack } from '../util/BedtimeClient'

if ((module as any).hot) {
    // tslint:disable-next-line:no-var-requires
    require('preact/debug')
}

const enum RequestType {
  TRACK = 'track',
  COLLECTION = 'collection'
}

const enum PlayerFlavor {
  CARD = 'card',
  COMPACT = 'compact'
}

const audio = new AudioStream()

// Returns null if the URL scheme was invalid
const getRequestDataFromURL = () => {
  const pathName = window.location.pathname.split('/')[1]

  // Pull off the request type
  let requestType: RequestType
  if (pathName === RequestType.COLLECTION) {
    requestType = RequestType.COLLECTION
  } else if (pathName === RequestType.TRACK) {
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
  // TODO: unhardcode this
  /* const trackId = 6000
   * const ownerId = 6932 */
  const trackId = 619
  const ownerId = 5708

  const [didError, setDidError] = useState(false)
  const [requestState, setRequestState] = useState<RequestState | null>(null)

  useEffect(() => {
    const request = getRequestDataFromURL()
    if (!request) {
      console.error('bad req')
      setDidError(true)
      return
    }
    console.log('settin')
    setRequestState(request)
  }, [])

  useEffect(() => {
    const callback = async () => {
      if (requestState?.requestType === RequestType.TRACK) {
        const track = await getTrack(requestState.id, requestState.ownerId)
        console.log(JSON.stringify(track))
      } else if (requestState?.requestType === RequestType.COLLECTION) {
        const collection = await getCollection(requestState.id, requestState.ownerId)
        console.log(JSON.stringify(collection))
      }
    }

    callback()
  }, [requestState])

  return (
    <div id='app'>
      This is my preact app
      <button onClick={() => audio.play() }>Play</button>
    </div>
  )
}

export default App

