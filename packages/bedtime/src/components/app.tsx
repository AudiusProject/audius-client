import { h } from 'preact'
import { useEffect } from 'preact/hooks'
import AudioStream from '../audio/AudioStream'
import { getCollection, getTrack } from '../util/BedtimeClient'

if ((module as any).hot) {
    // tslint:disable-next-line:no-var-requires
    require('preact/debug')
}

const audio = new AudioStream()

const getRequestDataFromPath = () => {
  const { pathname } = window.location
}

const App = () => {
  // TODO: unhardcode this
  /* const trackId = 6000
   * const ownerId = 6932 */
  const trackId = 619
  const ownerId = 5708

  useEffect(() => {
    (async () => {
      const col = await getCollection(trackId, ownerId)
      console.log(col)
      /* const track = await getTrack(trackId, ownerId)
       * console.log('track is:', track) */

      // TODO: Add the extra info here
      audio.load(col.tracks[0].segments)
    })()
  })

  return (
    <div id='app'>
      This is my preact app
      <button onClick={() => audio.play() }>Play</button>
    </div>
  )
}

export default App

