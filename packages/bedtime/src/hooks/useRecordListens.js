import { useState } from 'preact/hooks'
import { recordListen } from '../util/BedtimeClient'

export const useRecordListens = (position, listenId, trackId, listenThresholdSec) => {
  const [lastListenId, setLastListenId] = useState(null)

  if (position > listenThresholdSec && listenId !== lastListenId) {
    setLastListenId(listenId)
    console.log('RECORDING PLAY!')
    recordListen(trackId)
  }
}
